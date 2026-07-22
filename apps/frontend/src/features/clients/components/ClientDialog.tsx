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
import { ClientStatus } from '@agencyos/shared';
import type { IClient } from '@agencyos/shared';
import { RhfTextField } from '@/components/rhf/RhfTextField';
import { RhfSelect } from '@/components/rhf/RhfSelect';
import { useCreateClient, useUpdateClient } from '../hooks';
import { CLIENT_STATUS_OPTIONS } from '../constant/clientOptions';

const schema = z.object({
  name: z.string().min(2, 'Enter the client / company name'),
  contactName: z.string().optional(),
  email: z.union([z.literal(''), z.string().email('Enter a valid email')]).optional(),
  phone: z.string().optional(),
  status: z.nativeEnum(ClientStatus),
  address: z.string().optional(),
  notes: z.string().optional(),
});
type Values = z.infer<typeof schema>;

const EMPTY: Values = {
  name: '',
  contactName: '',
  email: '',
  phone: '',
  status: ClientStatus.ACTIVE,
  address: '',
  notes: '',
};

export function ClientDialog({
  open,
  client,
  onClose,
}: {
  open: boolean;
  client: IClient | null;
  onClose: () => void;
}) {
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const methods = useForm<Values>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (open) {
      methods.reset(
        client
          ? {
              name: client.name,
              contactName: client.contactName ?? '',
              email: client.email ?? '',
              phone: client.phone ?? '',
              status: client.status,
              address: client.address ?? '',
              notes: client.notes ?? '',
            }
          : EMPTY,
      );
    }
  }, [open, client, methods]);

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      contactName: values.contactName || undefined,
      email: values.email || undefined,
      phone: values.phone || undefined,
      status: values.status,
      address: values.address || undefined,
      notes: values.notes || undefined,
    };
    if (client) {
      await updateClient.mutateAsync({ id: client.id, input: payload });
    } else {
      await createClient.mutateAsync(payload);
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
      <DialogTitle fontWeight={800}>{client ? 'Edit client' : 'Add client'}</DialogTitle>
      <FormProvider {...methods}>
        <Box component="form" onSubmit={onSubmit} noValidate>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              <RhfTextField name="name" label="Client / company name" />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <RhfTextField name="contactName" label="Contact person" />
                <RhfSelect name="status" label="Status" options={CLIENT_STATUS_OPTIONS} />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <RhfTextField name="email" label="Email" type="email" />
                <RhfTextField name="phone" label="Phone" />
              </Stack>
              <RhfTextField name="address" label="Address (optional)" multiline rows={2} />
              <RhfTextField name="notes" label="Notes (optional)" multiline rows={2} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose} variant="text" sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createClient.isPending || updateClient.isPending}
            >
              {client ? 'Save changes' : 'Add client'}
            </Button>
          </DialogActions>
        </Box>
      </FormProvider>
    </Dialog>
  );
}
