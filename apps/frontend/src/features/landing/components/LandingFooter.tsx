import { Box, Container, Stack, Typography } from '@mui/material';
import { Logo } from '@/components/Logo';
import { INK_SOFT } from '../constant/landingTheme';

export function LandingFooter() {
  return (
    <Box component="footer" sx={{ borderTop: '1px solid rgba(27,28,57,0.08)', py: 5 }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems="center"
        >
          <Logo height={26} />
          <Typography variant="body2" color={INK_SOFT}>
            © {new Date().getFullYear()} AgencyOS. One workspace for companies and marketing
            agencies.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
