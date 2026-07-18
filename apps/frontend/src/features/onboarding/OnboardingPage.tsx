import { useState } from 'react';
import { Box, Button, Container, Paper, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/lib/hooks';
import { WorkspaceStep } from './components/WorkspaceStep';
import { ProfileStep } from './components/ProfileStep';
import { fetchOnboardingState, finishOnboarding } from './api';
import { PAGE_GRADIENT, INK, INK_SOFT } from '@/features/landing/constant/landingTheme';

const STEPS = ['Workspace', 'Your profile'];

export function OnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);
  const [activeStep, setActiveStep] = useState(0);
  const { data: state } = useQuery({ queryKey: ['onboarding'], queryFn: fetchOnboardingState });

  const complete = async () => {
    await finishOnboarding();
    await queryClient.invalidateQueries({ queryKey: ['onboarding'] });
    navigate('/dashboard');
  };

  const skipToDashboard = async () => {
    await queryClient.invalidateQueries({ queryKey: ['onboarding'] });
    navigate('/dashboard');
  };

  return (
    <Box sx={{ minHeight: '100vh', background: PAGE_GRADIENT, py: { xs: 4, md: 8 } }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight={800} color={INK}>
            Set up your workspace
          </Typography>
          <Typography color={INK_SOFT} sx={{ mt: 1 }}>
            A couple of quick steps to get AgencyOS ready.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            boxShadow: '0 18px 40px -18px rgba(27,28,57,0.28)',
          }}
        >
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 ? (
            <WorkspaceStep defaultName={state?.tenant.name ?? ''} onDone={() => setActiveStep(1)} />
          ) : (
            <ProfileStep
              defaultName={user?.name ?? ''}
              onBack={() => setActiveStep(0)}
              onDone={complete}
            />
          )}
        </Paper>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button onClick={skipToDashboard} color="inherit" sx={{ color: INK_SOFT }}>
            Skip for now
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
