import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  Typography,
} from '@mui/material';
import { Icons } from '@/lib/iconHash';
import { FAQS } from '../constant/landingContent';
import { INK, INK_SOFT } from '../constant/landingTheme';

export function FaqSection() {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
          <Typography color="#6e56cf" fontWeight={700} sx={{ mb: 1 }}>
            FAQs
          </Typography>
          <Typography
            variant="h3"
            fontWeight={800}
            color={INK}
            letterSpacing="-0.02em"
            sx={{ fontSize: { xs: '1.9rem', md: '2.5rem' } }}
          >
            Everything you need to know
          </Typography>
        </Box>

        {FAQS.map((faq) => (
          <Accordion
            key={faq.question}
            disableGutters
            elevation={0}
            sx={{
              mb: 1.5,
              borderRadius: '16px !important',
              border: '1px solid rgba(27,28,57,0.08)',
              '&:before': { display: 'none' },
              bgcolor: '#fff',
            }}
          >
            <AccordionSummary expandIcon={<Icons.ExpandMore />} sx={{ px: 3, py: 1 }}>
              <Typography fontWeight={700} color={INK}>
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pb: 2.5 }}>
              <Typography color={INK_SOFT}>{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
}
