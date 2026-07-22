import { useEffect } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ContactStage } from '@agencyos/shared';
import type { IContact } from '@agencyos/shared';
import { RhfTextField } from '@/components/rhf/RhfTextField';
import { RhfSelect } from '@/components/rhf/RhfSelect';
import { useCreateContact, useUpdateContact, useTenantUsers } from '../hooks';
import { SOURCE_OPTIONS, STAGE_OPTIONS } from '../constant/contactOptions';

const schema = z.object({
  name: z.string().min(2, 'Enter the contact name'),
  company: z.string().optional(),
  email: z.union([z.literal(''), z.string().email('Enter a valid email')]).optional(),
  mobile: z.string().optional(),
  whatsapp: z.string().optional(),
  source: z.string().optional(),
  stage: z.nativeEnum(ContactStage),
  assignedToId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  nextFollowUpAt: z.string().optional(),
  notes: z.string().optional(),
});
type Values = z.infer<typeof schema>;

const EMPTY: Values = {
  name: '',
  company: '',
  email: '',
  mobile: '',
  whatsapp: '',
  source: '',
  stage: ContactStage.NEW,
  assignedToId: '',
  tags: [],
  nextFollowUpAt: '',
  notes: '',
};

export function ContactDialog({
  open,
  contact,
  onClose,
}: {
  open: boolean;
  contact: IContact | null;
  onClose: () => void;
}) {
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const { data: users } = useTenantUsers();
  const methods = useForm<Values>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (open) {
      methods.reset(
        contact
          ? {
              name: contact.name,
              company: contact.company ?? '',
              email: contact.email ?? '',
              mobile: contact.mobile ?? '',
              whatsapp: contact.whatsapp ?? '',
              source: contact.source ?? '',
              stage: contact.stage,
              assignedToId: contact.assignedToId ?? '',
              tags: contact.tags,
              nextFollowUpAt: contact.nextFollowUpAt ? contact.nextFollowUpAt.slice(0, 10) : '',
              notes: contact.notes ?? '',
            }
          : EMPTY,
      );
    }
  }, [open, contact, methods]);

  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...(users ?? []).map((u) => ({ value: u.id, label: u.name })),
  ];

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      company: values.company || undefined,
      email: values.email || undefined,
      mobile: values.mobile || undefined,
      whatsapp: values.whatsapp || undefined,
      source: values.source || undefined,
      stage: values.stage,
      assignedToId: values.assignedToId || undefined,
      tags: values.tags ?? [],
      nextFollowUpAt: values.nextFollowUpAt
        ? new Date(values.nextFollowUpAt).toISOString()
        : undefined,
      notes: values.notes || undefined,
    };
    if (contact) {
      await updateContact.mutateAsync({ id: contact.id, input: payload });
    } else {
      await createContact.mutateAsync(payload);
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
      <DialogTitle fontWeight={800}>{contact ? 'Edit contact' : 'Add contact'}</DialogTitle>
      <FormProvider {...methods}>
        <Box component="form" onSubmit={onSubmit} noValidate>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <RhfTextField name="name" label="Full name" />
                <RhfTextField name="company" label="Company (optional)" />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <RhfTextField name="mobile" label="Mobile" />
                <RhfTextField name="whatsapp" label="WhatsApp" />
              </Stack>
              <RhfTextField name="email" label="Email" type="email" />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <RhfSelect name="source" label="Source" options={SOURCE_OPTIONS} />
                <RhfSelect name="stage" label="Stage" options={STAGE_OPTIONS} />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <RhfSelect name="assignedToId" label="Assigned to" options={assigneeOptions} />
                <RhfTextField
                  name="nextFollowUpAt"
                  label="Next follow-up"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
              <Controller
                control={methods.control}
                name="tags"
                render={({ field }) => (
                  <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={field.value ?? []}
                    onChange={(_e, value) => field.onChange(value)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          size="small"
                          label={option}
                          {...getTagProps({ index })}
                          key={option}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tags"
                        placeholder="Type a tag and press Enter"
                      />
                    )}
                  />
                )}
              />
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
              disabled={createContact.isPending || updateContact.isPending}
            >
              {contact ? 'Save changes' : 'Add contact'}
            </Button>
          </DialogActions>
        </Box>
      </FormProvider>
    </Dialog>
  );
}
