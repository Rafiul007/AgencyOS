import { Box, Divider, Stack, Typography } from '@mui/material';
import type { QuoteTemplate } from '@agencyos/shared';
import { formatMinor } from '@/lib/money';
import { templateStyle } from '../constant/templateStyles';
import type { IQuoteDocumentData, IQuoteTemplateStyle } from '../interface';

function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('en-GB') : '—';
}

interface QuoteDocumentProps {
  data: IQuoteDocumentData;
  template: QuoteTemplate;
}

/**
 * Renders a full quotation document in the given template. All five templates share this
 * one component — they differ only through the style tokens in `templateStyle` (DRY + O/C).
 */
export function QuoteDocument({ data, template }: QuoteDocumentProps) {
  const s = templateStyle(template);
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
      <DocumentHeader data={data} s={s} />

      <Box sx={{ px: { xs: 3, md: 5 }, py: { xs: 3, md: 4 } }}>
        <MetaRow data={data} s={s} />
        <LineItemsTable data={data} s={s} />
        <Totals data={data} s={s} />
        <Notes data={data} s={s} />
        <SignatureFooter data={data} s={s} />
      </Box>
    </Box>
  );
}

// ---- Header (one layout per template) --------------------------------------

function DocumentHeader({ data, s }: { data: IQuoteDocumentData; s: IQuoteTemplateStyle }) {
  const title = s.titleUpper ? 'QUOTATION' : 'Quotation';

  if (s.headerVariant === 'plain') {
    return (
      <Box sx={{ px: { xs: 3, md: 5 }, pt: { xs: 4, md: 5 }, pb: 2 }}>
        <Typography
          sx={{ letterSpacing: 4, textTransform: 'uppercase', fontSize: 12, color: s.inkSoft }}
        >
          {data.agencyName}
        </Typography>
        <Typography sx={{ fontWeight: s.titleWeight, fontSize: 34, mt: 1, color: s.ink }}>
          {title}
        </Typography>
        <Typography sx={{ color: s.inkSoft, mt: 0.5 }}>{data.number}</Typography>
        <Box sx={{ height: 2, background: s.ink, width: 48, mt: 2 }} />
      </Box>
    );
  }

  if (s.headerVariant === 'gradient') {
    return (
      <Box sx={{ p: { xs: 3, md: 5 }, background: s.headerBg, color: s.onAccent }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography sx={{ opacity: 0.85, fontWeight: 600 }}>{data.agencyName}</Typography>
            <Typography sx={{ fontWeight: s.titleWeight, fontSize: 40, lineHeight: 1.1, mt: 0.5 }}>
              {title}
            </Typography>
          </Box>
          <Box
            sx={{
              px: 2,
              py: 1,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.18)',
              fontWeight: 700,
            }}
          >
            {data.number}
          </Box>
        </Stack>
      </Box>
    );
  }

  if (s.headerVariant === 'block') {
    return (
      <Stack direction="row">
        <Box sx={{ width: 8, background: s.accent }} />
        <Box
          sx={{
            flex: 1,
            p: { xs: 3, md: 4 },
            background: s.headerBg,
            color: s.onAccent,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: 22, letterSpacing: 0.5 }}>
            {data.agencyName}
          </Typography>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontWeight: s.titleWeight, letterSpacing: 3 }}>{title}</Typography>
            <Typography sx={{ opacity: 0.8, fontSize: 14 }}>{data.number}</Typography>
          </Box>
        </Box>
      </Stack>
    );
  }

  if (s.headerVariant === 'banner') {
    return (
      <Box sx={{ px: { xs: 3, md: 5 }, py: { xs: 4, md: 5 }, background: s.headerBg }}>
        <Typography sx={{ color: s.accent, fontWeight: 700, letterSpacing: 3, fontSize: 13 }}>
          {data.agencyName.toUpperCase()}
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ sm: 'flex-end' }}
          sx={{ mt: 1 }}
        >
          <Typography
            sx={{ color: s.onAccent, fontWeight: s.titleWeight, fontSize: 52, lineHeight: 1 }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              mt: { xs: 1.5, sm: 0 },
              px: 2,
              py: 0.75,
              background: s.accent,
              color: s.onAccent,
              fontWeight: 800,
            }}
          >
            {data.number}
          </Box>
        </Stack>
      </Box>
    );
  }

  // 'bar' (classic)
  return (
    <Box
      sx={{
        px: { xs: 3, md: 5 },
        py: 3,
        background: s.headerBg,
        color: s.onAccent,
        borderBottom: `3px solid ${s.accent}`,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontWeight: 700, fontSize: 22 }}>{data.agencyName}</Typography>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontWeight: s.titleWeight, letterSpacing: 2, color: s.accent }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 13, opacity: 0.85 }}>{data.number}</Typography>
        </Box>
      </Stack>
    </Box>
  );
}

// ---- Shared body sections (styled by tokens) -------------------------------

function MetaRow({ data, s }: { data: IQuoteDocumentData; s: IQuoteTemplateStyle }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography sx={{ fontSize: 12, color: s.inkSoft, textTransform: 'uppercase', mb: 0.5 }}>
          Billed to
        </Typography>
        <Typography sx={{ fontWeight: 700, color: s.ink }}>
          {data.clientName ?? 'Your client'}
        </Typography>
      </Box>
      <Stack spacing={0.5} sx={{ textAlign: { sm: 'right' } }}>
        <Meta label="Issued" value={fmtDate(data.issueDate)} s={s} />
        <Meta label="Valid till" value={fmtDate(data.expiresAt)} s={s} />
      </Stack>
    </Stack>
  );
}

