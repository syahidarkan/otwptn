import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/landing/HeroSection'
import HowItWorks from '@/components/landing/HowItWorks'
import KategoriSection from '@/components/landing/KategoriSection'
import PricingSection from '@/components/landing/PricingSection'
import JalurDirectory from '@/components/landing/JalurDirectory'
import MentorSection from '@/components/landing/MentorSection'
import EcourseTeaser from '@/components/landing/EcourseTeaser'
import FAQSection from '@/components/landing/FAQSection'

export default function RootPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
        <KategoriSection />
        <PricingSection />
        <JalurDirectory />
        <MentorSection />
        <EcourseTeaser />
        <FAQSection />
      </main>
      <Footer />
    </>
  )
}
