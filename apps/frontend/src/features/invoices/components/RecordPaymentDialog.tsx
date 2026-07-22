import { useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { PaymentMethod, type IApiError } from '@agencyos/shared';
import { RhfTextField } from '@/components/rhf/RhfTextField';
import { RhfSelect } from '@/components/rhf/RhfSelect';
import { toMinor, toMajor, formatMinor } from '@/lib/money';
import { brand } from '@/lib/theme';
import { useRecordPayment } from '../hooks';
import { PAYMENT_METHOD_OPTIONS } from '../constant/invoiceOptions';

interface Values {
  amount: number;
  method: PaymentMethod;
  reference: string;
  paidAt: string;
  note: string;
}

export function RecordPaymentDialog({
  open,
  invoiceId,
  balanceMinor,
  currency,
  onClose,
}: {
  open: boolean;
  invoiceId: string;
  balanceMinor: number;
  currency: string;
  onClose: () => void;
}) {
  const recordPayment = useRecordPayment();
  const methods = useForm<Values>({
    defaultValues: { amount: 0, method: PaymentMethod.CASH, reference: '', paidAt: '', note: '' },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        amount: toMajor(balanceMinor),
        method: PaymentMethod.CASH,
        reference: '',
        paidAt: new Date().toISOString().slice(0, 10),
        note: '',
      });
    }
  }, [open, balanceMinor, methods]);

  const error = recordPayment.error as unknown as IApiError | null;

  const onSubmit = methods.handleSubmit(async (values) => {
    const amountMinor = toMinor(Number(values.amount) || 0);
    if (amountMinor <= 0) return;
    await recordPayment.mutateAsync({
      id: invoiceId,
      input: {
        amountMinor,
        method: values.method,
        reference: values.reference || undefined,
        paidAt: values.paidAt ? new Date(values.paidAt).toISOString() : undefined,
        note: values.note || undefined,
      },
    });
    onClose();
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle fontWeight={800}>Record payment</DialogTitle>
      <FormProvider {...methods}>
        <Box component="form" onSubmit={onSubmit} noValidate>
          <DialogContent>
            <Typography variant="body2" color={brand.inkSoft} sx={{ mb: 2 }}>
              Outstanding balance: <strong>{formatMinor(balanceMinor, currency)}</strong>
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>
                <RhfTextField name="amount" label="Amount ৳" type="number" />
                <RhfSelect name="method" label="Method" options={PAYMENT_METHOD_OPTIONS} />
              </Stack>
              <RhfTextField name="reference" label="Reference / Trx ID (optional)" />
              <RhfTextField
                name="paidAt"
                label="Payment date"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
              <RhfTextField name="note" label="Note (optional)" multiline rows={2} />
              {error && <Alert severity="error">{error.message}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose} variant="text" sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={recordPayment.isPending}>
              Record payment
            </Button>
          </DialogActions>
        </Box>
      </FormProvider>
    </Dialog>
  );
}
