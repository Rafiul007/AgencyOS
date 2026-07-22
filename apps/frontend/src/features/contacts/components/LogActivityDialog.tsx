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
import { ContactActivityType } from '@agencyos/shared';
import type { ContactActivityOutcome } from '@agencyos/shared';
import { RhfTextField } from '@/components/rhf/RhfTextField';
import { RhfSelect } from '@/components/rhf/RhfSelect';
import { useLogActivity } from '../hooks';
import { ACTIVITY_TYPE_OPTIONS, OUTCOME_OPTIONS } from '../constant/contactOptions';

interface Values {
  type: ContactActivityType;
  outcome: string;
  note: string;
  nextFollowUpAt: string;
}

const EMPTY: Values = {
  type: ContactActivityType.CALL,
  outcome: '',
  note: '',
  nextFollowUpAt: '',
};

export function LogActivityDialog({
  open,
  contactId,
  onClose,
}: {
  open: boolean;
  contactId: string | null;
  onClose: () => void;
}) {
  const logActivity = useLogActivity();
  const methods = useForm<Values>({ defaultValues: EMPTY });

  useEffect(() => {
    if (open) methods.reset(EMPTY);
  }, [open, methods]);

  const onSubmit = methods.handleSubmit(async (values) => {
    if (!contactId) return;
    await logActivity.mutateAsync({
      id: contactId,
      input: {
        type: values.type,
        outcome: (values.outcome || undefined) as ContactActivityOutcome | undefined,
        note: values.note || undefined,
        nextFollowUpAt: values.nextFollowUpAt
          ? new Date(values.nextFollowUpAt).toISOString()
          : undefined,
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
      <DialogTitle fontWeight={800}>Log outreach</DialogTitle>
      <FormProvider {...methods}>
        <Box component="form" onSubmit={onSubmit} noValidate>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              <Stack direction="row" spacing={2}>
                <RhfSelect name="type" label="Type" options={ACTIVITY_TYPE_OPTIONS} />
                <RhfSelect name="outcome" label="Outcome" options={OUTCOME_OPTIONS} />
              </Stack>
              <RhfTextField
                name="nextFollowUpAt"
                label="Next follow-up (optional)"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
              <RhfTextField name="note" label="Note (optional)" multiline rows={3} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose} variant="text" sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={logActivity.isPending}>
              Save activity
            </Button>
          </DialogActions>
        </Box>
      </FormProvider>
    </Dialog>
  );
}
