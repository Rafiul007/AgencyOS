import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { IconRail } from './IconRail';
import { SidebarNav } from './SidebarNav';
import { Topbar } from './Topbar';
import { PageTitleProvider, usePageTitleContext } from './PageTitleContext';
import { getActiveModule } from '../constant/navigation';

/** Loader shown only inside the content area while a route's chunk loads. */
function ContentLoader() {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 240, py: 8 }}>
      <CircularProgress />
    </Box>
  );
}

function Shell() {
  const { pathname } = useLocation();
  const { title } = usePageTitleContext();
  // A page can set a specific title (e.g. a quote number); otherwise fall back to the module.
  const resolvedTitle = title ?? getActiveModule(pathname).label;

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <IconRail />
      <SidebarNav />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar title={resolvedTitle} />
        <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: '#f6f7fb', p: { xs: 2, md: 4 } }}>
          <Suspense fallback={<ContentLoader />}>
            <Outlet />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Persistent dashboard shell (icon rail + sidebar + topbar). It renders once and
 * stays mounted across navigations — only the content area swaps — so there's no
 * flicker. Lazy route chunks show `ContentLoader` inside the content region.
 */
export function AppShell() {
  return (
    <PageTitleProvider>
      <Shell />
    </PageTitleProvider>
  );
}
