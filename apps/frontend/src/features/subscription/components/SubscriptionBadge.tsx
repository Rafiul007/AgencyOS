import { Chip, Tooltip } from '@mui/material';
import { SubscriptionStatus, type ISubscription } from '@agencyos/shared';
import { Icons } from '@/lib/iconHash';
import { brand } from '@/lib/theme';
import { useSubscription } from '../hooks';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function planLabel(plan: string): string {
  return `${plan.charAt(0).toUpperCase()}${plan.slice(1)} plan`;
}

interface BadgeView {
  label: string;
  tooltip: string;
  color: 'default' | 'secondary' | 'success' | 'warning';
  upgrade?: boolean;
}

/** Maps a subscription to how the badge reads. Returns null for the loading state. */
function toView(sub: ISubscription | null | undefined): BadgeView {
  if (!sub) {
    return {
      label: 'Upgrade plan',
      tooltip: 'Choose a plan to unlock everything',
      color: 'default',
      upgrade: true,
    };
  }
  switch (sub.status) {
    case SubscriptionStatus.TRIALING:
      return {
        label: `Trial · ${sub.daysRemaining} day${sub.daysRemaining === 1 ? '' : 's'} left`,
        tooltip: `${planLabel(sub.plan)} · trial ends ${fmtDate(sub.currentPeriodEnd)}`,
        color: 'secondary',
      };
    case SubscriptionStatus.ACTIVE:
      return {
        label: `Renews ${fmtDate(sub.currentPeriodEnd)}`,
        tooltip: planLabel(sub.plan),
        color: 'success',
      };
    case SubscriptionStatus.PAST_DUE:
      return {
        label: 'Payment due',
        tooltip: `${planLabel(sub.plan)} · payment overdue`,
        color: 'warning',
      };
    default:
      // CANCELED / EXPIRED
      return {
        label: 'Upgrade plan',
        tooltip: `${planLabel(sub.plan)} · ${sub.status.toLowerCase()}`,
        color: 'default',
        upgrade: true,
      };
  }
}

export function SubscriptionBadge() {
  const { data: sub, isLoading } = useSubscription();
  if (isLoading) return null;

  const view = toView(sub);

  if (view.upgrade) {
    return (
      <Tooltip title={view.tooltip}>
        <Chip
          icon={<Icons.Upgrade sx={{ fontSize: 16 }} />}
          label={view.label}
          size="small"
          clickable
          component="a"
          href="/#pricing"
          sx={{
            display: { xs: 'none', md: 'inline-flex' },
            fontWeight: 700,
            color: '#fff',
            bgcolor: brand.accent,
            '& .MuiChip-icon': { color: '#fff' },
            '&:hover': { bgcolor: '#ff6a44' },
          }}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip title={view.tooltip}>
      <Chip
        label={view.label}
        size="small"
        color={view.color}
        variant="outlined"
        sx={{ display: { xs: 'none', md: 'inline-flex' } }}
      />
    </Tooltip>
  );
}
