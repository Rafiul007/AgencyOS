import { Box, Button, Chip, Container, Paper, Stack, Typography } from '@mui/material';
import { Icons } from '@/lib/iconHash';
import { Reveal } from '@/components/Reveal';
import { PRICING_PLAN } from '../constant/landingContent';
import { CTA_GRADIENT, INK, INK_SOFT, SOFT_SHADOW } from '../constant/landingTheme';

export function PricingSection() {
  return (
    <Box id="pricing" component="section" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Reveal sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
          <Typography color="#6e56cf" fontWeight={700} sx={{ mb: 1 }}>
            Pricing
          </Typography>
          <Typography
            variant="h3"
            fontWeight={800}
            color={INK}
            letterSpacing="-0.02em"
            sx={{ fontSize: { xs: '1.9rem', md: '2.5rem' } }}
          >
            One simple plan, everything included
          </Typography>
          <Typography color={INK_SOFT} sx={{ mt: 2 }}>
            No tiers, no hidden fees — just one price for your whole team.
          </Typography>
        </Reveal>

        <Reveal>
          <Paper
            elevation={0}
            sx={{
              maxWidth: 920,
              mx: 'auto',
              borderRadius: 5,
              overflow: 'hidden',
              boxShadow: SOFT_SHADOW,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
            }}
          >
            {/* Left — price + CTA */}
            <Box
              sx={{
                flex: { xs: '1', md: '0 0 42%' },
                background: CTA_GRADIENT,
                color: '#fff',
                p: { xs: 4, md: 5 },
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Chip
                label={PRICING_PLAN.name}
                size="small"
                sx={{
                  alignSelf: 'flex-start',
                  mb: 3,
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.18)',
                  fontWeight: 700,
                }}
              />

              <Stack direction="row" alignItems="baseline" spacing={0.5}>
                <Typography
                  fontWeight={800}
                  sx={{ fontSize: { xs: '3rem', md: '3.4rem' }, lineHeight: 1 }}
                >
                  {PRICING_PLAN.price}
                </Typography>
                <Typography sx={{ opacity: 0.85 }} fontWeight={600}>
                  {PRICING_PLAN.period}
                </Typography>
              </Stack>

              <Typography sx={{ mt: 2, opacity: 0.9 }}>{PRICING_PLAN.description}</Typography>

              <Box sx={{ flexGrow: 1 }} />

              <Button
                href="#get-started"
                fullWidth
                size="large"
                disableElevation
                sx={{
                  mt: 4,
                  bgcolor: '#fff',
                  color: '#2b2d64',
                  borderRadius: 999,
                  textTransform: 'none',
                  fontWeight: 700,
                  py: 1.25,
                  '&:hover': { bgcolor: '#f2f2fb' },
                }}
              >
                Start free trial
              </Button>
              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', opacity: 0.8 }}>
                Billed monthly in BDT · Cancel anytime
              </Typography>
            </Box>

            {/* Right — what's included */}
            <Box sx={{ flex: 1, bgcolor: '#fff', p: { xs: 4, md: 5 } }}>
              <Typography fontWeight={700} color={INK} sx={{ mb: 3 }}>
                Everything you get
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  columnGap: 3,
                  rowGap: 2,
                }}
              >
                {PRICING_PLAN.features.map((feature) => (
                  <Stack key={feature} direction="row" spacing={1.25} alignItems="flex-start">
                    <Icons.Check sx={{ fontSize: 20, color: '#2ea06e', mt: '2px' }} />
                    <Typography color={INK}>{feature}</Typography>
                  </Stack>
                ))}
              </Box>
            </Box>
          </Paper>
        </Reveal>
      </Container>
    </Box>
  );
}
