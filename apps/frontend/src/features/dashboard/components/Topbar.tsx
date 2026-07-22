import { useState } from 'react';
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  InputBase,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Icons } from '@/lib/iconHash';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logoutRequest } from '@/features/auth/api';
import { setGuest } from '@/features/auth/authSlice';
import { brand } from '@/lib/theme';
import { SubscriptionBadge } from '@/features/subscription/components/SubscriptionBadge';

export function Topbar({ title }: { title: string }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const handleLogout = async () => {
    setAnchor(null);
    await logoutRequest();
    dispatch(setGuest());
    navigate('/login');
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{
        height: 60,
        px: 3,
        flexShrink: 0,
        bgcolor: '#fff',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Typography fontWeight={800} color={brand.ink} sx={{ display: { xs: 'none', sm: 'block' } }}>
        {title}
      </Typography>

      {/* Search */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          flexGrow: 1,
          maxWidth: 420,
          ml: { sm: 2 },
          px: 1.5,
          py: 0.75,
          borderRadius: 999,
          bgcolor: '#f2f3f8',
          color: brand.inkSoft,
        }}
      >
        <Icons.Search sx={{ fontSize: 18 }} />
        <InputBase placeholder="Search anything" sx={{ fontSize: 14, flexGrow: 1 }} />
      </Stack>

      <Box sx={{ flexGrow: 1 }} />

      <SubscriptionBadge />
      <IconButton size="small">
        <Icons.Bell fontSize="small" />
      </IconButton>
      <IconButton size="small" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
        <Icons.Settings fontSize="small" />
      </IconButton>

      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
        <Avatar sx={{ width: 30, height: 30, bgcolor: brand.purple, fontSize: 13 }}>
          {user?.name?.slice(0, 1).toUpperCase() ?? 'A'}
        </Avatar>
      </IconButton>

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <Box sx={{ px: 2, py: 1 }}>
          <Typography fontWeight={700} color={brand.ink}>
            {user?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Icons.Logout fontSize="small" />
          </ListItemIcon>
          Log out
        </MenuItem>
      </Menu>
    </Stack>
  );
}
