import { Box, Button, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { OnboardingTaskStatus } from '@agencyos/shared';
import { Icons } from '@/lib/iconHash';
import { fetchOnboardingState } from '@/features/onboarding/api';
import { INK, INK_SOFT } from '@/features/landing/constant/landingTheme';

export function GettingStartedWidget() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['onboarding'],
    queryFn: fetchOnboardingState,
  });

  if (isLoading || !data) {
    return null;
  }
  // Hide once everything is done or onboarding was marked complete.
  if (data.progress === 100 || data.tenant.onboardingCompletedAt) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: 1, borderColor: 'divider' }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={800} color={INK}>
          Get started
        </Typography>
        <Typography variant="body2" color={INK_SOFT}>
          {data.progress}% complete
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={data.progress}
        sx={{ height: 8, borderRadius: 999, mb: 3 }}
      />

      <Stack spacing={1.5}>
        {data.tasks.map((task) => {
          const done = task.status === OnboardingTaskStatus.DONE;
          const skipped = task.status === OnboardingTaskStatus.SKIPPED;
          return (
            <Stack key={task.key} direction="row" spacing={1.5} alignItems="center">
              <Icons.Check sx={{ fontSize: 20, color: done ? '#2ea06e' : 'rgba(27,28,57,0.2)' }} />
              <Typography
                color={done ? INK_SOFT : INK}
                sx={{ textDecoration: done || skipped ? 'line-through' : 'none' }}
              >
                {task.title}
              </Typography>
            </Stack>
          );
        })}
      </Stack>

      <Box sx={{ mt: 3 }}>
        <Button variant="contained" disableElevation onClick={() => navigate('/onboarding')}>
          Continue setup
        </Button>
      </Box>
    </Paper>
  );
}
