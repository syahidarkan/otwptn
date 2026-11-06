'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function RaporProfilPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/mentor?tab=profile-rapor')
  }, [router])

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center space-y-3">
      <Loader2 size={24} className="animate-spin text-amber-500" />
      <p className="text-xs text-gray-500 font-medium">Mengalihkan ke tab Rapor &amp; Profil di Mentor Alumni...</p>
    </div>
  )
}
