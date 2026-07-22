import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { QuoteStatus } from '@agencyos/shared';
import { Icons } from '@/lib/iconHash';
import type { IconName } from '@/lib/iconHash';
import { formatMinor } from '@/lib/money';
import { brand } from '@/lib/theme';
import { useClients } from '@/features/clients/hooks';
import { useQuotes } from '@/features/quotations/hooks';

interface IStat {
  label: string;
  value: string;
  icon: IconName;
  loading: boolean;
  to?: string;
}

/** Quotations still in play (not yet accepted, rejected, expired, or converted). */
const OPEN_STATUSES: QuoteStatus[] = [QuoteStatus.DRAFT, QuoteStatus.SENT];
/** Quotations that count towards realised revenue. */
const WON_STATUSES: QuoteStatus[] = [QuoteStatus.ACCEPTED, QuoteStatus.CONVERTED];

export function StatCards() {
  const navigate = useNavigate();
  const { data: clients, isLoading: clientsLoading } = useClients();
  const { data: quotes, isLoading: quotesLoading } = useQuotes();

  const openQuotes = (quotes ?? []).filter((q) => OPEN_STATUSES.includes(q.status)).length;
  const revenueMinor = (quotes ?? [])
    .filter((q) => WON_STATUSES.includes(q.status))
    .reduce((sum, q) => sum + q.totalMinor, 0);

  const stats: IStat[] = [
    {
      label: 'Clients',
      value: String(clients?.length ?? 0),
      icon: 'People',
      loading: clientsLoading,
      to: '/clients',
    },
    {
      label: 'Open quotations',
      value: String(openQuotes),
      icon: 'Description',
      loading: quotesLoading,
      to: '/quotations',
    },
    {
      label: 'Revenue (BDT)',
      value: formatMinor(revenueMinor, 'BDT'),
      icon: 'Receipt',
      loading: quotesLoading,
      to: '/quotations',
    },
    // No tickets module yet — shown as zero until it lands.
    { label: 'Open tickets', value: '0', icon: 'Support', loading: false },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2.5,
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
        mb: 3,
      }}
    >
      {stats.map((stat) => {
        const Icon = Icons[stat.icon];
        const clickable = Boolean(stat.to);
        return (
          <Paper
            key={stat.label}
            elevation={0}
            onClick={stat.to ? () => navigate(stat.to as string) : undefined}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: 1,
              borderColor: 'divider',
              cursor: clickable ? 'pointer' : 'default',
              transition: 'border-color 120ms ease, box-shadow 120ms ease',
              ...(clickable && {
                '&:hover': {
                  borderColor: brand.purple,
                  boxShadow: '0 10px 24px -18px rgba(110,86,207,0.6)',
                },
              }),
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="body2" color={brand.inkSoft}>
                  {stat.label}
                </Typography>
                {stat.loading ? (
                  <Skeleton variant="text" width={64} height={40} sx={{ mt: 0.5 }} />
                ) : (
                  <Typography variant="h5" fontWeight={800} color={brand.ink} sx={{ mt: 0.5 }}>
                    {stat.value}
                  </Typography>
                )}
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
