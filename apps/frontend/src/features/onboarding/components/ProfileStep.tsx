import { Button, Stack } from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RhfTextField } from '@/components/rhf/RhfTextField';
import { updateOwnerProfile } from '../api';

const schema = z.object({
  name: z.string().min(2, 'Enter your name'),
  phone: z.string().optional(),
});
type Values = z.infer<typeof schema>;

export function ProfileStep({
  defaultName,
  onBack,
  onDone,
}: {
  defaultName: string;
  onBack: () => void;
  onDone: () => void;
}) {
  const methods = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: defaultName, phone: '' },
  });

  const onSubmit = methods.handleSubmit(async (values) => {
    await updateOwnerProfile(values);
    onDone();
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} noValidate>
        <Stack spacing={2.5}>
          <RhfTextField name="name" label="Your name" />
          <RhfTextField name="phone" label="Phone (optional)" />
          <Stack direction="row" spacing={2}>
            <Button onClick={onBack} size="large" variant="outlined" fullWidth>
              Back
            </Button>
            <Button
              type="submit"
              size="large"
              variant="contained"
              disableElevation
              fullWidth
              disabled={methods.formState.isSubmitting}
            >
              Finish setup
            </Button>
          </Stack>
        </Stack>
      </form>
    </FormProvider>
  );
}
