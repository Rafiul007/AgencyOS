import { Box, Container, Stack, Typography } from '@mui/material';
import { INK, INK_SOFT } from '../constant/landingTheme';

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
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: 1.25,
                background: 'linear-gradient(135deg,#6e56cf,#ff7a59)',
              }}
            />
            <Typography fontWeight={800} color={INK}>
              AgencyOS
            </Typography>
          </Stack>
          <Typography variant="body2" color={INK_SOFT}>
            © {new Date().getFullYear()} AgencyOS. One workspace for companies and marketing
            agencies.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
