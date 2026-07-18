import { Box } from '@mui/material';
import logoFull from '@/assets/logo-full.svg';
import logoBadge from '@/assets/logo-badge.svg';

type LogoVariant = 'full' | 'badge';

/** AgencyOS brand mark. `full` = icon + wordmark; `badge` = square icon for dark/compact spots. */
export function Logo({
  variant = 'full',
  height = 28,
}: {
  variant?: LogoVariant;
  height?: number;
}) {
  return (
    <Box
      component="img"
      src={variant === 'badge' ? logoBadge : logoFull}
      alt="AgencyOS"
      sx={{ height, width: 'auto', display: 'block' }}
    />
  );
}
