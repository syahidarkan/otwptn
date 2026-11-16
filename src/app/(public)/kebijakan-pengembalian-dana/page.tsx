import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Mail, MessageCircle } from 'lucide-react'
import { LEGAL_ENTITY } from '@/lib/constants'

export const metadata = {
  title: 'Kebijakan Pengembalian Dana (Refund Policy) - otwptn',
  description: 'Ketentuan dan prosedur resmi pengembalian dana untuk pembelian paket bimbingan dan layanan di platform otwptn (PT. Lembaga Sains Nasional).',
}

export default function KebijakanPengembalianDanaPage() {
  return (
    <div className="min-h-screen py-24 sm:py-28" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft size={14} /> Kembali ke Beranda
        </Link>

        <div className="mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-3">
            <ShieldCheck size={14} className="text-amber-600" />
            Standar Transparansi Konsumen
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-gray-950">
            Kebijakan Pengembalian Dana
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Dikeluarkan resmi oleh {LEGAL_ENTITY.name} · Terakhir diperbarui: 16 November 2026
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-gray-700">
          <section className="space-y-3">
            <h2 className="text-lg font-black text-gray-950">1. Prinsip Umum & Komitmen Layanan</h2>
            <p>
              otwptn (di bawah naungan <strong>{LEGAL_ENTITY.name}</strong>) berkomitmen memberikan layanan bimbingan seleksi PTN non-tes dan teknologi AI terbaik bagi seluruh pengguna. Kami memberlakukan kebijakan pengembalian dana (refund) yang jelas, adil, dan transparan sesuai peraturan perundang-undangan perlindungan konsumen Republik Indonesia.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-gray-950">2. Syarat & Ketentuan Pengajuan Refund</h2>
            <p>Pengguna berhak mengajukan permohonan pengembalian dana dalam kondisi berikut:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Kegagalan Sistem / Double Payment:</strong> Terjadi pendebetan ganda pada rekening bank/e-wallet pengguna untuk satu nomor tagihan transaksi yang sama.
              </li>
              <li>
                <strong>Layanan Tidak Teraktivasi:</strong> Pembayaran telah dinyatakan sukses oleh Payment Gateway resmi (DOKU / Mayar / Midtrans), namun hak akses fitur atau paket belum aktif dalam waktu 1x24 jam setelah bukti pembayaran diverifikasi.
              </li>
              <li>
                <strong>Ketidaksesuaian Layanan Mentoring (Paket Nectar, Honeycomb, Royal Jelly):</strong> Mentor alumni berhalangan hadir secara permanen dan otwptn tidak dapat menyediakan mentor pengganti yang setara dalam waktu 7 (tujuh) hari kerja sejak jadwal bimbingan pertama disepakati.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-gray-950">3. Kondisi yang Tidak Memenuhi Syarat Refund</h2>
            <p>Pengembalian dana tidak dapat diberikan dalam keadaan:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Layanan digital, kredit token AI, atau modul e-course telah diakses, digunakan, atau dikonsumsi oleh pengguna.</li>
              <li>Sesi mentoring privat atau ulasan esai 1-on-1 telah terlaksana sebagian atau seluruhnya oleh mentor alumni kampus tujuan.</li>
              <li>Siswa dinyatakan tidak lolos seleksi masuk PTN, karena kelulusan merupakan hak prerogatif dan otoritas independen panitia SNPMB dan masing-masing universitas negeri.</li>
              <li>Perubahan keputusan pribadi pengguna (buyer&apos;s remorse) setelah transaksi pembayaran diverifikasi berhasil.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-gray-950">4. Prosedur & Jangka Waktu Pencairan</h2>
            <p>
              Untuk mengajukan pengembalian dana, pengguna wajib mengirimkan permohonan tertulis dalam kurun waktu maksimal <strong>3 (tiga) hari kalender</strong> sejak tanggal transaksi dengan melampirkan:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>Invoice / Bukti transfer sah dengan nomor referensi transaksi.</li>
              <li>Alamat email terdaftar di platform otwptn.</li>
              <li>Nomor rekening bank tujuan pengembalian dana (harus atas nama siswa atau orang tua siswa yang bersangkutan).</li>
            </ol>
            <p className="mt-2">
              Tim finance kami akan melakukan verifikasi data dalam 1–3 hari kerja. Dana yang disetujui akan ditransfer kembali ke rekening pengguna dalam waktu <strong>3–7 hari kerja</strong> (dikurangi biaya administrasi antar-bank resmi jika ada).
            </p>
          </section>

          <section className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
              <MessageCircle size={16} className="text-amber-700" /> Kontak Resmi Layanan Konsumen
            </h3>
            <p className="text-xs text-amber-900 leading-relaxed">
              Kirimkan permohonan atau pertanyaan terkait transaksi Anda ke tim Customer Care resmi kami:
            </p>
            <div className="pt-1 text-xs font-semibold text-amber-950 space-y-1">
              <p>Email: <a href="mailto:support@otwptn.com" className="underline font-bold">support@otwptn.com</a></p>
              <p>WhatsApp Care: <a href="https://wa.me/6285190806070" target="_blank" rel="noreferrer" className="underline font-bold">+62 851-9080-6070</a></p>
              <p>Badan Hukum: {LEGAL_ENTITY.name}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
