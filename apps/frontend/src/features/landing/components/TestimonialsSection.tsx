import { Box, Container, Typography } from '@mui/material';
import { TestimonialCard } from './TestimonialCard';
import { TESTIMONIALS } from '../constant/landingContent';
import { INK, INK_SOFT } from '../constant/landingTheme';

export function TestimonialsSection() {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'rgba(110,86,207,0.04)' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
          <Typography color="#6e56cf" fontWeight={700} sx={{ mb: 1 }}>
            Testimonials
          </Typography>
          <Typography
            variant="h3"
            fontWeight={800}
            color={INK}
            letterSpacing="-0.02em"
            sx={{ fontSize: { xs: '1.9rem', md: '2.5rem' } }}
          >
            What agencies are saying
          </Typography>
          <Typography color={INK_SOFT} sx={{ mt: 2 }}>
            Trusted by teams that run their client work on AgencyOS.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          }}
        >
          {TESTIMONIALS.map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
