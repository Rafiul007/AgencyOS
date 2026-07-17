import { Box, Paper, Stack, Typography } from '@mui/material';
import { keyframes } from '@emotion/react';
import { Icons } from '@/lib/iconHash';
import { ACCENT, CARD_SHADOW, INK, INK_SOFT, SOFT_SHADOW } from '../constant/landingTheme';

const floatY = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(-1deg); }
`;

const floatDrift = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(8px, -12px) rotate(1.5deg); }
`;

const floatCenter = keyframes`
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-12px); }
`;

const orbFloat = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(24px, -28px) scale(1.12); }
`;

const spinPulse = keyframes`
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,122,89,0.35); }
  50% { transform: scale(1.06); box-shadow: 0 0 0 10px rgba(255,122,89,0); }
`;

/** Small floating glass stat card used around the hero mock. */
function StatCard({
  value,
  label,
  icon,
  delay = 0,
  duration = 6,
  motion = 'y',
  sx,
}: {
  value: string;
  label: string;
  icon: keyof typeof Icons;
  delay?: number;
  duration?: number;
  motion?: 'y' | 'drift';
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
        zIndex: 2,
        animation: `${motion === 'drift' ? floatDrift : floatY} ${duration}s ease-in-out ${delay}s infinite`,
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

/** Soft blurred gradient orb that drifts behind the mock for ambient motion. */
function Orb({ sx, duration, delay = 0 }: { sx: object; duration: number; delay?: number }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        borderRadius: '50%',
        filter: 'blur(42px)',
        zIndex: 0,
        animation: `${orbFloat} ${duration}s ease-in-out ${delay}s infinite`,
        ...sx,
      }}
    />
  );
}

export function HeroShowcase() {
  return (
    <Box sx={{ position: 'relative', mt: { xs: 6, md: 8 }, height: { xs: 380, md: 420 } }}>
      {/* Ambient floating orbs */}
      <Orb
        duration={13}
        sx={{
          width: 240,
          height: 240,
          top: -20,
          left: '18%',
          background: 'radial-gradient(circle, rgba(143,123,224,0.55), transparent 70%)',
        }}
      />
      <Orb
        duration={16}
        delay={1.5}
        sx={{
          width: 200,
          height: 200,
          bottom: -10,
          right: '16%',
          background: 'radial-gradient(circle, rgba(255,122,89,0.4), transparent 70%)',
        }}
      />

      {/* Central product mock (gently floats) */}
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
          zIndex: 1,
          animation: `${floatCenter} 9s ease-in-out infinite`,
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
            animation: `${spinPulse} 3.5s ease-in-out infinite`,
          }}
        />

        <Typography color={INK_SOFT} sx={{ fontSize: 14, mb: 2 }}>
          Draft a detailed quotation for Rupsha Traders including branding, campaign setup, and
          monthly retainer.
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
        duration={6}
        delay={0}
        motion="y"
        sx={{ left: { xs: 0, md: 20 }, top: 60 }}
      />
      <StatCard
        value="68%"
        label="More replies"
        icon="Email"
        duration={7}
        delay={0.6}
        motion="drift"
        sx={{ left: { xs: 0, md: 40 }, top: 150 }}
      />
      <StatCard
        value="৳7.85L"
        label="Revenue this week"
        icon="Receipt"
        duration={6.5}
        delay={1.2}
        motion="y"
        sx={{ left: { xs: 8, md: 30 }, bottom: 10 }}
      />
      <StatCard
        value="৳4.68L"
        label="Open pipeline"
        icon="Dashboard"
        duration={7.5}
        delay={0.3}
        motion="drift"
        sx={{ right: { xs: 0, md: 30 }, top: 40 }}
      />
      <StatCard
        value="88%"
        label="Satisfaction"
        icon="Support"
        duration={6.2}
        delay={0.9}
        motion="y"
        sx={{ right: { xs: 0, md: 40 }, bottom: 30 }}
      />
    </Box>
  );
}
