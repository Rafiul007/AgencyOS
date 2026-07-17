import { createTheme } from '@mui/material/styles';

// Central MUI theme driven by tokens. Structured so a tenant's brand can override
// these values at runtime later (white-labeling).
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1f6feb' },
    secondary: { main: '#6e40c9' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollBehavior: 'smooth',
          // Offset anchor targets so they aren't hidden under the sticky navbar.
          scrollPaddingTop: '84px',
        },
        // Respect users who prefer reduced motion: neutralise animations/transitions.
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      },
    },
  },
});
