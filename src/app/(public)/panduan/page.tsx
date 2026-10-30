import Link from 'next/link'
import { BookOpen, FileText, Calculator, MessageSquare, Target, FolderOpen, Users } from 'lucide-react'

const GUIDES = [
  {
    icon: BookOpen, title: 'Memulai di otwptn',
    steps: [
      'Daftar akun gratis di halaman Daftar',
      'Lengkapi profil sekolah dan nilai rapormu',
      'Tambahkan jalur PTN yang ingin kamu tuju',
      'Mulai gunakan fitur-fitur sesuai kebutuhan',
    ]
  },
  {
    icon: FileText, title: 'Essay AI Review',
    steps: [
      'Klik "Essay Baru" untuk mulai esai baru',
      'Tulis atau paste esai motivasimu ke editor',
      'Klik "Review dengan AI" untuk mendapat feedback',
      'Highlight kuning = perlu diperbaiki, hijau = bagus',
      'Revisi dan submit ulang untuk cek progress',
    ]
  },
  {
    icon: Calculator, title: 'Kalkulator Peluang',
    steps: [
      'Pilih jalur PTN yang ingin dihitung peluangnya',
      'Isi profil akademik: nilai rapor, sertifikat, prestasi',
      'AI akan menganalisis dan memberikan estimasi peluang',
      'Gunakan hasilnya untuk menyusun strategi',
    ]
  },
  {
    icon: MessageSquare, title: 'Otbee AI Chat',
    steps: [
      'Ketik pertanyaan apapun seputar masuk PTN non-tes',
      'Otbee adalah AI yang fokus pada SNBP, essay, dan strategi',
      'Bisa tanya soal jalur spesifik, tips essay, dll',
      'Riwayat chat disimpan per sesi',
    ]
  },
  {
    icon: Target, title: 'Atur Strategi',
    steps: [
      'Isi profil lengkap di Kalkulator Peluang terlebih dahulu',
      'Pergi ke halaman Atur Strategi',
      'AI akan menyusun roadmap personal berdasarkan profilmu',
      'Ikuti langkah-langkah yang direkomendasikan',
    ]
  },
  {
    icon: FolderOpen, title: 'Penyimpanan Dokumen',
    steps: [
      'Tambahkan jalur target di Tracking Jalur',
      'Dokumen checklist otomatis muncul per jalur',
      'Centang dokumen yang sudah disiapkan',
      'Progress tersimpan otomatis',
    ]
  },
  {
    icon: Users, title: 'Mentor Alumni',
    steps: [
      'Upgrade ke paket Nectar/Honeycomb/Queen Bee',
      'Konsultasi dengan mentor alumni UI, ITB, UGM via WA',
      'Dapatkan revisi essay langsung dari mentor',
      'Sesi 1-on-1 tersedia di paket Honeycomb ke atas',
    ]
  },
]

export default function PanduanPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3" style={{ color: 'var(--fg)' }}>Panduan Penggunaan</h1>
          <p className="text-base" style={{ color: 'var(--muted)' }}>Panduan lengkap menggunakan semua fitur otwptn untuk persiapan masuk PTN non-tes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GUIDES.map(({ icon: Icon, title, steps }) => (
            <div key={title} className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>
                  <Icon size={18} />
                </div>
                <h2 className="font-extrabold text-base" style={{ color: 'var(--fg)' }}>{title}</h2>
              </div>
              <ol className="space-y-2">
                {steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--muted)' }}>
                    <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5" style={{ background: 'var(--bg-alt)', color: 'var(--fg)' }}>{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        <div className="mt-10 card p-8 text-center">
          <p className="text-base font-bold mb-2" style={{ color: 'var(--fg)' }}>Masih ada pertanyaan?</p>
          <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>Tanya langsung ke Otbee AI atau bergabung ke komunitas WhatsApp kami</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard/otbee" className="btn btn-primary px-6 py-3 text-sm">Tanya Otbee AI</Link>
            <Link href="/komunitas" className="btn btn-dark px-6 py-3 text-sm">Komunitas WhatsApp</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
