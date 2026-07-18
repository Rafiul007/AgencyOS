import { Box, CircularProgress } from '@mui/material';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/lib/hooks';

/** Gates authenticated routes. Shows a loader while auth is resolving. */
export function ProtectedRoute() {
  const status = useAppSelector((s) => s.auth.status);

  if (status === 'loading') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'guest') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
