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
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { InvoiceStatus, QUOTE_TEMPLATES, type QuoteTemplate } from '@agencyos/shared';
import { formatMinor } from '@/lib/money';
import { downloadInvoicePdf } from '@/lib/invoicePdf';
import { Icons } from '@/lib/iconHash';
import { brand } from '@/lib/theme';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { fetchOnboardingState } from '@/features/onboarding/api';
import {
  useInvoice,
  useSendInvoice,
  useVoidInvoice,
  useDeleteInvoice,
  useUpdateInvoiceTemplate,
} from './hooks';
import { InvoiceDocument } from './components/InvoiceDocument';
import { RecordPaymentDialog } from './components/RecordPaymentDialog';
import { invoiceToDocument } from './documentData';
import {
  INVOICE_EVENT_LABELS,
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from './constant/invoiceOptions';

function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('en-GB') : '—';
}
function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB');
}

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: invoice, isLoading } = useInvoice(id);
  const { data: onboarding } = useQuery({
    queryKey: ['onboarding'],
    queryFn: fetchOnboardingState,
  });
  const sendInvoice = useSendInvoice();
  const voidInvoice = useVoidInvoice();
  const deleteInvoice = useDeleteInvoice();
  const updateTemplate = useUpdateInvoiceTemplate();
  const [payOpen, setPayOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (isLoading || !invoice) {
    return (
      <DashboardLayout title="Invoice">
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  const agencyName = onboarding?.tenant.name ?? 'AgencyOS';
  const publicUrl = invoice.publicToken
    ? `${window.location.origin}/i/${invoice.publicToken}`
    : null;
  const overdue = invoice.isOverdue && invoice.status !== InvoiceStatus.PAID;
  const canPay = invoice.status !== InvoiceStatus.PAID && invoice.status !== InvoiceStatus.VOID;
  const canVoid = invoice.status !== InvoiceStatus.PAID && invoice.status !== InvoiceStatus.VOID;
  const isDraft = invoice.status === InvoiceStatus.DRAFT;

  const copyLink = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };
  const shareWhatsApp = async () => {
    const win = window.open('', '_blank');
    let url = publicUrl;
    if (!invoice.publicToken) {
      const sent = await sendInvoice.mutateAsync(invoice.id);
      url = `${window.location.origin}/i/${sent.publicToken}`;
    }
    const msg = `Invoice ${invoice.number} from ${agencyName}\nTotal: ${formatMinor(invoice.totalMinor, invoice.currency)}\nBalance due: ${formatMinor(invoice.balanceMinor, invoice.currency)}${url ? `\nView: ${url}` : ''}`;
    const href = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    if (win) win.location.href = href;
    else window.open(href, '_blank');
  };
  const handleVoid = () => {
    if (window.confirm(`Void invoice ${invoice.number}? This cannot be undone.`)) {
      voidInvoice.mutate(invoice.id);
    }
  };
  const handleDelete = () => {
    if (window.confirm(`Delete draft ${invoice.number}?`)) {
      deleteInvoice.mutate(invoice.id, { onSuccess: () => navigate('/invoices') });
    }
  };

  return (
    <DashboardLayout title={invoice.number}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="outlined"
            onClick={() => navigate('/invoices')}
            sx={{ minWidth: 0, px: 1.5 }}
          >
            ←
          </Button>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="h4" fontWeight={800} color={brand.ink}>
                {invoice.number}
              </Typography>
              <Chip
                size="small"
                label={overdue ? 'Overdue' : INVOICE_STATUS_LABELS[invoice.status]}
                color={overdue ? 'error' : INVOICE_STATUS_COLORS[invoice.status]}
                variant={overdue ? 'filled' : 'outlined'}
              />
            </Stack>
            <Typography color={brand.inkSoft}>
              {invoice.clientName ?? 'No client'}
              {invoice.quoteNumber ? ` · from quote ${invoice.quoteNumber}` : ''}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
          <TextField
            select
            size="small"
            value={invoice.template}
            onChange={(e) =>
              updateTemplate.mutate({ id: invoice.id, template: e.target.value as QuoteTemplate })
            }
            disabled={updateTemplate.isPending}
            InputProps={{
              startAdornment: (
                <Icons.Templates sx={{ fontSize: 18, mr: 0.75, color: brand.inkSoft }} />
              ),
            }}
            sx={{ minWidth: 168, '& .MuiInputBase-root': { borderRadius: 999, height: 40 } }}
          >
            {QUOTE_TEMPLATES.map((t) => (
              <MenuItem key={t.key} value={t.key}>
                {t.label}
              </MenuItem>
            ))}
          </TextField>
          {isDraft && (
            <>
              <Button
                variant="outlined"
                startIcon={<Icons.Edit />}
                onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                startIcon={<Icons.Send />}
                onClick={() => sendInvoice.mutate(invoice.id)}
                disabled={sendInvoice.isPending}
              >
                Send
              </Button>
            </>
          )}
          {canPay && (
            <Button
              variant="contained"
              startIcon={<Icons.Receipt />}
              onClick={() => setPayOpen(true)}
            >
              Record payment
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<Icons.Download />}
            onClick={() => downloadInvoicePdf(invoice, agencyName)}
          >
            PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<Icons.WhatsApp />}
            onClick={shareWhatsApp}
            sx={{ color: '#128C7E', '& .MuiButton-startIcon': { color: '#25D366' } }}
          >
            WhatsApp
          </Button>
          {canVoid && !isDraft && (
            <Button
              variant="outlined"
              onClick={handleVoid}
              sx={{ color: '#d32f2f', borderColor: 'rgba(211,47,47,0.35)' }}
            >
              Void
            </Button>
          )}
          {isDraft && (
            <Button
              variant="outlined"
              startIcon={<Icons.Delete />}
              onClick={handleDelete}
              sx={{ color: '#d32f2f', borderColor: 'rgba(211,47,47,0.35)' }}
            >
              Delete
            </Button>
          )}
        </Stack>
      </Stack>

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
        <Box sx={{ flex: 1, width: '100%' }}>
          <InvoiceDocument
            data={invoiceToDocument(invoice, agencyName)}
            template={invoice.template}
          />
        </Box>

        <Stack spacing={3} sx={{ width: { xs: '100%', md: 320 } }}>
          {/* Payment summary */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
            <Row label="Total" value={formatMinor(invoice.totalMinor, invoice.currency)} />
            <Row label="Paid" value={formatMinor(invoice.amountPaidMinor, invoice.currency)} />
            <Divider sx={{ my: 1.5 }} />
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight={800} color={brand.ink}>
                Balance
              </Typography>
              <Typography fontWeight={800} color={invoice.balanceMinor > 0 ? brand.ink : '#16a34a'}>
                {formatMinor(invoice.balanceMinor, invoice.currency)}
              </Typography>
            </Stack>
          </Paper>

          {/* Payments */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
            <Typography fontWeight={700} color={brand.ink} sx={{ mb: 1.5 }}>
              Payments ({invoice.payments?.length ?? 0})
            </Typography>
            {(invoice.payments ?? []).length === 0 ? (
              <Typography variant="body2" color={brand.inkSoft}>
                No payments recorded yet.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {(invoice.payments ?? []).map((p) => (
                  <Box key={p.id}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={700} color={brand.ink}>
                        {formatMinor(p.amountMinor, invoice.currency)}
                      </Typography>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={PAYMENT_METHOD_LABELS[p.method]}
                      />
                    </Stack>
                    <Typography variant="caption" color={brand.inkSoft}>
                      {fmtDate(p.paidAt)}
                      {p.reference ? ` · ref ${p.reference}` : ''}
                      {p.recordedByName ? ` · ${p.recordedByName}` : ''}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>

          {/* Timeline */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
            <Typography fontWeight={700} color={brand.ink} sx={{ mb: 1.5 }}>
              Activity
            </Typography>
            <Stack spacing={1.5}>
              {(invoice.events ?? []).map((e) => (
                <Box key={e.id}>
                  <Typography variant="body2" color={brand.ink} fontWeight={600}>
                    {INVOICE_EVENT_LABELS[e.type] ?? e.type}
                    {e.message ? ` · ${e.message}` : ''}
                  </Typography>
                  <Typography variant="caption" color={brand.inkSoft}>
                    {fmtDateTime(e.createdAt)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Stack>
      </Stack>

      <RecordPaymentDialog
        open={payOpen}
        invoiceId={invoice.id}
        balanceMinor={invoice.balanceMinor}
        currency={invoice.currency}
        onClose={() => setPayOpen(false)}
      />
    </DashboardLayout>
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
