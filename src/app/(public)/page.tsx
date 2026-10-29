import HeroSection from '@/components/landing/HeroSection'
import EssayCheckerSection from '@/components/landing/EssayCheckerSection'
import PTNLogoSection from '@/components/landing/PTNLogoSection'
import KenapaSection from '@/components/landing/KenapaSection'
import FiturSection from '@/components/landing/FiturSection'
import MentorSection from '@/components/landing/MentorSection'
import OmegleSection from '@/components/landing/OmegleSection'
import PricingSection from '@/components/landing/PricingSection'
import TestimonialSection from '@/components/landing/TestimonialSection'
import StatsCTASection from '@/components/landing/StatsCTASection'
import FAQSection from '@/components/landing/FAQSection'

export default function HomePage() {
  return (
    <>
      <div style={{ background: 'var(--hero-grad)' }}>
        <HeroSection />
      </div>
      <PTNLogoSection />
      <div style={{ background: 'var(--hero-grad)' }}>
        <EssayCheckerSection />
      </div>
      <KenapaSection />
      <FiturSection />
      <MentorSection />
      <OmegleSection />
      <PricingSection />
      <TestimonialSection />
      <StatsCTASection />
      <FAQSection />
    </>
  )
}
