import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { FeatureCard } from './FeatureCard';
import { Reveal } from '@/components/Reveal';
import { LANDING_FEATURES } from '../constant/landingContent';
import { INK, INK_SOFT } from '../constant/landingTheme';

export function BenefitsSection() {
  return (
    <Box id="features" component="section" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Reveal sx={{ mb: { xs: 5, md: 7 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'flex-end' }}
            spacing={2}
          >
            <Box sx={{ maxWidth: 560 }}>
              <Typography color="#6e56cf" fontWeight={700} sx={{ mb: 1 }}>
                Benefits
              </Typography>
              <Typography
                variant="h3"
                fontWeight={800}
                color={INK}
                letterSpacing="-0.02em"
                sx={{ fontSize: { xs: '1.9rem', md: '2.6rem' }, lineHeight: 1.12 }}
              >
                Why agencies love the AgencyOS workspace
              </Typography>
              <Typography color={INK_SOFT} sx={{ mt: 2 }}>
                Replace a handful of disconnected tools with one connected platform your whole team
                can run on.
              </Typography>
            </Box>
            <Button href="#features" variant="outlined">
              Learn more
            </Button>
          </Stack>
        </Reveal>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          }}
        >
          {LANDING_FEATURES.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 90} sx={{ height: '100%' }}>
              <FeatureCard feature={feature} />
            </Reveal>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
