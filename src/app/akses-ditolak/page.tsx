import Button from '@/components/ui/Button'
import Link from 'next/link'

export default function AksesDitolak() {
  return (
    <div className="min-h-screen bg-brand-gray flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="text-2xl font-bold text-brand-black mb-3">Akses Ditolak</h1>
        <p className="text-brand-muted mb-6">
          Halaman ini hanya bisa diakses oleh member aktif. Daftar dan selesaikan pembayaran untuk mendapatkan akses.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button href="/daftar" variant="primary">Daftar Sekarang</Button>
          <Button href="/login" variant="ghost">Sudah Punya Akun</Button>
        </div>
        <Link href="/" className="block mt-4 text-sm text-brand-muted hover:underline">
          Kembali ke beranda
        </Link>
      </div>
    </div>
  )
}
