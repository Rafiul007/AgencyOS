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
});
