import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
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
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { IApiError, IQuote } from '@agencyos/shared';
import { formatMinor } from '@/lib/money';
import { downloadQuotePdf } from '@/lib/quotePdf';
import { PAGE_GRADIENT, INK, INK_SOFT } from '@/features/landing/constant/landingTheme';
import { approvePublicQuote, fetchPublicQuote, rejectPublicQuote } from './api';
import { STATUS_COLORS, STATUS_LABELS } from './constant/quoteOptions';

function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('en-GB') : '—';
}

export function PublicQuotePage() {
  const { token } = useParams<{ token: string }>();
  const qc = useQueryClient();
  const [signerName, setSignerName] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const {
    data: quote,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['public-quote', token],
    queryFn: () => fetchPublicQuote(token as string),
    enabled: Boolean(token),
    retry: false,
  });

  const approve = useMutation({
    mutationFn: () => approvePublicQuote(token as string, signerName.trim()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['public-quote', token] }),
    onError: (e) => setError((e as unknown as IApiError)?.message ?? 'Could not approve'),
  });
  const reject = useMutation({
    mutationFn: () => rejectPublicQuote(token as string, reason.trim()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['public-quote', token] }),
    onError: (e) => setError((e as unknown as IApiError)?.message ?? 'Could not decline'),
  });

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (isError || !quote) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
        <Typography color={INK_SOFT}>
          This quotation link is invalid or no longer available.
        </Typography>
      </Box>
    );
  }

  const canRespond = quote.status === 'SENT';

  return (
    <Box sx={{ minHeight: '100vh', background: PAGE_GRADIENT, py: { xs: 3, md: 6 } }}>
      <Container maxWidth="md">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={800} color={INK}>
            {quote.agencyName}
          </Typography>
          <Chip
            label={STATUS_LABELS[quote.status] ?? quote.status}
            color={STATUS_COLORS[quote.status] ?? 'default'}
          />
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            boxShadow: '0 18px 40px -18px rgba(27,28,57,0.28)',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography variant="h4" fontWeight={800} color={INK}>
                Quotation {quote.number}
              </Typography>
              <Typography color={INK_SOFT}>For {quote.clientName ?? 'you'}</Typography>
            </Box>
            <Stack spacing={0.5} sx={{ textAlign: { sm: 'right' } }}>
              <Typography variant="body2" color={INK_SOFT}>
                Issued {fmtDate(quote.issueDate)}
              </Typography>
              <Typography variant="body2" color={INK_SOFT}>
                Valid till {fmtDate(quote.expiresAt)}
              </Typography>
            </Stack>
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
              {quote.lineItems.map((line) => (
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

          <Stack alignItems="flex-end" sx={{ mt: 2 }}>
            <Box sx={{ width: { xs: '100%', sm: 280 } }}>
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
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={800} color={INK}>
                  Total
                </Typography>
                <Typography fontWeight={800} color={INK}>
                  {formatMinor(quote.totalMinor, quote.currency)}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          {quote.note && (
            <Box sx={{ mt: 3 }}>
              <Typography fontWeight={700} color={INK}>
                Note
              </Typography>
              <Typography color={INK_SOFT}>{quote.note}</Typography>
            </Box>
          )}
          {quote.terms && (
            <Box sx={{ mt: 2 }}>
              <Typography fontWeight={700} color={INK}>
                Terms & conditions
              </Typography>
              <Typography color={INK_SOFT}>{quote.terms}</Typography>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Button
            variant="outlined"
            onClick={() => downloadQuotePdf(quote as unknown as IQuote, quote.agencyName)}
          >
            Download PDF
          </Button>

          {/* Respond */}
          {canRespond ? (
            <Box sx={{ mt: 3 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}
              <Typography fontWeight={700} color={INK} sx={{ mb: 1 }}>
                Approve this quotation
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ sm: 'center' }}
              >
                <TextField
                  size="small"
                  label="Type your full name to sign"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  variant="contained"
                  disabled={signerName.trim().length < 2 || approve.isPending}
                  onClick={() => {
                    setError(null);
                    approve.mutate();
                  }}
                >
                  Approve & sign
                </Button>
              </Stack>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ mt: 2 }}
                alignItems={{ sm: 'center' }}
              >
                <TextField
                  size="small"
                  label="Reason (optional)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  color="error"
                  disabled={reject.isPending}
                  onClick={() => {
                    setError(null);
                    reject.mutate();
                  }}
                >
                  Decline
                </Button>
              </Stack>
            </Box>
          ) : (
            <Alert severity={quote.status === 'ACCEPTED' ? 'success' : 'info'} sx={{ mt: 3 }}>
              {quote.status === 'ACCEPTED'
                ? `Approved by ${quote.signerName ?? 'the client'} on ${fmtDate(quote.respondedAt)}.`
                : quote.status === 'REJECTED'
                  ? 'This quotation was declined.'
                  : 'This quotation is not open for a response.'}
            </Alert>
          )}
        </Paper>

        <Typography
          variant="caption"
          color={INK_SOFT}
          sx={{ display: 'block', textAlign: 'center', mt: 2 }}
        >
          Powered by AgencyOS
        </Typography>
      </Container>
    </Box>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
      <Typography color={INK_SOFT}>{label}</Typography>
      <Typography color={INK}>{value}</Typography>
    </Stack>
  );
}
