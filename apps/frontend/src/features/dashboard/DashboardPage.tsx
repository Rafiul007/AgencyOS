import { Box, Typography } from '@mui/material';
import { useAppSelector } from '@/lib/hooks';
import { DashboardLayout } from './components/DashboardLayout';
import { StatCards } from './components/StatCards';
import { GettingStartedWidget } from './components/GettingStartedWidget';
import { brand } from '@/lib/theme';

export function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <DashboardLayout title="Dashboard">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color={brand.ink}>
          Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
        </Typography>
        <Typography color={brand.inkSoft} sx={{ mt: 0.5 }}>
          Here’s an overview of your workspace.
        </Typography>
      </Box>

      <StatCards />
      <GettingStartedWidget />
    </DashboardLayout>
  );
}
