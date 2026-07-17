// Landing-page visual tokens (kept local so the global app theme stays neutral).

export const INK = '#1b1c39';
export const INK_SOFT = '#5a5b7a';
export const ACCENT = '#ff7a59';

// Soft pastel page backdrop that fades to white, echoing the reference design.
export const PAGE_GRADIENT =
  'linear-gradient(180deg, #c9d6f5 0%, #ded9f4 18%, #f3dce8 36%, #ffffff 62%)';

export const HERO_PANEL_GRADIENT =
  'linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.45) 100%)';

export const CTA_GRADIENT = 'linear-gradient(135deg, #2b2d64 0%, #4b3fa7 60%, #6e56cf 100%)';

export const SOFT_SHADOW = '0 18px 40px -18px rgba(27,28,57,0.28)';
export const CARD_SHADOW = '0 8px 24px -12px rgba(27,28,57,0.18)';

// Reusable dark / light pill button styles.
export const darkButtonSx = {
  bgcolor: INK,
  color: '#fff',
  borderRadius: 999,
  textTransform: 'none',
  px: 2.5,
  fontWeight: 600,
  '&:hover': { bgcolor: '#26284d' },
} as const;

export const lightButtonSx = {
  bgcolor: '#fff',
  color: INK,
  borderRadius: 999,
  textTransform: 'none',
  px: 2.5,
  fontWeight: 600,
  border: '1px solid rgba(27,28,57,0.12)',
  '&:hover': { bgcolor: '#f5f6fb' },
} as const;
