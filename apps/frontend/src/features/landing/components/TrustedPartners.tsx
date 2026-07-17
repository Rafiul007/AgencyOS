import { Container, Stack, Typography } from '@mui/material';
import { INK_SOFT } from '../constant/landingTheme';
import { PARTNERS } from '../constant/landingContent';

export function TrustedPartners() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
      <Typography align="center" color={INK_SOFT} sx={{ mb: 3, fontWeight: 600 }}>
        Our trusted partners
      </Typography>
      <Stack
        direction="row"
        spacing={{ xs: 3, md: 6 }}
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
        sx={{ opacity: 0.55 }}
      >
        {PARTNERS.map((name) => (
          <Typography
            key={name}
            fontWeight={700}
            sx={{ fontSize: { xs: 16, md: 20 }, color: INK_SOFT }}
          >
            {name}
          </Typography>
        ))}
      </Stack>
    </Container>
  );
}
