import { Box, Paper, Stack, Typography } from '@mui/material';
import { Icons } from '@/lib/iconHash';
import { CARD_SHADOW, INK, INK_SOFT } from '../constant/landingTheme';

const BAR_HEIGHTS = [40, 62, 48, 80, 58, 92, 70];

/** Lightweight product mock used beside feature blocks (no real data). */
export function MockPanel({ variant }: { variant: 'quotation' | 'analytics' }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 4,
        bgcolor: '#fff',
        boxShadow: CARD_SHADOW,
      }}
    >
      {variant === 'quotation' ? <QuotationMock /> : <AnalyticsMock />}
    </Paper>
  );
}

function QuotationMock() {
  const rows = [
    { label: 'Brand strategy', value: '$2,400' },
    { label: 'Campaign setup', value: '$1,800' },
    { label: 'Monthly retainer', value: '$3,650' },
  ];
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography fontWeight={700} color={INK}>
          Quotation · Acme Co
        </Typography>
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 999,
            bgcolor: 'rgba(46,160,110,0.12)',
            color: '#2ea06e',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Approved
        </Box>
      </Stack>

      <Stack spacing={1.25}>
        {rows.map((row) => (
          <Stack
            key={row.label}
            direction="row"
            justifyContent="space-between"
            sx={{ bgcolor: '#f5f6fb', borderRadius: 2, px: 2, py: 1.25 }}
          >
            <Typography sx={{ fontSize: 14 }} color={INK_SOFT}>
              {row.label}
            </Typography>
            <Typography sx={{ fontSize: 14 }} fontWeight={700} color={INK}>
              {row.value}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
        <Typography color={INK_SOFT} sx={{ fontSize: 14 }}>
          Total
        </Typography>
        <Typography fontWeight={800} color={INK} sx={{ fontSize: 20 }}>
          $7,850
        </Typography>
      </Stack>
    </Box>
  );
}

function AnalyticsMock() {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 13 }} color={INK_SOFT}>
            Revenue this month
          </Typography>
          <Typography fontWeight={800} color={INK} sx={{ fontSize: 26 }}>
            $32,750
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: '#2ea06e',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          <Icons.Check sx={{ fontSize: 16 }} /> +18%
        </Box>
      </Stack>

      <Stack direction="row" spacing={1.25} alignItems="flex-end" sx={{ height: 140 }}>
        {BAR_HEIGHTS.map((h, i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              height: `${h}%`,
              borderRadius: 1.5,
              background:
                i === 5
                  ? 'linear-gradient(180deg,#ff9a76,#ff7a59)'
                  : 'linear-gradient(180deg,#8f7be0,#6e56cf)',
              opacity: i === 5 ? 1 : 0.85,
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}
