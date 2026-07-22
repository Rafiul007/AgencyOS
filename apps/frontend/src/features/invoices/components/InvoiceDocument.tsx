import { Box, Divider, Stack, Typography } from '@mui/material';
import { InvoiceStatus, type QuoteTemplate } from '@agencyos/shared';
import { formatMinor } from '@/lib/money';
import { templateStyle } from '@/features/quotations/constant/templateStyles';
import type { IQuoteTemplateStyle } from '@/features/quotations/interface';
import { INVOICE_STATUS_LABELS } from '../constant/invoiceOptions';
import type { IInvoiceDocumentData } from '../interface';

function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('en-GB') : '—';
}

/** Renders a full invoice in the given template, reusing the quotation style tokens. */
export function InvoiceDocument({
  data,
  template,
}: {
  data: IInvoiceDocumentData;
  template: QuoteTemplate;
}) {
  const s = templateStyle(template);
  const title = s.titleUpper ? 'INVOICE' : 'Invoice';

  return (
    <Box
      sx={{
        fontFamily: s.fontFamily,
        color: s.ink,
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: `${s.radius}px`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: { xs: 3, md: 5 },
          py: 3,
          background: s.headerVariant === 'plain' ? 'transparent' : s.headerBg,
          color: s.headerVariant === 'plain' ? s.ink : s.onAccent,
          borderBottom:
            s.headerVariant === 'plain' ? `2px solid ${s.ink}` : `3px solid ${s.accent}`,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontWeight: 800, fontSize: 22 }}>{data.agencyName}</Typography>
          <Box sx={{ textAlign: 'right' }}>
            <Typography
              sx={{
                fontWeight: s.titleWeight,
                letterSpacing: 2,
                color: s.headerVariant === 'plain' ? s.ink : s.accent,
              }}
            >
              {title}
            </Typography>
            <Typography sx={{ fontSize: 13, opacity: 0.85 }}>{data.number}</Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 3, md: 5 }, py: { xs: 3, md: 4 } }}>
        {/* Meta */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography
              sx={{ fontSize: 12, color: s.inkSoft, textTransform: 'uppercase', mb: 0.5 }}
            >
              Billed to
            </Typography>
            <Typography sx={{ fontWeight: 700 }}>{data.clientName ?? 'Your client'}</Typography>
          </Box>
          <Stack spacing={0.5} sx={{ textAlign: { sm: 'right' } }}>
            <Meta label="Issued" value={fmtDate(data.issueDate)} s={s} />
            <Meta label="Due" value={fmtDate(data.dueDate)} s={s} />
            <Box sx={{ mt: 0.5 }}>
              <Box
                component="span"
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: 12,
                  fontWeight: 700,
                  color: s.onAccent,
                  bgcolor:
                    data.status === InvoiceStatus.PAID
                      ? '#22c55e'
                      : data.isOverdue
                        ? '#ef4444'
                        : s.accent,
                }}
              >
                {data.isOverdue && data.status !== InvoiceStatus.PAID
                  ? 'OVERDUE'
                  : INVOICE_STATUS_LABELS[data.status].toUpperCase()}
              </Box>
            </Box>
          </Stack>
        </Stack>

        {/* Line items */}
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', mb: 2 }}>
          <Box component="thead">
            <Box component="tr" sx={{ background: s.tableHeadBg }}>
              {['Description', 'Qty', 'Unit', 'Amount'].map((h, i) => (
                <Box
                  key={h}
                  component="th"
                  sx={{
                    padding: '10px 12px',
                    fontSize: 14,
                    color: s.tableHeadText,
                    textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right',
                  }}
                >
                  {h}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {data.lineItems.map((line, i) => (
              <Box
                component="tr"
                key={line.id}
                sx={{
                  background: s.stripedRows && i % 2 === 1 ? s.panel : 'transparent',
                  borderBottom: `1px solid ${s.border}`,
                }}
              >
                <Box component="td" sx={{ padding: '10px 12px', fontSize: 14 }}>
                  {line.description}
                </Box>
                <Box
                  component="td"
                  sx={{ padding: '10px 12px', fontSize: 14, textAlign: 'center', color: s.inkSoft }}
                >
                  {line.quantity}
                </Box>
                <Box
                  component="td"
                  sx={{ padding: '10px 12px', fontSize: 14, textAlign: 'right', color: s.inkSoft }}
                >
                  {formatMinor(line.unitPriceMinor, data.currency)}
                </Box>
                <Box
                  component="td"
                  sx={{ padding: '10px 12px', fontSize: 14, textAlign: 'right', fontWeight: 600 }}
                >
                  {formatMinor(line.lineTotalMinor, data.currency)}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Totals + balance */}
        <Stack alignItems="flex-end" sx={{ mb: 3 }}>
          <Box sx={{ width: { xs: '100%', sm: 320 } }}>
            <Row label="Subtotal" value={formatMinor(data.subtotalMinor, data.currency)} s={s} />
            {data.discountMinor > 0 && (
              <Row
                label="Discount"
                value={`- ${formatMinor(data.discountMinor, data.currency)}`}
                s={s}
              />
            )}
            {data.taxMinor > 0 && (
              <Row
                label={`VAT (${data.taxRatePercent}%)`}
                value={formatMinor(data.taxMinor, data.currency)}
                s={s}
              />
            )}
            <Divider sx={{ my: 1, borderColor: s.border }} />
            <Row label="Total" value={formatMinor(data.totalMinor, data.currency)} s={s} strong />
            {data.amountPaidMinor > 0 && (
              <Row
                label="Paid"
                value={`- ${formatMinor(data.amountPaidMinor, data.currency)}`}
                s={s}
              />
            )}
            <Box
              sx={{
                mt: 1,
                px: 2,
                py: 1.5,
                borderRadius: `${Math.min(s.radius, 12)}px`,
                background: s.panel,
                borderLeft: `4px solid ${data.balanceMinor === 0 ? '#22c55e' : s.accent}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>
                {data.balanceMinor === 0 ? 'Paid in full' : 'Balance due'}
              </Typography>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 20,
                  color: data.balanceMinor === 0 ? '#16a34a' : s.accent,
                }}
              >
                {formatMinor(data.balanceMinor, data.currency)}
              </Typography>
            </Box>
          </Box>
        </Stack>

        {/* Notes / terms */}
        {data.note && (
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Note</Typography>
            <Typography sx={{ color: s.inkSoft, whiteSpace: 'pre-wrap' }}>{data.note}</Typography>
          </Box>
        )}
        {data.terms && (
          <Box>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Terms &amp; conditions</Typography>
            <Typography sx={{ color: s.inkSoft, whiteSpace: 'pre-wrap' }}>{data.terms}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function Meta({ label, value, s }: { label: string; value: string; s: IQuoteTemplateStyle }) {
  return (
    <Typography sx={{ fontSize: 13, color: s.inkSoft }}>
      {label}: <span style={{ color: s.ink, fontWeight: 600 }}>{value}</span>
    </Typography>
  );
}

function Row({
  label,
  value,
  s,
  strong,
}: {
  label: string;
  value: string;
  s: IQuoteTemplateStyle;
  strong?: boolean;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
      <Typography sx={{ color: strong ? s.ink : s.inkSoft, fontWeight: strong ? 800 : 400 }}>
        {label}
      </Typography>
      <Typography sx={{ color: s.ink, fontWeight: strong ? 800 : 400 }}>{value}</Typography>
    </Stack>
  );
}
