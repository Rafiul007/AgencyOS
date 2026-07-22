import { Box } from '@mui/material';
import type { QuoteTemplate } from '@agencyos/shared';
import { SAMPLE_QUOTE } from '../constant/sampleQuote';
import type { IQuoteDocumentData } from '../interface';
import { QuoteDocument } from './QuoteDocument';

interface TemplatePreviewProps {
  template: QuoteTemplate;
  /** Preview data (defaults to the sample quote). */
  data?: IQuoteDocumentData;
  /** Render scale — the full document is drawn at a fixed width and scaled down. */
  scale?: number;
  /** Visible height of the preview window; the doc is clipped to it. */
  height?: number;
}

const DOC_WIDTH = 760;

/**
 * A scaled, non-interactive thumbnail of a template. It renders the real `QuoteDocument`
 * inside a scaled window so previews always match the live output (single source of truth).
 */
export function TemplatePreview({
  template,
  data = SAMPLE_QUOTE,
  scale = 0.42,
  height = 300,
}: TemplatePreviewProps) {
  return (
    <Box
      sx={{
        height,
        overflow: 'hidden',
        background: '#f4f5fa',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          width: DOC_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
        }}
      >
        <QuoteDocument template={template} data={data} />
      </Box>
    </Box>
  );
}
