import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { DEFAULT_QUOTE_TEMPLATE, QUOTE_TEMPLATES, type QuoteTemplate } from '@agencyos/shared';
import { Icons } from '@/lib/iconHash';
import { brand } from '@/lib/theme';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { fetchOnboardingState } from '@/features/onboarding/api';
import { TemplatePreview } from './components/TemplatePreview';
import { SAMPLE_QUOTE } from './constant/sampleQuote';
import { useSetDefaultTemplate } from './hooks';

export function TemplatesPage() {
  const { data: onboarding } = useQuery({
    queryKey: ['onboarding'],
    queryFn: fetchOnboardingState,
  });
  const setDefault = useSetDefaultTemplate();

  const activeTemplate = onboarding?.tenant.defaultQuoteTemplate ?? DEFAULT_QUOTE_TEMPLATE;
  const agencyName = onboarding?.tenant.name ?? SAMPLE_QUOTE.agencyName;
  const previewData = { ...SAMPLE_QUOTE, agencyName };

  const choose = (key: QuoteTemplate) => setDefault.mutate(key);

  return (
    <DashboardLayout title="Templates">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color={brand.ink}>
          Quotation templates
        </Typography>
        <Typography color={brand.inkSoft} sx={{ mt: 0.5 }}>
          Pick the look your quotations use by default. Your choice is saved to your workspace, and
          you can still switch the template on any individual quotation.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' },
          gap: 3,
        }}
      >
        {QUOTE_TEMPLATES.map((tpl) => {
          const isActive = tpl.key === activeTemplate;
          return (
            <Paper
              key={tpl.key}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: 2,
                borderColor: isActive ? brand.purple : 'divider',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 120ms ease',
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <TemplatePreview template={tpl.key} data={previewData} />
                {isActive && (
                  <Chip
                    icon={<Icons.Check sx={{ fontSize: 16 }} />}
                    label="Active"
                    color="secondary"
                    size="small"
                    sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 700 }}
                  />
                )}
              </Box>

              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Typography fontWeight={800} color={brand.ink}>
                  {tpl.label}
                </Typography>
                <Typography variant="body2" color={brand.inkSoft} sx={{ mt: 0.5, flexGrow: 1 }}>
                  {tpl.description}
                </Typography>
                <Stack direction="row" sx={{ mt: 2 }}>
                  <Button
                    fullWidth
                    variant={isActive ? 'outlined' : 'contained'}
                    disabled={isActive || setDefault.isPending}
                    onClick={() => choose(tpl.key)}
                  >
                    {isActive ? 'Current default' : 'Set as active'}
                  </Button>
                </Stack>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </DashboardLayout>
  );
}
