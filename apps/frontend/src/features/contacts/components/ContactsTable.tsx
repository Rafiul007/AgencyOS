import { useMemo } from 'react';
import { Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import type { IContact } from '@agencyos/shared';
import { Icons } from '@/lib/iconHash';
import { brand } from '@/lib/theme';
import { STAGE_COLORS, STAGE_LABELS } from '../constant/contactOptions';

function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('en-GB') : '—';
}

export function ContactsTable({
  data,
  isLoading,
  onOpen,
  onEdit,
  onDelete,
}: {
  data: IContact[];
  isLoading: boolean;
  onOpen: (contact: IContact) => void;
  onEdit: (contact: IContact) => void;
  onDelete: (contact: IContact) => void;
}) {
  const columns = useMemo<MRT_ColumnDef<IContact>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        Cell: ({ row }) => (
          <Stack>
            <Typography
              component="span"
              onClick={() => onOpen(row.original)}
              sx={{
                color: brand.purple,
                fontWeight: 700,
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {row.original.name}
            </Typography>
            {row.original.company && (
              <Typography variant="caption" color={brand.inkSoft}>
                {row.original.company}
              </Typography>
            )}
          </Stack>
        ),
      },
      { accessorFn: (r) => r.mobile ?? '—', id: 'mobile', header: 'Mobile', size: 140 },
      { accessorFn: (r) => r.email ?? '—', id: 'email', header: 'Email' },
      {
        accessorKey: 'stage',
        header: 'Stage',
        size: 130,
        Cell: ({ row }) => (
          <Chip
            size="small"
            label={STAGE_LABELS[row.original.stage]}
            color={STAGE_COLORS[row.original.stage]}
          />
        ),
      },
      {
        accessorFn: (r) => r.assignedToName ?? 'Unassigned',
        id: 'assignee',
        header: 'Owner',
        size: 130,
      },
      {
        id: 'tags',
        header: 'Tags',
        Cell: ({ row }) =>
          row.original.tags.length ? (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {row.original.tags.slice(0, 3).map((t) => (
                <Chip key={t} size="small" variant="outlined" label={t} />
              ))}
            </Stack>
          ) : (
            <Typography variant="caption" color={brand.inkSoft}>
              —
            </Typography>
          ),
      },
      {
        id: 'followUp',
        header: 'Follow-up',
        size: 120,
        accessorFn: (r) => fmtDate(r.nextFollowUpAt),
      },
    ],
    [onOpen],
  );

  const table = useMaterialReactTable({
    columns,
    data,
    state: { isLoading },
    enableRowActions: true,
    positionActionsColumn: 'last',
    muiTablePaperProps: {
      elevation: 0,
      sx: { borderRadius: 3, border: 1, borderColor: 'divider' },
    },
    renderRowActions: ({ row }) => (
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Open">
          <IconButton size="small" onClick={() => onOpen(row.original)}>
            <Icons.ArrowForward fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => onEdit(row.original)}>
            <Icons.Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" onClick={() => onDelete(row.original)}>
            <Icons.Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    ),
  });

  return <MaterialReactTable table={table} />;
}
