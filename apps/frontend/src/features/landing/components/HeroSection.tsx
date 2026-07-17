import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { HeroShowcase } from './HeroShowcase';
import { darkButtonSx, INK, INK_SOFT, lightButtonSx } from '../constant/landingTheme';

export function HeroSection() {
  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 9 } }}>
      <Box sx={{ textAlign: 'center', maxWidth: 720, mx: 'auto' }}>
        <Typography
          variant="h1"
          fontWeight={800}
          color={INK}
          letterSpacing="-0.03em"
          sx={{ fontSize: { xs: '2.4rem', sm: '3.2rem', md: '3.75rem' }, lineHeight: 1.08 }}
        >
          Run your agency with human-level precision
        </Typography>

        <Typography
          color={INK_SOFT}
          sx={{ mt: 3, mx: 'auto', maxWidth: 560, fontSize: { xs: '1.05rem', md: '1.15rem' } }}
        >
          Quotations, promotional email, client support, and event ticketing — one workspace that
          runs your agency with speed, clarity, and reliability.
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          sx={{ mt: 5 }}
        >
          <Button href="#get-started" size="large" disableElevation sx={darkButtonSx}>
            Try for free
          </Button>
          <Button href="#features" size="large" sx={lightButtonSx}>
            Request a demo
          </Button>
        </Stack>
      </Box>

      <HeroShowcase />
    </Container>
  );
}
