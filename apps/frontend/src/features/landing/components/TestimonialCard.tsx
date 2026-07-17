import { Avatar, Paper, Stack, Typography } from '@mui/material';
import { CARD_SHADOW, INK, INK_SOFT } from '../constant/landingTheme';
import type { ITestimonial } from '../constant/landingContent';

export function TestimonialCard({ testimonial }: { testimonial: ITestimonial }) {
  return (
    <Paper
      elevation={0}
      sx={{ p: 3, height: '100%', borderRadius: 4, bgcolor: '#fff', boxShadow: CARD_SHADOW }}
    >
      <Typography color={INK} sx={{ mb: 3, lineHeight: 1.6 }}>
        “{testimonial.quote}”
      </Typography>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ bgcolor: 'rgba(110,86,207,0.15)', color: '#6e56cf', fontWeight: 700 }}>
          {testimonial.initials}
        </Avatar>
        <Stack>
          <Typography fontWeight={700} color={INK} sx={{ fontSize: 14 }}>
            {testimonial.name}
          </Typography>
          <Typography color={INK_SOFT} sx={{ fontSize: 13 }}>
            {testimonial.role}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
