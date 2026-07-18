import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { QuoteStatus } from '@agencyos/shared';
import { formatMinor } from '@/lib/money';
import { downloadQuotePdf } from '@/lib/quotePdf';
import { brand } from '@/lib/theme';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { fetchOnboardingState } from '@/features/onboarding/api';
import { useQuote, useDeleteQuote, useUpdateQuoteStatus } from './hooks';
import { NEXT_STATUSES, STATUS_COLORS, STATUS_LABELS } from './constant/quoteOptions';

function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('en-GB') : '—';
}

export function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: quote, isLoading } = useQuote(id);
  const { data: onboarding } = useQuery({
    queryKey: ['onboarding'],
    queryFn: fetchOnboardingState,
  });
  const updateStatus = useUpdateQuoteStatus();
  const deleteQuote = useDeleteQuote();

  if (isLoading || !quote) {
    return (
      <DashboardLayout title="Quotation">
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  const agencyName = onboarding?.tenant.name ?? 'AgencyOS';
  const nextStatuses = NEXT_STATUSES[quote.status] ?? [];

  const setStatus = (status: QuoteStatus) => updateStatus.mutate({ id: quote.id, status });

  const shareWhatsApp = () => {
    const msg = `Quotation ${quote.number} from ${agencyName}\nTotal: ${formatMinor(quote.totalMinor, quote.currency)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleDelete = () => {
    if (window.confirm(`Delete quotation ${quote.number}?`)) {
      deleteQuote.mutate(quote.id, { onSuccess: () => navigate('/quotations') });
    }
  };

  return (
    <DashboardLayout title={quote.number}>
      {/* Header + actions */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="outlined"
            onClick={() => navigate('/quotations')}
            sx={{ minWidth: 0, px: 1.5 }}
          >
            ←
          </Button>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="h4" fontWeight={800} color={brand.ink}>
                {quote.number}
              </Typography>
              <Chip
                label={STATUS_LABELS[quote.status]}
                size="small"
                color={STATUS_COLORS[quote.status] ?? 'default'}
                variant="outlined"
              />
            </Stack>
            <Typography color={brand.inkSoft}>{quote.clientName ?? 'No client'}</Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          <Button variant="outlined" onClick={() => downloadQuotePdf(quote, agencyName)}>
            Download PDF
          </Button>
          <Button variant="outlined" onClick={shareWhatsApp}>
            WhatsApp
          </Button>
          {nextStatuses.map((status) => (
            <Button
              key={status}
              variant="contained"
              onClick={() => setStatus(status)}
              disabled={updateStatus.isPending}
            >
              Mark {STATUS_LABELS[status]}
            </Button>
          ))}
          <Button variant="text" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
        {/* Line items + meta */}
        <Paper
          elevation={0}
          sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider', flex: 1, width: '100%' }}
        >
          <Stack direction="row" spacing={4} sx={{ mb: 3 }}>
            <Meta label="Issued" value={fmtDate(quote.issueDate)} />
            <Meta label="Valid till" value={fmtDate(quote.expiresAt)} />
          </Stack>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell align="center">Qty</TableCell>
                <TableCell align="right">Unit</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(quote.lineItems ?? []).map((line) => (
                <TableRow key={line.id}>
                  <TableCell>{line.description}</TableCell>
                  <TableCell align="center">{line.quantity}</TableCell>
                  <TableCell align="right">
                    {formatMinor(line.unitPriceMinor, quote.currency)}
                  </TableCell>
                  <TableCell align="right">
                    {formatMinor(line.lineTotalMinor, quote.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {quote.note && (
            <Box sx={{ mt: 3 }}>
              <Typography fontWeight={700} color={brand.ink}>
                Note
              </Typography>
              <Typography color={brand.inkSoft}>{quote.note}</Typography>
            </Box>
          )}
          {quote.terms && (
            <Box sx={{ mt: 2 }}>
              <Typography fontWeight={700} color={brand.ink}>
                Terms & conditions
              </Typography>
              <Typography color={brand.inkSoft}>{quote.terms}</Typography>
            </Box>
          )}
        </Paper>

        {/* Totals */}
        <Paper
          elevation={0}
          sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider', width: { md: 300 } }}
        >
          <Row label="Subtotal" value={formatMinor(quote.subtotalMinor, quote.currency)} />
          {quote.discountMinor > 0 && (
            <Row label="Discount" value={`- ${formatMinor(quote.discountMinor, quote.currency)}`} />
          )}
          {quote.taxMinor > 0 && (
            <Row
              label={`VAT (${quote.taxRatePercent}%)`}
              value={formatMinor(quote.taxMinor, quote.currency)}
            />
          )}
          <Divider sx={{ my: 1.5 }} />
          <Stack direction="row" justifyContent="space-between">
            <Typography fontWeight={800} color={brand.ink}>
              Total
            </Typography>
            <Typography fontWeight={800} color={brand.ink}>
              {formatMinor(quote.totalMinor, quote.currency)}
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </DashboardLayout>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color={brand.inkSoft}>
        {label}
      </Typography>
      <Typography color={brand.ink} fontWeight={600}>
        {value}
      </Typography>
    </Box>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
      <Typography color={brand.inkSoft}>{label}</Typography>
      <Typography color={brand.ink}>{value}</Typography>
    </Stack>
  );
}
