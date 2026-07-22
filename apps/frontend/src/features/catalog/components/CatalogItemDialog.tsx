import { useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CatalogItemType, PricingUnit } from '@agencyos/shared';
import type { ICatalogItem } from '@agencyos/shared';
import { RhfTextField } from '@/components/rhf/RhfTextField';
import { RhfSelect } from '@/components/rhf/RhfSelect';
import { toMajor, toMinor } from '@/lib/money';
import { useCreateCatalogItem, useUpdateCatalogItem } from '../hooks';
import { CATALOG_TYPE_OPTIONS, PRICING_UNIT_OPTIONS } from '../constant/catalogOptions';

const schema = z.object({
  name: z.string().min(2, 'Enter a name'),
  type: z.nativeEnum(CatalogItemType),
  pricingUnit: z.nativeEnum(PricingUnit),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  category: z.string().optional(),
  description: z.string().optional(),
});
type Values = z.infer<typeof schema>;

const EMPTY: Values = {
  name: '',
  type: CatalogItemType.SERVICE,
  pricingUnit: PricingUnit.FIXED,
  price: 0,
  category: '',
  description: '',
};

export function CatalogItemDialog({
  open,
  item,
  onClose,
}: {
  open: boolean;
  item: ICatalogItem | null;
  onClose: () => void;
}) {
  const createItem = useCreateCatalogItem();
  const updateItem = useUpdateCatalogItem();
  const methods = useForm<Values>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (open) {
      methods.reset(
        item
          ? {
              name: item.name,
              type: item.type,
              pricingUnit: item.pricingUnit,
              price: toMajor(item.priceMinor),
              category: item.category ?? '',
              description: item.description ?? '',
            }
          : EMPTY,
      );
    }
  }, [open, item, methods]);

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload = {
      type: values.type,
      name: values.name,
      pricingUnit: values.pricingUnit,
      priceMinor: toMinor(values.price),
      category: values.category || undefined,
      description: values.description || undefined,
    };
    if (item) {
      await updateItem.mutateAsync({ id: item.id, input: payload });
    } else {
      await createItem.mutateAsync(payload);
    }
    onClose();
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle fontWeight={800}>{item ? 'Edit item' : 'Add service or product'}</DialogTitle>
      <FormProvider {...methods}>
        <Box component="form" onSubmit={onSubmit} noValidate>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              <RhfTextField name="name" label="Name" />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <RhfSelect name="type" label="Type" options={CATALOG_TYPE_OPTIONS} />
                <RhfSelect name="pricingUnit" label="Pricing" options={PRICING_UNIT_OPTIONS} />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <RhfTextField name="price" label="Price (৳)" type="number" />
                <RhfTextField name="category" label="Category (optional)" />
              </Stack>
              <RhfTextField name="description" label="Description (optional)" multiline rows={2} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose} variant="text" sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createItem.isPending || updateItem.isPending}
            >
              {item ? 'Save changes' : 'Add item'}
            </Button>
          </DialogActions>
        </Box>
      </FormProvider>
    </Dialog>
  );
}
