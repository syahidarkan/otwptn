'use client'

import dynamic from 'next/dynamic'

const AdminSwitcher = dynamic(() => import('./AdminSwitcher'), { ssr: false })

export default function AdminSwitcherLoader() {
  return <AdminSwitcher />
}
