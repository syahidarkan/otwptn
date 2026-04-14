import Navbar from '@/components/layout/Navbar'

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
    </>
  )
}
