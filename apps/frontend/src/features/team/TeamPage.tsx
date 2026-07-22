import { useMemo, useState } from 'react';
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { UserRole, type ITeamMember } from '@agencyos/shared';
import { Icons } from '@/lib/iconHash';
import { brand } from '@/lib/theme';
import { useAppSelector } from '@/lib/hooks';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { useTeam, useRemoveMember } from './hooks';
import { MemberDialog } from './components/MemberDialog';
import { ROLE_COLORS, ROLE_LABELS } from './constant/teamOptions';

function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('en-GB') : 'Never';
}

export function TeamPage() {
  const currentUser = useAppSelector((s) => s.auth.user);
  const { data, isLoading } = useTeam();
  const removeMember = useRemoveMember();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ITeamMember | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (member: ITeamMember) => {
    setEditing(member);
    setDialogOpen(true);
  };
  const handleRemove = (member: ITeamMember) => {
    if (window.confirm(`Remove ${member.name} from the team?`)) removeMember.mutate(member.id);
  };

  const columns = useMemo<MRT_ColumnDef<ITeamMember>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Member',
        Cell: ({ row }) => (
          <Stack>
            <Typography fontWeight={700} color={brand.ink}>
              {row.original.name}
              {row.original.id === currentUser?.id ? ' (you)' : ''}
            </Typography>
            <Typography variant="caption" color={brand.inkSoft}>
              {row.original.email}
            </Typography>
          </Stack>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        size: 130,
        Cell: ({ row }) => (
          <Chip
            size="small"
            label={ROLE_LABELS[row.original.role]}
            color={ROLE_COLORS[row.original.role]}
          />
        ),
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        size: 120,
        Cell: ({ row }) => (
          <Chip
            size="small"
            variant="outlined"
            label={row.original.isActive ? 'Active' : 'Deactivated'}
            color={row.original.isActive ? 'success' : 'default'}
          />
        ),
      },
      {
        id: 'lastLogin',
        header: 'Last login',
        size: 140,
        accessorFn: (r) => fmtDate(r.lastLoginAt),
      },
    ],
    [currentUser?.id],
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
    renderRowActions: ({ row }) => {
      const m = row.original;
      const locked = m.role === UserRole.OWNER || m.id === currentUser?.id;
      if (locked) {
        return (
          <Typography variant="caption" color={brand.inkSoft}>
            {m.role === UserRole.OWNER ? 'Owner' : '—'}
          </Typography>
        );
      }
      return (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit role / status">
            <IconButton size="small" onClick={() => openEdit(m)}>
              <Icons.Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove">
            <IconButton size="small" onClick={() => handleRemove(m)}>
              <Icons.Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      );
    },
    renderTopToolbarCustomActions: () => (
      <Button variant="contained" startIcon={<Icons.Add />} onClick={openCreate}>
        Add member
      </Button>
    ),
  });

  return (
    <DashboardLayout title="Team & roles">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color={brand.ink}>
          Team &amp; roles
        </Typography>
        <Typography color={brand.inkSoft} sx={{ mt: 0.5 }}>
          Invite teammates and control what they can access. The Owner has full access and can't be
          changed.
        </Typography>
      </Box>

      <MaterialReactTable table={table} />

      <MemberDialog open={dialogOpen} member={editing} onClose={() => setDialogOpen(false)} />
    </DashboardLayout>
  );
}
