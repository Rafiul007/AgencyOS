import { useMemo } from 'react';
import { Box, Button, Chip, Typography } from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { useNavigate } from 'react-router-dom';
import type { IQuote } from '@agencyos/shared';
import { Icons } from '@/lib/iconHash';
import { formatMinor } from '@/lib/money';
import { brand } from '@/lib/theme';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { QuoteRowActions } from './components/QuoteRowActions';
import { useQuotes } from './hooks';
import { STATUS_COLORS, STATUS_LABELS } from './constant/quoteOptions';

function formatDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('en-GB') : '—';
}

export function QuotationsListPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuotes();

  const columns = useMemo<MRT_ColumnDef<IQuote>[]>(
    () => [
      {
        accessorKey: 'number',
        header: 'Number',
        size: 140,
        Cell: ({ row }) => (
          <Typography
            component="span"
            onClick={() => navigate(`/quotations/${row.original.id}`)}
            sx={{
              color: brand.purple,
              fontWeight: 700,
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {row.original.number}
          </Typography>
        ),
      },
      { accessorFn: (row) => row.clientName ?? '—', id: 'client', header: 'Client' },
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
      {
        id: 'total',
        header: 'Total',
        size: 130,
        accessorFn: (row) => formatMinor(row.totalMinor, row.currency),
      },
      {
        id: 'expires',
        header: 'Valid till',
        size: 120,
        accessorFn: (row) => formatDate(row.expiresAt),
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
    renderRowActions: ({ row }) => <QuoteRowActions quote={row.original} />,
    renderTopToolbarCustomActions: () => (
      <Button
        variant="contained"
        startIcon={<Icons.Add />}
        onClick={() => navigate('/quotations/new')}
      >
        New quotation
      </Button>
    ),
  });

  return (
    <DashboardLayout title="Quotations">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color={brand.ink}>
          Quotations
        </Typography>
        <Typography color={brand.inkSoft} sx={{ mt: 0.5 }}>
          Build, send, and track quotations for your clients.
        </Typography>
      </Box>

      <MaterialReactTable table={table} />
    </DashboardLayout>
  );
}
