import { useMemo, useState } from 'react';
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import type { IClient } from '@agencyos/shared';
import { Icons } from '@/lib/iconHash';
import { brand } from '@/lib/theme';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { ClientDialog } from './components/ClientDialog';
import { useClients, useDeleteClient } from './hooks';
import { STATUS_COLORS, STATUS_LABELS } from './constant/clientOptions';

export function ClientsPage() {
  const { data, isLoading } = useClients();
  const deleteClient = useDeleteClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<IClient | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (client: IClient) => {
    setEditing(client);
    setDialogOpen(true);
  };
  const handleDelete = (client: IClient) => {
    if (window.confirm(`Delete “${client.name}”?`)) {
      deleteClient.mutate(client.id);
    }
  };

  const columns = useMemo<MRT_ColumnDef<IClient>[]>(
    () => [
      { accessorKey: 'name', header: 'Client' },
      { accessorKey: 'contactName', header: 'Contact' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'phone', header: 'Phone', size: 140 },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          return (
            <Chip
              label={STATUS_LABELS[value] ?? value}
              size="small"
              color={STATUS_COLORS[value] ?? 'default'}
              variant="outlined"
            />
          );
        },
      },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data: data ?? [],
    state: { isLoading },
    enableRowActions: true,
    positionActionsColumn: 'last',
    muiTablePaperProps: {
      elevation: 0,
      sx: { borderRadius: 3, border: 1, borderColor: 'divider' },
    },
    renderRowActions: ({ row }) => (
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => openEdit(row.original)}>
            <Icons.Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" onClick={() => handleDelete(row.original)}>
            <Icons.Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    ),
    renderTopToolbarCustomActions: () => (
      <Button variant="contained" startIcon={<Icons.Add />} onClick={openCreate}>
        Add client
      </Button>
    ),
  });

  return (
    <DashboardLayout title="Clients">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color={brand.ink}>
          Clients
        </Typography>
        <Typography color={brand.inkSoft} sx={{ mt: 0.5 }}>
          Your customers — the people you send quotations and invoices to.
        </Typography>
      </Box>

      <MaterialReactTable table={table} />

      <ClientDialog open={dialogOpen} client={editing} onClose={() => setDialogOpen(false)} />
    </DashboardLayout>
  );
}
