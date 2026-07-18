import { Avatar, Stack, Tooltip, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icons } from '@/lib/iconHash';
import { Logo } from '@/components/Logo';
import { useAppSelector } from '@/lib/hooks';
import { brand } from '@/lib/theme';
import { PRIMARY_MODULES } from '../constant/navigation';

const RAIL_WIDTH = 84;

export function IconRail() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const initials = user?.name?.slice(0, 1).toUpperCase() ?? 'A';

  return (
    <Stack
      alignItems="center"
      sx={{
        width: RAIL_WIDTH,
        flexShrink: 0,
        bgcolor: brand.ink,
        py: 2.5,
        color: '#fff',
      }}
    >
      {/* Brand mark */}
      <Stack sx={{ mb: 3 }}>
        <Logo variant="badge" height={38} />
      </Stack>

      <Stack spacing={1.5} sx={{ flexGrow: 1, width: '100%', alignItems: 'center' }}>
        {PRIMARY_MODULES.map((module) => {
          const Icon = Icons[module.icon];
          const active = Boolean(module.to && location.pathname === module.to);
          return (
            <Tooltip
              key={module.key}
              title={module.ready ? '' : `${module.label} · coming soon`}
              placement="right"
            >
              <Stack
                alignItems="center"
                spacing={0.5}
                onClick={() => module.ready && module.to && navigate(module.to)}
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
                  {module.short ?? module.label}
                </Typography>
              </Stack>
            </Tooltip>
          );
        })}
      </Stack>

      <Avatar sx={{ width: 34, height: 34, bgcolor: brand.purple, fontSize: 14, mt: 2 }}>
        {initials}
      </Avatar>
    </Stack>
  );
}
