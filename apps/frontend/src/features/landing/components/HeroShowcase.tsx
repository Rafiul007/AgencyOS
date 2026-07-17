import { Box, Paper, Stack, Typography } from '@mui/material';
import { Icons } from '@/lib/iconHash';
import { ACCENT, CARD_SHADOW, INK, INK_SOFT, SOFT_SHADOW } from '../constant/landingTheme';

/** Small floating glass stat card used around the hero mock. */
function StatCard({
  value,
  label,
  icon,
  sx,
}: {
  value: string;
  label: string;
  icon: keyof typeof Icons;
  sx?: object;
}) {
  const Icon = Icons[icon];
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'absolute',
        p: 1.5,
        borderRadius: 3,
        bgcolor: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(6px)',
        boxShadow: CARD_SHADOW,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        ...sx,
      }}
    >
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'rgba(110,86,207,0.12)',
          color: '#6e56cf',
        }}
      >
        <Icon sx={{ fontSize: 18 }} />
      </Box>
      <Box>
        <Typography fontWeight={800} color={INK} lineHeight={1.1}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: 11 }} color={INK_SOFT}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}

export function HeroShowcase() {
  return (
    <Box sx={{ position: 'relative', mt: { xs: 6, md: 8 }, height: { xs: 380, md: 420 } }}>
      {/* Central product mock */}
      <Paper
        elevation={0}
        sx={{
          position: 'absolute',
          left: '50%',
          top: 0,
          transform: 'translateX(-50%)',
          width: { xs: '90%', sm: 420 },
          p: 2.5,
          borderRadius: 4,
          bgcolor: '#fff',
          boxShadow: SOFT_SHADOW,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography fontWeight={700} color={INK}>
            New quotation
          </Typography>
          <Box sx={{ color: ACCENT, display: 'grid', placeItems: 'center' }}>
            <Icons.Add fontSize="small" />
          </Box>
        </Stack>

        <Box
          sx={{
            width: 56,
            height: 56,
            mx: 'auto',
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#ff9a76,#ff7a59)',
            mb: 2,
          }}
        />

        <Typography color={INK_SOFT} sx={{ fontSize: 14, mb: 2 }}>
          Draft a detailed quotation for Acme Co including branding, campaign setup, and monthly
          retainer.
        </Typography>

        <Box sx={{ bgcolor: '#f5f6fb', borderRadius: 2, p: 1.5, mb: 2 }}>
          <Typography sx={{ fontSize: 13 }} color={INK_SOFT}>
            What line items should I add for a Q3 launch campaign?
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            border: `2px solid ${ACCENT}`,
            borderRadius: 999,
            px: 2,
            py: 1,
          }}
        >
          <Typography sx={{ fontSize: 13, flex: 1 }} color={INK_SOFT}>
            Ask or search for anything
          </Typography>
          <Box sx={{ color: ACCENT, display: 'grid', placeItems: 'center' }}>
            <Icons.ArrowForward sx={{ fontSize: 18 }} />
          </Box>
        </Box>
      </Paper>

      {/* Floating stats */}
      <StatCard
        value="48%"
        label="Faster quotes"
        icon="Description"
        sx={{ left: { xs: 0, md: 20 }, top: 60 }}
      />
      <StatCard
        value="68%"
        label="More replies"
        icon="Email"
        sx={{ left: { xs: 0, md: 40 }, top: 150 }}
      />
      <StatCard
        value="$7.8k"
        label="Revenue this week"
        icon="Receipt"
        sx={{ left: { xs: 8, md: 30 }, bottom: 10 }}
      />
      <StatCard
        value="$4.68k"
        label="Open pipeline"
        icon="Dashboard"
        sx={{ right: { xs: 0, md: 30 }, top: 40 }}
      />
      <StatCard
        value="88%"
        label="Satisfaction"
        icon="Support"
        sx={{ right: { xs: 0, md: 40 }, bottom: 30 }}
      />
    </Box>
  );
}
