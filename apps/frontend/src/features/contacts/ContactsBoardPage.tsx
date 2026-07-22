import { Box, Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Icons } from '@/lib/iconHash';
import { brand } from '@/lib/theme';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { useContactsWorkspace } from './useContactsWorkspace';
import { ContactsToolbar } from './components/ContactsToolbar';
import { ContactsBoard } from './components/ContactsBoard';
import { ContactsDialogs } from './components/ContactsDialogs';

export function ContactsBoardPage() {
  const navigate = useNavigate();
  const ws = useContactsWorkspace();

  return (
    <DashboardLayout title="Pipeline">
      {/* Full-height column layout: header/toolbar fixed, board fills the rest and scrolls. */}
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ sm: 'center' }}
          spacing={1}
          sx={{ mb: 2, flexShrink: 0 }}
        >
          <Box>
            <Typography variant="h4" fontWeight={800} color={brand.ink}>
              Pipeline
            </Typography>
            <Typography color={brand.inkSoft} sx={{ mt: 0.5 }}>
              Drag prospects across stages as they move toward becoming clients.
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ flexShrink: 0 }}>
          <ContactsToolbar
            ws={ws}
            extra={
              <Button
                variant="outlined"
                startIcon={<Icons.List />}
                onClick={() => navigate('/contacts')}
              >
                List
              </Button>
            }
          />
        </Box>

        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          <ContactsBoard
            contacts={ws.rows}
            onOpen={(c) => ws.setSelectedId(c.id)}
            onMove={ws.move}
            fullHeight
          />
        </Box>
      </Box>

      <ContactsDialogs ws={ws} />
    </DashboardLayout>
  );
}
