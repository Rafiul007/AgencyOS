import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { QUOTE_TEMPLATES, type QuoteStatus, type QuoteTemplate } from '@agencyos/shared';
import { formatMinor } from '@/lib/money';
import { downloadQuotePdf } from '@/lib/quotePdf';
import { Icons } from '@/lib/iconHash';
import { brand } from '@/lib/theme';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { fetchOnboardingState } from '@/features/onboarding/api';
import {
  useQuote,
  useDeleteQuote,
  useSendQuote,
  useUpdateQuoteStatus,
  useUpdateQuoteTemplate,
} from './hooks';
import { EVENT_LABELS, NEXT_STATUSES, STATUS_COLORS, STATUS_LABELS } from './constant/quoteOptions';
import { QuoteDocument } from './components/QuoteDocument';
import { quoteToDocument } from './documentData';
import { buildQuoteShareMessage } from './share';
import { useCreateInvoiceFromQuote } from '@/features/invoices/hooks';

function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('en-GB') : '—';
}
function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB');
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
  const updateTemplate = useUpdateQuoteTemplate();
  const sendQuote = useSendQuote();
  const deleteQuote = useDeleteQuote();
  const convertToInvoice = useCreateInvoiceFromQuote();
  const [copied, setCopied] = useState(false);

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
  const publicUrl = quote.publicToken ? `${window.location.origin}/q/${quote.publicToken}` : null;
  // Offer manual transitions except SENT (Send button) and CONVERTED (Convert-to-invoice button).
  const manualStatuses = (NEXT_STATUSES[quote.status] ?? []).filter(
    (s) => s !== 'SENT' && s !== 'CONVERTED',
  );
  const convert = () =>
    convertToInvoice.mutate(quote.id, {
      onSuccess: (invoice) => navigate(`/invoices/${invoice.id}`),
    });

  const setStatus = (status: QuoteStatus) => updateStatus.mutate({ id: quote.id, status });

  const copyLink = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = async () => {
    // Open the tab synchronously (inside the click) so popup blockers don't kill it,
    // then fill in the URL once we're sure the quote has a shareable approval link.
    const win = window.open('', '_blank');
    let token = quote.publicToken;
    if (!token) {
      try {
        const sent = await sendQuote.mutateAsync(quote.id);
        token = sent.publicToken;
      } catch {
        // Couldn't send — share the details without an approval link rather than nothing.
      }
    }
    const approvalUrl = token ? `${window.location.origin}/q/${token}` : null;
    const msg = buildQuoteShareMessage(quote, agencyName, approvalUrl);
    const href = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    if (win) {
      win.location.href = href;
    } else {
      window.open(href, '_blank');
    }
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

        <Stack
          direction="row"
          alignItems="center"
          justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
          flexWrap="wrap"
          useFlexGap
          sx={{ gap: 1.25 }}
        >
          {/* Template picker (label-less so it aligns with the buttons) */}
          <TextField
            select
            size="small"
            value={quote.template}
            onChange={(e) =>
              updateTemplate.mutate({ id: quote.id, template: e.target.value as QuoteTemplate })
            }
            disabled={updateTemplate.isPending}
            InputProps={{
              startAdornment: (
                <Icons.Templates sx={{ fontSize: 18, mr: 0.75, color: brand.inkSoft }} />
              ),
            }}
            sx={{
              minWidth: 176,
              '& .MuiInputBase-root': { borderRadius: 999, bgcolor: '#fff', height: 40 },
            }}
          >
            {QUOTE_TEMPLATES.map((tpl) => (
              <MenuItem key={tpl.key} value={tpl.key}>
                {tpl.label}
              </MenuItem>
            ))}
          </TextField>

          <Box
            sx={{
              width: '1px',
              alignSelf: 'stretch',
              my: 0.5,
              bgcolor: 'divider',
              display: { xs: 'none', md: 'block' },
            }}
          />

          {quote.status === 'DRAFT' && (
            <>
              <Button
                variant="outlined"
                startIcon={<Icons.Edit />}
                onClick={() => navigate(`/quotations/${quote.id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                startIcon={<Icons.Send />}
                onClick={() => sendQuote.mutate(quote.id)}
                disabled={sendQuote.isPending}
              >
                Send
              </Button>
            </>
          )}
          {quote.invoiceId ? (
            <Button
              variant="contained"
              startIcon={<Icons.Receipt />}
              onClick={() => navigate(`/invoices/${quote.invoiceId}`)}
            >
              View invoice {quote.invoiceNumber}
            </Button>
          ) : (
            (quote.status === 'ACCEPTED' || quote.status === 'CONVERTED') && (
              <Button
                variant="contained"
                startIcon={<Icons.Receipt />}
                onClick={convert}
                disabled={convertToInvoice.isPending}
              >
                Convert to invoice
              </Button>
            )
          )}
          {manualStatuses.map((status) => (
            <Button
              key={status}
              variant="contained"
              startIcon={<Icons.Check />}
              onClick={() => setStatus(status)}
              disabled={updateStatus.isPending}
            >
              Mark {STATUS_LABELS[status]}
            </Button>
          ))}
          <Button
            variant="outlined"
            startIcon={<Icons.Download />}
            onClick={() => downloadQuotePdf(quote, agencyName)}
          >
            PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<Icons.WhatsApp />}
            onClick={shareWhatsApp}
            disabled={sendQuote.isPending}
            sx={{ color: '#128C7E', '& .MuiButton-startIcon': { color: '#25D366' } }}
          >
            WhatsApp
          </Button>
          <Button
            variant="outlined"
            startIcon={<Icons.Delete />}
            onClick={handleDelete}
            sx={{
              color: '#d32f2f',
              borderColor: 'rgba(211,47,47,0.35)',
              '&:hover': {
                borderColor: '#d32f2f',
                backgroundColor: 'rgba(211,47,47,0.06)',
              },
            }}
          >
            Delete
          </Button>
        </Stack>
      </Stack>

      {/* Public link */}
      {publicUrl && (
        <Alert severity="info" sx={{ mb: 3 }} icon={false}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ sm: 'center' }}
          >
            <Typography variant="body2" sx={{ flexGrow: 1, wordBreak: 'break-all' }}>
              Client link: <strong>{publicUrl}</strong>
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={copied ? <Icons.Check /> : <Icons.Copy />}
              onClick={copyLink}
              sx={{ flexShrink: 0 }}
            >
              {copied ? 'Copied!' : 'Copy link'}
            </Button>
          </Stack>
        </Alert>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
        {/* Line items + meta */}
        <Paper
          elevation={0}
          sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider', flex: 1, width: '100%' }}
        >
          <Stack direction="row" spacing={4} sx={{ mb: 3 }}>
            <Meta label="Issued" value={fmtDate(quote.issueDate)} />
            <Meta label="Valid till" value={fmtDate(quote.expiresAt)} />
            {quote.signerName && <Meta label="Signed by" value={quote.signerName} />}
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

        {/* Totals + timeline */}
        <Stack spacing={3} sx={{ width: { xs: '100%', md: 300 } }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
            <Row label="Subtotal" value={formatMinor(quote.subtotalMinor, quote.currency)} />
            {quote.discountMinor > 0 && (
              <Row
                label="Discount"
                value={`- ${formatMinor(quote.discountMinor, quote.currency)}`}
              />
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

          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
            <Typography fontWeight={700} color={brand.ink} sx={{ mb: 1.5 }}>
              Activity
            </Typography>
            <Stack spacing={1.5}>
              {(quote.events ?? []).map((event) => (
                <Box key={event.id}>
                  <Typography variant="body2" color={brand.ink} fontWeight={600}>
                    {EVENT_LABELS[event.type] ?? event.type}
                    {event.actor ? ` · ${event.actor}` : ''}
                  </Typography>
                  <Typography variant="caption" color={brand.inkSoft}>
                    {fmtDateTime(event.createdAt)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Stack>
      </Stack>

      {/* Client-facing preview in the selected template */}
      <Box sx={{ mt: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Typography fontWeight={800} color={brand.ink}>
            Preview
          </Typography>
          <Typography variant="body2" color={brand.inkSoft}>
            How your client sees this quotation
          </Typography>
        </Stack>
        <QuoteDocument data={quoteToDocument(quote, agencyName)} template={quote.template} />
      </Box>
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
