import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { IconRail } from './IconRail';
import { SidebarNav } from './SidebarNav';
import { Topbar } from './Topbar';

/** Tixio-style shell: icon rail + contextual sidebar + topbar + scrollable content. */
export function DashboardLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <IconRail />
      <SidebarNav />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar title={title} />
        <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: '#f6f7fb', p: { xs: 2, md: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
