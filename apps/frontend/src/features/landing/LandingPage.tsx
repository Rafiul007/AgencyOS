import { Box } from '@mui/material';
import { LandingNavbar } from './components/LandingNavbar';
import { HeroSection } from './components/HeroSection';
import { TrustedPartners } from './components/TrustedPartners';
import { BenefitsSection } from './components/BenefitsSection';
import { FeatureShowcaseSection } from './components/FeatureShowcaseSection';
import { PricingSection } from './components/PricingSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FaqSection } from './components/FaqSection';
import { ContactCtaSection } from './components/ContactCtaSection';
import { LandingFooter } from './components/LandingFooter';
import { Reveal } from '@/components/Reveal';
import { PAGE_GRADIENT } from './constant/landingTheme';

export function LandingPage() {
  return (
    <Box sx={{ minHeight: '100vh', background: PAGE_GRADIENT }}>
      <LandingNavbar />
      <HeroSection />
      <Reveal>
        <TrustedPartners />
      </Reveal>
      <Box sx={{ bgcolor: '#fff' }}>
        <BenefitsSection />
        <FeatureShowcaseSection />
        <PricingSection />
        <TestimonialsSection />
        <FaqSection />
        <Reveal>
          <ContactCtaSection />
        </Reveal>
        <LandingFooter />
      </Box>
    </Box>
  );
}
