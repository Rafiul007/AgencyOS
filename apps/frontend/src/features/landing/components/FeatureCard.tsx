import { Box, Paper, Typography } from '@mui/material';
import { Icons } from '@/lib/iconHash';
import { CARD_SHADOW, INK, INK_SOFT } from '../constant/landingTheme';
import type { ILandingFeature } from '../constant/landingContent';

export function FeatureCard({ feature }: { feature: ILandingFeature }) {
  const Icon = Icons[feature.icon];
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 4,
        bgcolor: '#fff',
        boxShadow: CARD_SHADOW,
        transition: 'transform 140ms ease',
        '&:hover': { transform: 'translateY(-4px)' },
      }}
    >
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: 3,
          display: 'grid',
          placeItems: 'center',
          color: '#6e56cf',
          bgcolor: 'rgba(110,86,207,0.1)',
          mb: 2,
        }}
      >
        <Icon fontSize="small" />
      </Box>
      <Typography variant="h6" fontWeight={700} color={INK} gutterBottom>
        {feature.title}
      </Typography>
      <Typography variant="body2" color={INK_SOFT}>
        {feature.description}
      </Typography>
    </Paper>
  );
}
