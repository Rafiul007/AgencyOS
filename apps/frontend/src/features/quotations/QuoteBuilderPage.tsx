import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
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
import { useNavigate } from 'react-router-dom';
import type { ICatalogItem } from '@agencyos/shared';
import { RhfSelect } from '@/components/rhf/RhfSelect';
import { RhfTextField } from '@/components/rhf/RhfTextField';
import { Icons } from '@/lib/iconHash';
import { toMajor, toMinor } from '@/lib/money';
import { brand } from '@/lib/theme';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { useClients } from '@/features/clients/hooks';
import { useCatalogItems } from '@/features/catalog/hooks';
import { useCreateQuote } from './hooks';

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
  expiresAt: string;
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

export function QuoteBuilderPage() {
  const navigate = useNavigate();
  const createQuote = useCreateQuote();
  const { data: clients } = useClients();
  const { data: catalog } = useCatalogItems();
  const [catalogPick, setCatalogPick] = useState('');

  const methods = useForm<IFormValues>({
    defaultValues: {
      clientId: '',
      expiresAt: '',
      vatEnabled: false,
      taxRatePercent: 15,
      discount: 0,
      note: '',
      terms: '',
      lines: [{ ...BLANK_LINE }],
    },
  });
  const { control, register, handleSubmit } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });

  const watchedLines = useWatch({ control, name: 'lines' });
  const vatEnabled = useWatch({ control, name: 'vatEnabled' });
  const taxRatePercent = useWatch({ control, name: 'taxRatePercent' });
  const discount = useWatch({ control, name: 'discount' });

  // Live totals (computed in Taka for display; converted to minor units on submit).
  const subtotal = (watchedLines ?? []).reduce((sum, l) => {
    const line = Math.max(
      0,
      (Number(l?.quantity) || 0) * (Number(l?.unitPrice) || 0) - (Number(l?.lineDiscount) || 0),
    );
    return sum + line;
  }, 0);
  const discountVal = Math.min(Number(discount) || 0, subtotal);
  const taxable = subtotal - discountVal;
  const tax = vatEnabled ? (taxable * (Number(taxRatePercent) || 0)) / 100 : 0;
  const total = taxable + tax;

  const clientOptions = [
    { value: '', label: '— No client —' },
    ...(clients ?? []).map((c) => ({ value: c.id, label: c.name })),
  ];

  const addFromCatalog = (id: string) => {
    const item = (catalog ?? []).find((c: ICatalogItem) => c.id === id);
    if (!item) return;
    append({
      catalogItemId: item.id,
      description: item.name,
      unit: item.pricingUnit,
      quantity: 1,
      unitPrice: toMajor(item.priceMinor),
      lineDiscount: 0,
    });
    setCatalogPick('');
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
    await createQuote.mutateAsync({
      clientId: values.clientId || undefined,
      expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : undefined,
      taxRatePercent: values.vatEnabled ? Number(values.taxRatePercent) || 0 : 0,
      discountMinor: toMinor(Number(values.discount) || 0),
      note: values.note || undefined,
      terms: values.terms || undefined,
      lines,
    });
    navigate('/quotations');
  });

  return (
    <DashboardLayout title="New quotation">
      <FormProvider {...methods}>
        <Box component="form" onSubmit={onSubmit} noValidate sx={{ maxWidth: 960 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h4" fontWeight={800} color={brand.ink}>
              New quotation
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <Button variant="outlined" onClick={() => navigate('/quotations')}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={createQuote.isPending}>
                Save quotation
              </Button>
            </Stack>
          </Stack>

          {/* Header details */}
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider', mb: 3 }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <RhfSelect name="clientId" label="Client" options={clientOptions} />
              <RhfTextField
                name="expiresAt"
                label="Valid till"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Paper>

          {/* Line items */}
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
                    {...register(`lines.${index}.lineDiscount` as const, { valueAsNumber: true })}
                  />
                  <Typography
                    sx={{ width: { md: 110 }, textAlign: { md: 'right' } }}
                    color={brand.ink}
                    fontWeight={600}
                  >
                    {taka(
                      Math.max(
                        0,
                        (Number(watchedLines?.[index]?.quantity) || 0) *
                          (Number(watchedLines?.[index]?.unitPrice) || 0) -
                          (Number(watchedLines?.[index]?.lineDiscount) || 0),
                      ),
                    )}
                  </Typography>
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
                value={catalogPick}
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
            {/* Notes */}
            <Paper
              elevation={0}
              sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider', flex: 1 }}
            >
              <Stack spacing={2}>
                <RhfTextField name="note" label="Note to client (optional)" multiline rows={2} />
                <RhfTextField
                  name="terms"
                  label="Terms & conditions (optional)"
                  multiline
                  rows={2}
                />
              </Stack>
            </Paper>

            {/* Totals */}
            <Paper
              elevation={0}
              sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider', width: { md: 320 } }}
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
                {vatEnabled && (
                  <TextField
                    size="small"
                    label="%"
                    type="number"
                    {...register('taxRatePercent', { valueAsNumber: true })}
                    sx={{ width: 90 }}
                  />
                )}
              </Stack>
              {vatEnabled && (
                <Row label={`VAT (${Number(taxRatePercent) || 0}%)`} value={taka(tax)} />
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