function Meta({ label, value, s }: { label: string; value: string; s: IQuoteTemplateStyle }) {
  return (
    <Typography sx={{ fontSize: 13, color: s.inkSoft }}>
      {label}: <span style={{ color: s.ink, fontWeight: 600 }}>{value}</span>
    </Typography>
  );
}

function LineItemsTable({ data, s }: { data: IQuoteDocumentData; s: IQuoteTemplateStyle }) {
  const cell = { padding: '10px 12px', fontSize: 14 } as const;
  return (
    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', mb: 2 }}>
      <Box component="thead">
        <Box component="tr" sx={{ background: s.tableHeadBg }}>
          <Box component="th" sx={{ ...cell, textAlign: 'left', color: s.tableHeadText }}>
            Description
          </Box>
          <Box
            component="th"
            sx={{ ...cell, textAlign: 'center', color: s.tableHeadText, width: 60 }}
          >
            Qty
          </Box>
          <Box
            component="th"
            sx={{ ...cell, textAlign: 'right', color: s.tableHeadText, width: 120 }}
          >
            Unit
          </Box>
          <Box
            component="th"
            sx={{ ...cell, textAlign: 'right', color: s.tableHeadText, width: 130 }}
          >
            Amount
          </Box>
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
            <Box component="td" sx={{ ...cell, color: s.ink }}>
              {line.description}
            </Box>
            <Box component="td" sx={{ ...cell, textAlign: 'center', color: s.inkSoft }}>
              {line.quantity}
            </Box>
            <Box component="td" sx={{ ...cell, textAlign: 'right', color: s.inkSoft }}>
              {formatMinor(line.unitPriceMinor, data.currency)}
            </Box>
            <Box component="td" sx={{ ...cell, textAlign: 'right', color: s.ink, fontWeight: 600 }}>
              {formatMinor(line.lineTotalMinor, data.currency)}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function Totals({ data, s }: { data: IQuoteDocumentData; s: IQuoteTemplateStyle }) {
  return (
    <Stack alignItems="flex-end" sx={{ mb: 3 }}>
      <Box sx={{ width: { xs: '100%', sm: 300 } }}>
        <TotalRow label="Subtotal" value={formatMinor(data.subtotalMinor, data.currency)} s={s} />
        {data.discountMinor > 0 && (
          <TotalRow
            label="Discount"
            value={`- ${formatMinor(data.discountMinor, data.currency)}`}
            s={s}
          />
        )}
        {data.taxMinor > 0 && (
          <TotalRow
            label={`VAT (${data.taxRatePercent}%)`}
            value={formatMinor(data.taxMinor, data.currency)}
            s={s}
          />
        )}
        <Box
          sx={{
            mt: 1.5,
            px: 2,
            py: 1.5,
            borderRadius: `${Math.min(s.radius, 12)}px`,
            background: s.panel,
            borderLeft: `4px solid ${s.accent}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontWeight: 700, color: s.ink }}>Total</Typography>
          <Typography sx={{ fontWeight: 800, fontSize: 20, color: s.accent }}>
            {formatMinor(data.totalMinor, data.currency)}
          </Typography>
        </Box>
      </Box>
    </Stack>
  );
}

function TotalRow({ label, value, s }: { label: string; value: string; s: IQuoteTemplateStyle }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
      <Typography sx={{ color: s.inkSoft }}>{label}</Typography>
      <Typography sx={{ color: s.ink }}>{value}</Typography>
    </Stack>
  );
}

function Notes({ data, s }: { data: IQuoteDocumentData; s: IQuoteTemplateStyle }) {
  if (!data.note && !data.terms) return null;
  return (
    <Box>
      {data.note && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 700, color: s.ink, mb: 0.5 }}>Note</Typography>
          <Typography sx={{ color: s.inkSoft, whiteSpace: 'pre-wrap' }}>{data.note}</Typography>
        </Box>
      )}
      {data.terms && (
        <Box>
          <Typography sx={{ fontWeight: 700, color: s.ink, mb: 0.5 }}>
            Terms &amp; conditions
          </Typography>
          <Typography sx={{ color: s.inkSoft, whiteSpace: 'pre-wrap' }}>{data.terms}</Typography>
        </Box>
      )}
    </Box>
  );
}

function SignatureFooter({ data, s }: { data: IQuoteDocumentData; s: IQuoteTemplateStyle }) {
  if (!data.signerName) return null;
  return (
    <>
      <Divider sx={{ my: 3, borderColor: s.border }} />
      <Box>
        <Typography sx={{ fontSize: 12, color: s.inkSoft, textTransform: 'uppercase' }}>
          Approved &amp; signed
        </Typography>
        <Typography sx={{ fontFamily: 'cursive', fontSize: 26, color: s.accent, mt: 0.5 }}>
          {data.signerName}
        </Typography>
        <Typography sx={{ fontSize: 13, color: s.inkSoft }}>
          {data.respondedAt ? fmtDate(data.respondedAt) : ''}
        </Typography>
      </Box>
    </>
  );
}
