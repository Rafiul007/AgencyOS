import { createTheme } from '@mui/material/styles';

// Brand tokens — the single source of truth for colors used across the app.
export const brand = {
  ink: '#1b1c39',
  inkSoft: '#5a5b7a',
  purple: '#6e56cf',
  accent: '#ff7a59',
};

// Central MUI theme. Buttons, colors, and shape are defined here so every surface
// (landing + app) stays visually consistent — components should not re-style buttons.
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: brand.ink, contrastText: '#ffffff' },
    secondary: { main: brand.purple },
  },
  shape: { borderRadius: 8 },
  typography: {
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingLeft: 20,
          paddingRight: 20,
        },
        // Landing "light" button: white pill with a subtle border.
        outlined: {
          backgroundColor: '#ffffff',
          borderColor: 'rgba(27,28,57,0.12)',
          color: brand.ink,
          '&:hover': {
            backgroundColor: '#f5f6fb',
            borderColor: 'rgba(27,28,57,0.2)',
          },
        },
      },
    },
    // Inputs share the button's pill radius so forms feel consistent
    // (multiline textareas get a gentler radius).
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          '&.MuiInputBase-multiline': { borderRadius: 16 },
        },
        input: { paddingLeft: 6 },
      },
    },
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
