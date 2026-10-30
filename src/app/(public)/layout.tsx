import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import InteractiveOtbee3D from '@/components/mascot-3d/InteractiveOtbee3D'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-light-theme light min-h-screen flex flex-col bg-white text-gray-900" data-theme="light">
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.classList.remove('dark');document.documentElement.setAttribute('data-theme','light');`,
        }}
      />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <InteractiveOtbee3D mode="floating" />
    </div>
  )
}
