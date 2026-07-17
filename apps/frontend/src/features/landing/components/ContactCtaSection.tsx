import { Box, Button, Container, Typography } from '@mui/material';
import { MockPanel } from './MockPanel';
import { CTA_GRADIENT } from '../constant/landingTheme';

export function ContactCtaSection() {
  return (
    <Box id="get-started" component="section" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            borderRadius: 5,
            p: { xs: 4, md: 8 },
            textAlign: 'center',
            color: '#fff',
            background: CTA_GRADIENT,
            overflow: 'hidden',
          }}
        >
          <Typography color="rgba(255,255,255,0.75)" fontWeight={700} sx={{ mb: 1.5 }}>
            Contact
          </Typography>
          <Typography
            variant="h3"
            fontWeight={800}
            letterSpacing="-0.02em"
            sx={{ fontSize: { xs: '1.9rem', md: '2.6rem' }, lineHeight: 1.15 }}
          >
            Supercharge your agency today
          </Typography>
          <Typography sx={{ mt: 2, mb: 4, opacity: 0.85 }}>
            Start your 14-day free trial — no credit card required.
          </Typography>
          <Button
            size="large"
            disableElevation
            sx={{
              bgcolor: '#fff',
              color: '#2b2d64',
              borderRadius: 999,
              textTransform: 'none',
              fontWeight: 700,
              px: 4,
              '&:hover': { bgcolor: '#f2f2fb' },
            }}
          >
            Create your workspace
          </Button>

          <Box sx={{ mt: 6, maxWidth: 720, mx: 'auto' }}>
            <MockPanel variant="analytics" />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
