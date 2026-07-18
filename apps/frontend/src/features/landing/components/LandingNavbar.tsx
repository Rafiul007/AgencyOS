import { Box, Button, Container, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { INK } from '../constant/landingTheme';

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
          <Logo height={30} />

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
              component={RouterLink}
              to="/login"
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
            <Button component={RouterLink} to="/register" variant="contained">
              Sign up
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
