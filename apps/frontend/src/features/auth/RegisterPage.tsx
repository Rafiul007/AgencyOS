import { useState } from 'react';
import { Alert, Box, Button } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { IApiError } from '@agencyos/shared';
import { RhfTextField } from '@/components/rhf/RhfTextField';
import { useAppDispatch } from '@/lib/hooks';
import { AuthCard } from './AuthCard';
import { registerRequest } from './api';
import { setUser } from './authSlice';

const schema = z.object({
  companyName: z.string().min(2, 'Enter your agency name'),
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});
type Values = z.infer<typeof schema>;

const FIELDS: { name: keyof Values; label: string; type?: string; full?: boolean }[] = [
  { name: 'companyName', label: 'Agency name', full: true },
  { name: 'name', label: 'Your name' },
  { name: 'email', label: 'Work email', type: 'email' },
  { name: 'password', label: 'Password', type: 'password', full: true },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const methods = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { companyName: '', name: '', email: '', password: '' },
  });

  const onSubmit = methods.handleSubmit(async (values) => {
    setError(null);
    try {
      const user = await registerRequest(values);
      dispatch(setUser(user));
      // New agencies start the onboarding wizard right away.
      navigate('/onboarding');
    } catch (err) {
      setError((err as IApiError)?.message ?? 'Unable to create your account');
    }
  });

  return (
    <AuthCard
      title="Start your free trial"
      subtitle="14 days free · no card required"
      maxWidth="sm"
      footer={<RouterLink to="/login">Already have an account? Sign in</RouterLink>}
    >
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} noValidate>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            {error && (
              <Alert severity="error" sx={{ gridColumn: '1 / -1' }}>
                {error}
              </Alert>
            )}
            {FIELDS.map((f) => (
              <Box key={f.name} sx={{ gridColumn: f.full ? '1 / -1' : 'auto' }}>
                <RhfTextField name={f.name} label={f.label} type={f.type} />
              </Box>
            ))}
            <Button
              type="submit"
              size="large"
              variant="contained"
              disabled={methods.formState.isSubmitting}
              sx={{ gridColumn: '1 / -1' }}
            >
              Create workspace
            </Button>
          </Box>
        </form>
      </FormProvider>
    </AuthCard>
  );
}
