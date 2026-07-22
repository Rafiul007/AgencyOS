import { useMemo } from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { useNavigate } from 'react-router-dom';
import { InvoiceStatus, type IInvoice } from '@agencyos/shared';
import { Icons } from '@/lib/iconHash';
import { formatMinor } from '@/lib/money';
import { brand } from '@/lib/theme';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { useInvoices } from './hooks';
import { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS } from './constant/invoiceOptions';

function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('en-GB') : '—';
}

export function InvoicesListPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useInvoices();

  const columns = useMemo<MRT_ColumnDef<IInvoice>[]>(
    () => [
      {
        accessorKey: 'number',
        header: 'Number',
        size: 150,
        Cell: ({ row }) => (
          <Typography
            component="span"
            onClick={() => navigate(`/invoices/${row.original.id}`)}
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
      { accessorFn: (r) => r.clientName ?? '—', id: 'client', header: 'Client' },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 140,
        Cell: ({ row }) => {
          const inv = row.original;
          const overdue = inv.isOverdue && inv.status !== InvoiceStatus.PAID;
          return (
            <Chip
              size="small"
              label={overdue ? 'Overdue' : INVOICE_STATUS_LABELS[inv.status]}
              color={overdue ? 'error' : INVOICE_STATUS_COLORS[inv.status]}
              variant={overdue ? 'filled' : 'outlined'}
            />
          );
        },
      },
      {
        id: 'total',
        header: 'Total',
        size: 120,
        accessorFn: (r) => formatMinor(r.totalMinor, r.currency),
      },
      {
        id: 'paid',
        header: 'Paid',
        size: 120,
        accessorFn: (r) => formatMinor(r.amountPaidMinor, r.currency),
      },
      {
        id: 'balance',
        header: 'Balance',
        size: 120,
        Cell: ({ row }) => (
          <Typography
            fontWeight={700}
            color={row.original.balanceMinor > 0 ? brand.ink : '#16a34a'}
          >
            {formatMinor(row.original.balanceMinor, row.original.currency)}
          </Typography>
        ),
      },
      { id: 'due', header: 'Due', size: 110, accessorFn: (r) => fmtDate(r.dueDate) },
    ],
    [navigate],
  );

  const table = useMaterialReactTable({
    columns,
    data: data ?? [],
    state: { isLoading },
    muiTablePaperProps: {
      elevation: 0,
      sx: { borderRadius: 3, border: 1, borderColor: 'divider' },
    },
    renderTopToolbarCustomActions: () => (
      <Button
        variant="contained"
        startIcon={<Icons.Add />}
        onClick={() => navigate('/invoices/new')}
      >
        New invoice
      </Button>
    ),
  });

  return (
    <DashboardLayout title="Invoices">
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight={800} color={brand.ink}>
              Invoices
            </Typography>
            <Typography color={brand.inkSoft} sx={{ mt: 0.5 }}>
              Bill your clients and track payments — record cash, bKash, bank transfers, and more.
            </Typography>
          </Box>
        </Stack>
      </Box>
      <MaterialReactTable table={table} />
    </DashboardLayout>
  );
}
