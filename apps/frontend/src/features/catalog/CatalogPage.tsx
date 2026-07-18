import { useMemo, useState } from 'react';
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import type { ICatalogItem } from '@agencyos/shared';
import { Icons } from '@/lib/iconHash';
import { formatMinor } from '@/lib/money';
import { brand } from '@/lib/theme';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { CatalogItemDialog } from './components/CatalogItemDialog';
import { useCatalogItems, useDeleteCatalogItem } from './hooks';
import { TYPE_LABELS, UNIT_LABELS } from './constant/catalogOptions';

export function CatalogPage() {
  const { data, isLoading } = useCatalogItems();
  const deleteItem = useDeleteCatalogItem();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ICatalogItem | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (item: ICatalogItem) => {
    setEditing(item);
    setDialogOpen(true);
  };
  const handleDelete = (item: ICatalogItem) => {
    if (window.confirm(`Delete “${item.name}”?`)) {
      deleteItem.mutate(item.id);
    }
  };

  const columns = useMemo<MRT_ColumnDef<ICatalogItem>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      {
        accessorKey: 'type',
        header: 'Type',
        size: 120,
        Cell: ({ cell }) => (
          <Chip
            label={TYPE_LABELS[cell.getValue<string>()] ?? cell.getValue<string>()}
            size="small"
          />
        ),
      },
      { accessorKey: 'category', header: 'Category', size: 140 },
      {
        id: 'price',
        header: 'Price',
        size: 140,
        accessorFn: (row) =>
          `${formatMinor(row.priceMinor, row.currency)} ${UNIT_LABELS[row.pricingUnit] ?? ''}`,
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
        Add item
      </Button>
    ),
  });

  return (
    <DashboardLayout title="Services & products">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color={brand.ink}>
          Services & products
        </Typography>
        <Typography color={brand.inkSoft} sx={{ mt: 0.5 }}>
          Save what you sell once, then build quotations from it.
        </Typography>
      </Box>

      <MaterialReactTable table={table} />

      <CatalogItemDialog open={dialogOpen} item={editing} onClose={() => setDialogOpen(false)} />
    </DashboardLayout>
  );
}
