import { Box, Container, Stack, Typography } from '@mui/material';
import { Icons } from '@/lib/iconHash';
import { MockPanel } from './MockPanel';
import { FEATURE_BLOCKS } from '../constant/landingContent';
import type { IFeatureBlock } from '../constant/landingContent';
import { INK, INK_SOFT } from '../constant/landingTheme';

export function FeatureShowcaseSection() {
  return (
    <Box component="section" sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Stack spacing={{ xs: 8, md: 12 }}>
          {FEATURE_BLOCKS.map((block, index) => (
            <FeatureBlockRow key={block.title} block={block} reversed={index % 2 === 1} />
          ))}
        </Stack>
      </Container>
    </Box>
  );
}

function FeatureBlockRow({ block, reversed }: { block: IFeatureBlock; reversed: boolean }) {
  return (
    <Stack
      direction={{ xs: 'column', md: reversed ? 'row-reverse' : 'row' }}
      spacing={{ xs: 4, md: 8 }}
      alignItems="center"
    >
      <Box sx={{ flex: 1 }}>
        <Typography color="#6e56cf" fontWeight={700} sx={{ mb: 1 }}>
          {block.eyebrow}
        </Typography>
        <Typography
          variant="h4"
          fontWeight={800}
          color={INK}
          letterSpacing="-0.02em"
          sx={{ fontSize: { xs: '1.6rem', md: '2.1rem' }, lineHeight: 1.15 }}
        >
          {block.title}
        </Typography>
        <Typography color={INK_SOFT} sx={{ mt: 2, mb: 3 }}>
          {block.description}
        </Typography>
        <Stack spacing={1.25}>
          {block.points.map((point) => (
            <Stack key={point} direction="row" spacing={1.25} alignItems="center">
              <Icons.Check sx={{ fontSize: 20, color: '#2ea06e' }} />
              <Typography color={INK} fontWeight={500}>
                {point}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
      <Box sx={{ flex: 1, width: '100%' }}>
        <MockPanel variant={block.variant} />
      </Box>
    </Stack>
  );
}
