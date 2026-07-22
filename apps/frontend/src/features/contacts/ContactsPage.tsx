import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Icons } from '@/lib/iconHash';
import { brand } from '@/lib/theme';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { useContactsWorkspace } from './useContactsWorkspace';
import { ContactsToolbar } from './components/ContactsToolbar';
import { ContactsTable } from './components/ContactsTable';
import { ContactsDialogs } from './components/ContactsDialogs';

export function ContactsPage() {
  const navigate = useNavigate();
  const ws = useContactsWorkspace();

  return (
    <DashboardLayout title="Contacts">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color={brand.ink}>
          Contacts
        </Typography>
        <Typography color={brand.inkSoft} sx={{ mt: 0.5 }}>
          Your prospect pipeline — track cold calls, emails, and WhatsApp, then convert winners into
          clients.
        </Typography>
      </Box>

      <ContactsToolbar
        ws={ws}
        extra={
          <Button
            variant="outlined"
            startIcon={<Icons.Board />}
            onClick={() => navigate('/contacts/board')}
          >
            Pipeline
          </Button>
        }
      />

      <ContactsTable
        data={ws.rows}
        isLoading={ws.isLoading}
        onOpen={(c) => ws.setSelectedId(c.id)}
        onEdit={ws.openEdit}
        onDelete={ws.handleDelete}
      />

      <ContactsDialogs ws={ws} />
    </DashboardLayout>
  );
}
