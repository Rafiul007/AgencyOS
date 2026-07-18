import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import type { Breakpoint } from '@mui/material';
import type { ReactNode } from 'react';
import { Logo } from '@/components/Logo';
import { PAGE_GRADIENT, INK, INK_SOFT } from '@/features/landing/constant/landingTheme';

/** Centered card layout shared by the login and register screens. */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'xs',
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: Breakpoint;
}) {
  return (
    <Box
      sx={{ minHeight: '100vh', background: PAGE_GRADIENT, display: 'flex', alignItems: 'center' }}
    >
      <Container maxWidth={maxWidth}>
        <Stack direction="row" justifyContent="center" sx={{ mb: 3 }}>
          <Logo height={30} />
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            boxShadow: '0 18px 40px -18px rgba(27,28,57,0.28)',
          }}
        >
          <Typography variant="h5" fontWeight={800} color={INK}>
            {title}
          </Typography>
          <Typography color={INK_SOFT} sx={{ mt: 0.5, mb: 3 }}>
            {subtitle}
          </Typography>
          {children}
          {footer && <Box sx={{ mt: 3, textAlign: 'center' }}>{footer}</Box>}
        </Paper>
      </Container>
    </Box>
  );
}
