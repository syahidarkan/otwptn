import dynamic from 'next/dynamic'
import HeroSection from '@/components/landing/HeroSection'
import PTNLogoSection from '@/components/landing/PTNLogoSection'

// Dynamically import below-the-fold sections to optimize mobile First Contentful Paint (FCP) and eliminate TBT
const EssayCheckerSection = dynamic(() => import('@/components/landing/EssayCheckerSection'))
const KenapaSection = dynamic(() => import('@/components/landing/KenapaSection'))
const FiturSection = dynamic(() => import('@/components/landing/FiturSection'))
const MentorSection = dynamic(() => import('@/components/landing/MentorSection'))
const OmegleSection = dynamic(() => import('@/components/landing/OmegleSection'))
const PricingSection = dynamic(() => import('@/components/landing/PricingSection'))
const TestimonialSection = dynamic(() => import('@/components/landing/TestimonialSection'))
const StatsCTASection = dynamic(() => import('@/components/landing/StatsCTASection'))
const FAQSection = dynamic(() => import('@/components/landing/FAQSection'))

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
