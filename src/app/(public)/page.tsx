import HeroSection from '@/components/landing/HeroSection'
import StatsBar from '@/components/landing/StatsBar'
import HowItWorks from '@/components/landing/HowItWorks'
import KategoriSection from '@/components/landing/KategoriSection'
import PricingSection from '@/components/landing/PricingSection'
import JalurDirectory from '@/components/landing/JalurDirectory'
import TestimonialSection from '@/components/landing/TestimonialSection'
import EcourseTeaser from '@/components/landing/EcourseTeaser'
import FAQSection from '@/components/landing/FAQSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <KategoriSection />
      <PricingSection />
      <JalurDirectory />
      <TestimonialSection />
      <EcourseTeaser />
      <FAQSection />
    </>
  )
}
