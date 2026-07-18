import { useState } from 'react';
import { Alert, Button, Stack } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { IApiError } from '@agencyos/shared';
import { RhfTextField } from '@/components/rhf/RhfTextField';
import { useAppDispatch } from '@/lib/hooks';
import { AuthCard } from './AuthCard';
import { loginRequest } from './api';
import { setUser } from './authSlice';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});
type Values = z.infer<typeof schema>;

const FIELDS = [
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'password', label: 'Password', type: 'password' },
] as const;

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const methods = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = methods.handleSubmit(async (values) => {
    setError(null);
    try {
      const user = await loginRequest(values);
      dispatch(setUser(user));
      navigate('/dashboard');
    } catch (err) {
      setError((err as IApiError)?.message ?? 'Unable to sign in');
    }
  });

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your workspace"
      footer={<RouterLink to="/register">Don’t have an account? Create one</RouterLink>}
    >
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} noValidate>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            {FIELDS.map((f) => (
              <RhfTextField key={f.name} name={f.name} label={f.label} type={f.type} />
            ))}
            <Button
              type="submit"
              size="large"
              variant="contained"
              disableElevation
              disabled={methods.formState.isSubmitting}
            >
              Sign in
            </Button>
          </Stack>
        </form>
      </FormProvider>
    </AuthCard>
  );
}
