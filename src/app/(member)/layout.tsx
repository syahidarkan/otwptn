import Sidebar from '@/components/dashboard/Sidebar'
import SpotlightTour from '@/components/dashboard/SpotlightTour'
import DailyPromoModal from '@/components/dashboard/DailyPromoModal'
import BroadcastBanner from '@/components/dashboard/BroadcastBanner'

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-alt)', minHeight: '100vh' }}>
      <Sidebar />
      <main className="dashboard-main pt-14 md:pt-0 min-h-screen">
        <BroadcastBanner />
        {children}
      </main>
      <SpotlightTour />
      <DailyPromoModal />
    </div>
  )
}
