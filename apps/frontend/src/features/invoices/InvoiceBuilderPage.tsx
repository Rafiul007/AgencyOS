import { useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  DEFAULT_QUOTE_TEMPLATE,
  InvoiceStatus,
  QUOTE_TEMPLATES,
  type ICatalogItem,
} from '@agencyos/shared';
import { RhfSelect } from '@/components/rhf/RhfSelect';
import { RhfTextField } from '@/components/rhf/RhfTextField';
import { Icons } from '@/lib/iconHash';
import { toMajor, toMinor } from '@/lib/money';
import { brand } from '@/lib/theme';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { fetchOnboardingState } from '@/features/onboarding/api';
import { useClients } from '@/features/clients/hooks';
import { useCatalogItems } from '@/features/catalog/hooks';
import { useCreateInvoice, useInvoice, useUpdateInvoice } from './hooks';
import { InvoiceDocument } from './components/InvoiceDocument';
import type { IInvoiceDocumentData } from './interface';

const CUSTOM_CLIENT = '__custom__';

interface ILineForm {
  catalogItemId: string | null;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  lineDiscount: number;
}

interface IFormValues {
  clientId: string;
  customClientName: string;
  issueDate: string;
  dueDate: string;
  vatEnabled: boolean;
  taxRatePercent: number;
  discount: number;
  note: string;
  terms: string;
  lines: ILineForm[];
}

const BLANK_LINE: ILineForm = {
  catalogItemId: null,
  description: '',
  unit: 'FIXED',
  quantity: 1,
  unitPrice: 0,
  lineDiscount: 0,
};

