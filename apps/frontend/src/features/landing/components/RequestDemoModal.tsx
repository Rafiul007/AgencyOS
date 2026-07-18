import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RhfTextField } from '@/components/rhf/RhfTextField';
import { Icons } from '@/lib/iconHash';
import { DEMO_FORM_FIELDS } from '../constant/landingContent';
import { INK, INK_SOFT } from '../constant/landingTheme';

const demoSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Enter a valid email'),
  company: z.string().min(2, 'Please enter your company'),
  message: z.string().max(500).optional(),
});

type DemoValues = z.infer<typeof demoSchema>;

const DEFAULTS: DemoValues = { name: '', email: '', company: '', message: '' };

export function RequestDemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const methods = useForm<DemoValues>({
    resolver: zodResolver(demoSchema),
    defaultValues: DEFAULTS,
  });

  const handleClose = () => {
    onClose();
    // Reset after the close transition so the form doesn't flicker while closing.
    window.setTimeout(() => {
      setSubmitted(false);
      methods.reset(DEFAULTS);
    }, 250);
  };

  const onSubmit = methods.handleSubmit(() => {
    // No demo-request endpoint yet — simulate a successful submission.
    setSubmitted(true);
  });

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <Box>
          <Typography variant="h6" fontWeight={800} color={INK}>
            {submitted ? 'Thanks — we’ll be in touch' : 'Request a demo'}
          </Typography>
          {!submitted && (
            <Typography variant="body2" color={INK_SOFT}>
              Tell us a little about your agency and we’ll set up a walkthrough.
            </Typography>
          )}
        </Box>
        <IconButton onClick={handleClose} aria-label="Close" size="small">
          <Icons.Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {submitted ? (
          <Stack alignItems="center" spacing={2} sx={{ py: 4, textAlign: 'center' }}>
            <Box sx={{ color: '#2ea06e' }}>
              <Icons.Check sx={{ fontSize: 56 }} />
            </Box>
            <Typography color={INK_SOFT}>
              Your demo request has been received. Our team will reach out shortly.
            </Typography>
            <Button onClick={handleClose} variant="contained">
              Done
            </Button>
          </Stack>
        ) : (
          <FormProvider {...methods}>
            <Box component="form" onSubmit={onSubmit} noValidate sx={{ pt: 1 }}>
              <Stack spacing={2}>
                {DEMO_FORM_FIELDS.map((f) => (
                  <RhfTextField
                    key={f.name}
                    name={f.name}
                    label={f.label}
                    type={f.type}
                    multiline={f.multiline}
                    rows={f.rows}
                  />
                ))}
                <Button
                  type="submit"
                  size="large"
                  variant="contained"
                  disabled={methods.formState.isSubmitting}
                  sx={{ mt: 1 }}
                >
                  Request demo
                </Button>
              </Stack>
            </Box>
          </FormProvider>
        )}
      </DialogContent>
    </Dialog>
  );
}
