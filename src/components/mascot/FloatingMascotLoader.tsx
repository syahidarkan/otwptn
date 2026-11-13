'use client'

import dynamic from 'next/dynamic'

const FloatingMascot = dynamic(() => import('./FloatingMascot'), { ssr: false })

export default function FloatingMascotLoader() {
  return <FloatingMascot />
}