const taka = (n: number) =>
  `৳${(Number.isFinite(n) ? n : 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export function InvoiceBuilderPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const { data: existing } = useInvoice(id);
  const { data: clients } = useClients();
  const { data: catalog } = useCatalogItems();
  const { data: onboarding } = useQuery({
    queryKey: ['onboarding'],
    queryFn: fetchOnboardingState,
  });

  const methods = useForm<IFormValues>({
    defaultValues: {
      clientId: '',
      customClientName: '',
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: '',
      vatEnabled: false,
      taxRatePercent: 15,
      discount: 0,
      note: '',
      terms: '',
      lines: [{ ...BLANK_LINE }],
    },
  });
  const { control, register, handleSubmit, reset } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });

  useEffect(() => {
    if (existing) {
      const isCustom = !existing.clientId && Boolean(existing.clientName);
      reset({
        clientId: existing.clientId ?? (isCustom ? CUSTOM_CLIENT : ''),
        customClientName: isCustom ? (existing.clientName ?? '') : '',
        issueDate: existing.issueDate.slice(0, 10),
        dueDate: existing.dueDate ? existing.dueDate.slice(0, 10) : '',
        vatEnabled: existing.taxRatePercent > 0,
        taxRatePercent: existing.taxRatePercent || 15,
        discount: existing.discountMinor / 100,
        note: existing.note ?? '',
        terms: existing.terms ?? '',
        lines: (existing.lineItems ?? []).map((l) => ({
          catalogItemId: l.catalogItemId,
          description: l.description,
          unit: l.unit,
          quantity: l.quantity,
          unitPrice: l.unitPriceMinor / 100,
          lineDiscount: l.lineDiscountMinor / 100,
        })),
      });
    }
  }, [existing, reset]);

  const w = {
    lines: useWatch({ control, name: 'lines' }),
    vatEnabled: useWatch({ control, name: 'vatEnabled' }),
    taxRatePercent: useWatch({ control, name: 'taxRatePercent' }),
    discount: useWatch({ control, name: 'discount' }),
    clientId: useWatch({ control, name: 'clientId' }),
    customClientName: useWatch({ control, name: 'customClientName' }),
    issueDate: useWatch({ control, name: 'issueDate' }),
    dueDate: useWatch({ control, name: 'dueDate' }),
    note: useWatch({ control, name: 'note' }),
    terms: useWatch({ control, name: 'terms' }),
  };
  const isCustomClient = w.clientId === CUSTOM_CLIENT;

  const subtotal = (w.lines ?? []).reduce((sum, l) => {
    const line = Math.max(
      0,
      (Number(l?.quantity) || 0) * (Number(l?.unitPrice) || 0) - (Number(l?.lineDiscount) || 0),
    );
    return sum + line;
  }, 0);
  const discountVal = Math.min(Number(w.discount) || 0, subtotal);
  const taxable = subtotal - discountVal;
  const tax = w.vatEnabled ? (taxable * (Number(w.taxRatePercent) || 0)) / 100 : 0;
  const total = taxable + tax;

  const clientOptions = [
    { value: '', label: '— No client —' },
    { value: CUSTOM_CLIENT, label: '✏️  Enter name manually' },
    ...(clients ?? []).map((c) => ({ value: c.id, label: c.name })),
  ];

  const addFromCatalog = (catalogId: string) => {
    const item = (catalog ?? []).find((c: ICatalogItem) => c.id === catalogId);
    if (!item) return;
    append({
      catalogItemId: item.id,
      description: item.name,
      unit: item.pricingUnit,
      quantity: 1,
      unitPrice: toMajor(item.priceMinor),
      lineDiscount: 0,
    });
  };

  const agencyName = onboarding?.tenant.name ?? 'Your Agency';
  const activeTemplate = onboarding?.tenant.defaultQuoteTemplate ?? DEFAULT_QUOTE_TEMPLATE;
  const previewClientName = isCustomClient
    ? w.customClientName || null
    : ((clients ?? []).find((c) => c.id === w.clientId)?.name ?? null);

  const previewData: IInvoiceDocumentData = {
    number: existing?.number ?? 'DRAFT',
    agencyName,
    clientName: previewClientName,
    status: InvoiceStatus.DRAFT,
    currency: 'BDT',
    issueDate: w.issueDate ? new Date(w.issueDate).toISOString() : new Date().toISOString(),
    dueDate: w.dueDate ? new Date(w.dueDate).toISOString() : null,
    note: w.note?.trim() || null,
    terms: w.terms?.trim() || null,
    taxRatePercent: w.vatEnabled ? Number(w.taxRatePercent) || 0 : 0,
    discountMinor: toMinor(discountVal),
    subtotalMinor: toMinor(subtotal),
    taxMinor: toMinor(tax),
    totalMinor: toMinor(total),
    amountPaidMinor: 0,
    balanceMinor: toMinor(total),
    isOverdue: false,
    lineItems: (w.lines ?? [])
      .filter((l) => l?.description?.trim())
      .map((l, i) => {
        const qty = Number(l.quantity) || 0;
        const unit = Number(l.unitPrice) || 0;
        const disc = Number(l.lineDiscount) || 0;
        return {
          id: `preview-${i}`,
          catalogItemId: l.catalogItemId ?? null,
          description: l.description,
          unit: l.unit,
          quantity: qty,
          unitPriceMinor: toMinor(unit),
          lineDiscountMinor: toMinor(disc),
          lineTotalMinor: toMinor(Math.max(0, qty * unit - disc)),
          sortOrder: i,
        };
      }),
  };

  const onSubmit = handleSubmit(async (values) => {
    const lines = values.lines
      .filter((l) => l.description.trim())
      .map((l) => ({
        catalogItemId: l.catalogItemId || undefined,
        description: l.description.trim(),
        unit: l.unit,
        quantity: Math.max(1, Math.round(Number(l.quantity) || 1)),
        unitPriceMinor: toMinor(Number(l.unitPrice) || 0),
        lineDiscountMinor: toMinor(Number(l.lineDiscount) || 0),
      }));
    if (lines.length === 0) {
      window.alert('Add at least one line item with a description.');
      return;
    }
    const custom = values.clientId === CUSTOM_CLIENT;
    const payload = {
      clientId: !custom && values.clientId ? values.clientId : undefined,
      customerName: custom ? values.customClientName.trim() || undefined : undefined,
      issueDate: values.issueDate ? new Date(values.issueDate).toISOString() : undefined,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
      taxRatePercent: values.vatEnabled ? Number(values.taxRatePercent) || 0 : 0,
      discountMinor: toMinor(Number(values.discount) || 0),
      note: values.note || undefined,
      terms: values.terms || undefined,
      lines,
    };
    if (isEdit && id) {
      await updateInvoice.mutateAsync({ id, input: payload });
      navigate(`/invoices/${id}`);
    } else {
      const created = await createInvoice.mutateAsync(payload);
      navigate(`/invoices/${created.id}`);
    }
  });

  return (
    <DashboardLayout title={isEdit ? 'Edit invoice' : 'New invoice'}>
      <FormProvider {...methods}>
        <Box component="form" onSubmit={onSubmit} noValidate>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ sm: 'center' }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <IconButton
                onClick={() => navigate('/invoices')}
                sx={{ border: 1, borderColor: 'divider', bgcolor: '#fff' }}
              >
                <Icons.ArrowBack />
              </IconButton>
              <Typography variant="h4" fontWeight={800} color={brand.ink}>
                {isEdit ? 'Edit invoice' : 'New invoice'}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5}>
              <Button variant="outlined" onClick={() => navigate('/invoices')}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Icons.Check />}
                disabled={createInvoice.isPending || updateInvoice.isPending}
              >
                {isEdit ? 'Save changes' : 'Save invoice'}
              </Button>
            </Stack>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 440px' },
              gap: 3,
              alignItems: 'start',
            }}
          >
            <Box>
              <Paper
                elevation={0}
                sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider', mb: 3 }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <RhfSelect name="clientId" label="Client" options={clientOptions} />
                  <RhfTextField
                    name="issueDate"
                    label="Issue date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                  <RhfTextField
                    name="dueDate"
                    label="Due date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                </Stack>
                {isCustomClient && (
                  <Box sx={{ mt: 2 }}>
                    <RhfTextField
                      name="customClientName"
                      label="Customer name"
                      placeholder="e.g. Rahim Traders"
                    />
                  </Box>
                )}
              </Paper>

              <Paper
                elevation={0}
                sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider', mb: 3 }}
              >
                <Typography fontWeight={700} color={brand.ink} sx={{ mb: 2 }}>
                  Items
                </Typography>
                <Stack spacing={1.5}>
                  {fields.map((field, index) => (
                    <Stack
                      key={field.id}
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={1.5}
                      alignItems={{ md: 'center' }}
                    >
                      <TextField
                        size="small"
                        label="Description"
                        sx={{ flexGrow: 1 }}
                        {...register(`lines.${index}.description` as const)}
                      />
                      <TextField
                        size="small"
                        label="Qty"
                        type="number"
                        sx={{ width: { md: 80 } }}
                        {...register(`lines.${index}.quantity` as const, { valueAsNumber: true })}
                      />
                      <TextField
                        size="small"
                        label="Unit ৳"
                        type="number"
                        sx={{ width: { md: 120 } }}
                        {...register(`lines.${index}.unitPrice` as const, { valueAsNumber: true })}
                      />
                      <TextField
                        size="small"
                        label="Disc ৳"
                        type="number"
                        sx={{ width: { md: 100 } }}
                        {...register(`lines.${index}.lineDiscount` as const, {
                          valueAsNumber: true,
                        })}
                      />
                      <IconButton
                        size="small"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Icons.Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
                  <Button
                    startIcon={<Icons.Add />}
                    onClick={() => append({ ...BLANK_LINE })}
                    variant="outlined"
                  >
                    Add line
                  </Button>
                  <TextField
                    select
                    size="small"
                    label="Add from catalog"
                    value=""
                    onChange={(e) => addFromCatalog(e.target.value)}
                    sx={{ minWidth: 240 }}
                  >
                    {(catalog ?? []).map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </Paper>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Paper
                  elevation={0}
                  sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider', flex: 1 }}
                >
                  <Stack spacing={2}>
                    <RhfTextField
                      name="note"
                      label="Note to client (optional)"
                      multiline
                      rows={2}
                    />
                    <RhfTextField
                      name="terms"
                      label="Terms & conditions (optional)"
                      multiline
                      rows={2}
                    />
                  </Stack>
                </Paper>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: 1,
                    borderColor: 'divider',
                    width: { md: 320 },
                  }}
                >
                  <Row label="Subtotal" value={taka(subtotal)} />
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ my: 1 }}>
                    <TextField
                      size="small"
                      label="Discount ৳"
                      type="number"
                      {...register('discount', { valueAsNumber: true })}
                      sx={{ flexGrow: 1 }}
                    />
                  </Stack>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 1 }}
                  >
                    <Controller
                      control={control}
                      name="vatEnabled"
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              size="small"
                            />
                          }
                          label="VAT"
                        />
                      )}
                    />
                    {w.vatEnabled && (
                      <TextField
                        size="small"
                        label="%"
                        type="number"
                        {...register('taxRatePercent', { valueAsNumber: true })}
                        sx={{ width: 90 }}
                      />
                    )}
                  </Stack>
                  {w.vatEnabled && (
                    <Row label={`VAT (${Number(w.taxRatePercent) || 0}%)`} value={taka(tax)} />
                  )}
                  <Divider sx={{ my: 1.5 }} />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontWeight={800} color={brand.ink}>
                      Total
                    </Typography>
                    <Typography fontWeight={800} color={brand.ink}>
                      {taka(total)}
                    </Typography>
                  </Stack>
                </Paper>
              </Stack>
            </Box>

            <Box sx={{ position: { lg: 'sticky' }, top: 88 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Typography fontWeight={800} color={brand.ink}>
                  Live preview
                </Typography>
                <Chip
                  size="small"
                  icon={<Icons.Templates sx={{ fontSize: 16 }} />}
                  label={QUOTE_TEMPLATES.find((t) => t.key === activeTemplate)?.label ?? 'Template'}
                  variant="outlined"
                />
              </Stack>
              <Box
                sx={{
                  maxHeight: { lg: 'calc(100vh - 160px)' },
                  overflow: 'auto',
                  borderRadius: 2,
                  boxShadow: '0 18px 40px -24px rgba(27,28,57,0.35)',
                }}
              >
                {previewData.lineItems.length > 0 ? (
                  <InvoiceDocument data={previewData} template={activeTemplate} />
                ) : (
                  <Box
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      bgcolor: '#fff',
                    }}
                  >
                    <Typography color={brand.inkSoft}>
                      Add an item to see your invoice preview.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </FormProvider>
    </DashboardLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
      <Typography color={brand.inkSoft}>{label}</Typography>
      <Typography color={brand.ink}>{value}</Typography>
    </Stack>
  );
}
