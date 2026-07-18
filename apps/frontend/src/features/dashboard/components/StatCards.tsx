import { Box, Paper, Stack, Typography } from '@mui/material';
import { Icons } from '@/lib/iconHash';
import type { IconName } from '@/lib/iconHash';
import { brand } from '@/lib/theme';

interface IStat {
  label: string;
  value: string;
  icon: IconName;
}

// Placeholder metrics until the underlying modules are built.
const STATS: IStat[] = [
  { label: 'Clients', value: '0', icon: 'People' },
  { label: 'Open quotations', value: '0', icon: 'Description' },
  { label: 'Revenue (BDT)', value: '৳0', icon: 'Receipt' },
  { label: 'Open tickets', value: '0', icon: 'Support' },
];

export function StatCards() {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2.5,
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
        mb: 3,
      }}
    >
      {STATS.map((stat) => {
        const Icon = Icons[stat.icon];
        return (
          <Paper
            key={stat.label}
            elevation={0}
            sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider' }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="body2" color={brand.inkSoft}>
                  {stat.label}
                </Typography>
                <Typography variant="h5" fontWeight={800} color={brand.ink} sx={{ mt: 0.5 }}>
                  {stat.value}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'rgba(110,86,207,0.1)',
                  color: brand.purple,
                }}
              >
                <Icon fontSize="small" />
              </Box>
            </Stack>
          </Paper>
        );
      })}
    </Box>
  );
}
