import { Button, Stack } from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RhfTextField } from '@/components/rhf/RhfTextField';
import { RhfSelect } from '@/components/rhf/RhfSelect';
import { updateWorkspaceSettings } from '../api';
import {
  BUSINESS_TYPE_OPTIONS,
  CURRENCY_OPTIONS,
  TIMEZONE_OPTIONS,
} from '../constant/onboardingFields';

const schema = z.object({
  name: z.string().min(2, 'Enter your agency name'),
  businessType: z.string().optional(),
  timezone: z.string().min(1),
  currency: z.string().min(1),
});
type Values = z.infer<typeof schema>;

export function WorkspaceStep({
  defaultName,
  onDone,
}: {
  defaultName: string;
  onDone: () => void;
}) {
  const methods = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultName,
      businessType: 'marketing_agency',
      timezone: 'Asia/Dhaka',
      currency: 'BDT',
    },
  });

  const onSubmit = methods.handleSubmit(async (values) => {
    await updateWorkspaceSettings(values);
    onDone();
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} noValidate>
        <Stack spacing={2.5}>
          <RhfTextField name="name" label="Agency name" />
          <RhfSelect name="businessType" label="Business type" options={BUSINESS_TYPE_OPTIONS} />
          <RhfSelect name="timezone" label="Timezone" options={TIMEZONE_OPTIONS} />
          <RhfSelect name="currency" label="Currency" options={CURRENCY_OPTIONS} />
          <Button
            type="submit"
            size="large"
            variant="contained"
            disableElevation
            disabled={methods.formState.isSubmitting}
          >
            Continue
          </Button>
        </Stack>
      </form>
    </FormProvider>
  );
}
