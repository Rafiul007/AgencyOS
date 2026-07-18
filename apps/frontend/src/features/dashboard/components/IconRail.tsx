import { Avatar, Stack, Tooltip, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icons } from '@/lib/iconHash';
import { Logo } from '@/components/Logo';
import { useAppSelector } from '@/lib/hooks';
import { brand } from '@/lib/theme';
import { getActiveModule, MODULES, SETTINGS_ITEM } from '../constant/navigation';
import type { IModule } from '../constant/navigation';

const RAIL_WIDTH = 84;

export function IconRail() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const initials = user?.name?.slice(0, 1).toUpperCase() ?? 'A';
  const activeKey = getActiveModule(location.pathname).key;

  const go = (module: IModule) => {
    if (module.ready && module.to) {
      navigate(module.to);
    }
  };

  return (
    <Stack
      alignItems="center"
      sx={{ width: RAIL_WIDTH, flexShrink: 0, bgcolor: brand.ink, py: 2.5, color: '#fff' }}
    >
      <Stack sx={{ mb: 3 }}>
        <Logo variant="badge" height={38} />
      </Stack>

      <Stack spacing={1.5} sx={{ flexGrow: 1, width: '100%', alignItems: 'center' }}>
        {MODULES.map((module) => (
          <RailButton
            key={module.key}
            module={module}
            active={module.key === activeKey}
            onClick={() => go(module)}
          />
        ))}
      </Stack>

      <RailButton module={SETTINGS_ITEM} active={false} onClick={() => go(SETTINGS_ITEM)} />

      <Avatar sx={{ width: 34, height: 34, bgcolor: brand.purple, fontSize: 14, mt: 2 }}>
        {initials}
      </Avatar>
    </Stack>
  );
}

function RailButton({
  module,
  active,
  onClick,
}: {
  module: IModule;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = Icons[module.icon];
  return (
    <Tooltip title={module.ready ? '' : `${module.label} · coming soon`} placement="right">
      <Stack
        alignItems="center"
        spacing={0.5}
        onClick={onClick}
        sx={{
          width: 68,
          py: 1,
          borderRadius: 2.5,
          cursor: module.ready ? 'pointer' : 'default',
          color: active ? '#fff' : 'rgba(255,255,255,0.6)',
          bgcolor: active ? 'rgba(255,255,255,0.14)' : 'transparent',
          opacity: module.ready ? 1 : 0.45,
          transition: 'background-color 120ms ease, color 120ms ease',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' },
        }}
      >
        <Icon fontSize="small" />
        <Typography sx={{ fontSize: 10.5, fontWeight: 600, lineHeight: 1 }}>
          {module.short}
        </Typography>
      </Stack>
    </Tooltip>
  );
}
