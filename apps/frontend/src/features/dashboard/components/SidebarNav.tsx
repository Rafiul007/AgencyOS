import { Box, Chip, Stack, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icons } from '@/lib/iconHash';
import { useAppSelector } from '@/lib/hooks';
import { brand } from '@/lib/theme';
import { SIDEBAR_SECTIONS } from '../constant/navigation';
import type { INavItem } from '../constant/navigation';

const SIDEBAR_WIDTH = 244;

export function SidebarNav() {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        bgcolor: '#fff',
        borderRight: 1,
        borderColor: 'divider',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        p: 2,
        overflowY: 'auto',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1, mb: 3 }}>
        <Typography fontWeight={800} color={brand.ink} noWrap>
          {user?.name ? `${user.name.split(' ')[0]}’s workspace` : 'Workspace'}
        </Typography>
      </Stack>

      <Stack spacing={2.5}>
        {SIDEBAR_SECTIONS.map((section) => (
          <Box key={section.title}>
            <Typography
              variant="caption"
              sx={{ px: 1, color: brand.inkSoft, fontWeight: 700, letterSpacing: '0.04em' }}
            >
              {section.title.toUpperCase()}
            </Typography>
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              {section.items.map((item) => (
                <SidebarItem key={item.key} item={item} />
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function SidebarItem({ item }: { item: INavItem }) {
  const navigate = useNavigate();
  const location = useLocation();
  const Icon = Icons[item.icon];
  const active = Boolean(item.to && location.pathname === item.to && item.key === 'overview');

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      onClick={() => item.ready && item.to && navigate(item.to)}
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 2,
        cursor: item.ready ? 'pointer' : 'default',
        color: active ? brand.ink : item.ready ? brand.inkSoft : 'rgba(27,28,57,0.4)',
        bgcolor: active ? 'rgba(110,86,207,0.1)' : 'transparent',
        fontWeight: active ? 700 : 500,
        '&:hover': { bgcolor: item.ready ? 'rgba(27,28,57,0.04)' : 'transparent' },
      }}
    >
      <Icon sx={{ fontSize: 19 }} />
      <Typography sx={{ fontSize: 14, fontWeight: 'inherit', flexGrow: 1 }}>
        {item.label}
      </Typography>
      {!item.ready && (
        <Chip
          label="Soon"
          size="small"
          sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(27,28,57,0.06)', color: brand.inkSoft }}
        />
      )}
    </Stack>
  );
}
