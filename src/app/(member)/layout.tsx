import Sidebar from '@/components/dashboard/Sidebar'
import SpotlightTour from '@/components/dashboard/SpotlightTour'
import DailyPromoModal from '@/components/dashboard/DailyPromoModal'

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-alt)', minHeight: '100vh' }}>
      <Sidebar />
      <main className="md:ml-64 pt-14 md:pt-0 min-h-screen">
        {children}
      </main>
      <SpotlightTour />
      <DailyPromoModal />
    </div>
  )
}
