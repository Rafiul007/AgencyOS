import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { darkButtonSx, INK } from '../constant/landingTheme';

const NAV_LINKS = [
  { label: 'Product', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'FAQs', href: '#faqs' },
];

export function LandingNavbar() {
  return (
    <Box sx={{ position: 'sticky', top: 0, zIndex: 10, pt: 2, px: 2 }}>
      <Container maxWidth="lg" disableGutters>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            bgcolor: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(27,28,57,0.08)',
            borderRadius: 999,
            px: { xs: 2, sm: 3 },
            py: 1,
            boxShadow: '0 8px 24px -16px rgba(27,28,57,0.4)',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: 1.5,
                background: 'linear-gradient(135deg,#6e56cf,#ff7a59)',
              }}
            />
            <Typography fontWeight={800} letterSpacing="-0.02em" color={INK}>
              AgencyOS
            </Typography>
          </Stack>

          <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {NAV_LINKS.map((link) => (
              <Box
                key={link.label}
                component="a"
                href={link.href}
                sx={{
                  color: INK,
                  opacity: 0.75,
                  textDecoration: 'none',
                  fontSize: 15,
                  fontWeight: 500,
                  '&:hover': { opacity: 1 },
                }}
              >
                {link.label}
              </Box>
            ))}
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              component="a"
              href="#get-started"
              sx={{
                display: { xs: 'none', sm: 'block' },
                color: INK,
                opacity: 0.8,
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 600,
                '&:hover': { opacity: 1 },
              }}
            >
              Sign in
            </Box>
            <Button href="#get-started" disableElevation sx={darkButtonSx}>
              Sign up
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
