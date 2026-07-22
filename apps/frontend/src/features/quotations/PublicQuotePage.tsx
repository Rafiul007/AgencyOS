import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { IApiError, IQuote } from '@agencyos/shared';
import { downloadQuotePdf } from '@/lib/quotePdf';
import { PAGE_GRADIENT, INK, INK_SOFT } from '@/features/landing/constant/landingTheme';
import { approvePublicQuote, fetchPublicQuote, rejectPublicQuote } from './api';
import { STATUS_COLORS, STATUS_LABELS } from './constant/quoteOptions';
import { QuoteDocument } from './components/QuoteDocument';
import { publicQuoteToDocument } from './documentData';

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

        {/* The quotation itself, rendered in the tenant's chosen template. */}
        <Box sx={{ boxShadow: '0 18px 40px -18px rgba(27,28,57,0.28)', borderRadius: 2 }}>
          <QuoteDocument data={publicQuoteToDocument(quote)} template={quote.template} />
        </Box>

        <Paper
          elevation={0}
          sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, mt: 3, border: 1, borderColor: 'divider' }}
        >
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
