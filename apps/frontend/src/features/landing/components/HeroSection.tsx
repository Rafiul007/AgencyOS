import { useState } from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { HeroShowcase } from './HeroShowcase';
import { RequestDemoModal } from './RequestDemoModal';
import { Reveal } from '@/components/Reveal';
import { INK, INK_SOFT } from '../constant/landingTheme';

export function HeroSection() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 9 } }}>
      <Box sx={{ textAlign: 'center', maxWidth: 720, mx: 'auto' }}>
        <Reveal>
          <Typography
            variant="h1"
            fontWeight={800}
            color={INK}
            letterSpacing="-0.03em"
            sx={{ fontSize: { xs: '2.4rem', sm: '3.2rem', md: '3.75rem' }, lineHeight: 1.08 }}
          >
            Run your agency with human-level precision
          </Typography>
        </Reveal>

        <Reveal delay={120}>
          <Typography
            color={INK_SOFT}
            sx={{ mt: 3, mx: 'auto', maxWidth: 560, fontSize: { xs: '1.05rem', md: '1.15rem' } }}
          >
            Quotations, promotional email, client support, and event ticketing — one workspace built
            for agencies across Bangladesh, with bKash and Nagad payments built in.
          </Typography>
        </Reveal>

        <Reveal delay={240}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ mt: 5 }}
          >
            <Button component={RouterLink} to="/register" size="large" variant="contained">
              Try for free
            </Button>
            <Button size="large" variant="outlined" onClick={() => setDemoOpen(true)}>
              Request a demo
            </Button>
          </Stack>
        </Reveal>
      </Box>

      <Reveal delay={360}>
        <HeroShowcase />
      </Reveal>

      <RequestDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </Container>
  );
}
