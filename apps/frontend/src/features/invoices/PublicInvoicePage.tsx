import { Box, Button, Chip, CircularProgress, Container, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { InvoiceStatus, type IInvoice } from '@agencyos/shared';
import { downloadInvoicePdf } from '@/lib/invoicePdf';
import { PAGE_GRADIENT, INK, INK_SOFT } from '@/features/landing/constant/landingTheme';
import { fetchPublicInvoice } from './api';
import { InvoiceDocument } from './components/InvoiceDocument';
import { publicInvoiceToDocument } from './documentData';
import { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS } from './constant/invoiceOptions';

export function PublicInvoicePage() {
  const { token } = useParams<{ token: string }>();
  const {
    data: invoice,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['public-invoice', token],
    queryFn: () => fetchPublicInvoice(token as string),
    enabled: Boolean(token),
    retry: false,
  });

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (isError || !invoice) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
        <Typography color={INK_SOFT}>
          This invoice link is invalid or no longer available.
        </Typography>
      </Box>
    );
  }

  const overdue = invoice.isOverdue && invoice.status !== InvoiceStatus.PAID;
  // The public shape carries everything the PDF needs.
  const pdfData = { ...invoice, id: '', clientId: null, quoteId: null } as unknown as IInvoice;

  return (
    <Box sx={{ minHeight: '100vh', background: PAGE_GRADIENT, py: { xs: 3, md: 6 } }}>
      <Container maxWidth="md">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={800} color={INK}>
            {invoice.agencyName}
          </Typography>
          <Chip
            label={overdue ? 'Overdue' : INVOICE_STATUS_LABELS[invoice.status]}
            color={overdue ? 'error' : INVOICE_STATUS_COLORS[invoice.status]}
          />
        </Stack>

        <Box sx={{ boxShadow: '0 18px 40px -18px rgba(27,28,57,0.28)', borderRadius: 2 }}>
          <InvoiceDocument data={publicInvoiceToDocument(invoice)} template={invoice.template} />
        </Box>

        <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => downloadInvoicePdf(pdfData, invoice.agencyName)}
          >
            Download PDF
          </Button>
        </Stack>

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
