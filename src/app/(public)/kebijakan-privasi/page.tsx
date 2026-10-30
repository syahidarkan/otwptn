export const metadata = { title: 'Kebijakan Privasi — otwptn' }

export default function KebijakanPrivasiPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <h1 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--fg)' }}>Kebijakan Privasi</h1>
        <p className="text-sm mb-10" style={{ color: 'var(--muted)' }}>Terakhir diperbarui: 1 Oktober 2025</p>

        {[
          { title: '1. Data yang Kami Kumpulkan', body: `Kami mengumpulkan data yang Anda berikan secara langsung saat mendaftar atau menggunakan layanan: nama, alamat email, data profil akademik (nilai rapor, sekolah, prestasi), dan konten essay yang Anda unggah. Kami juga mengumpulkan data penggunaan secara otomatis seperti halaman yang dikunjungi dan fitur yang digunakan.` },
          { title: '2. Penggunaan Data', body: `Data Anda kami gunakan untuk: (a) menyediakan dan meningkatkan layanan otwptn, (b) mempersonalisasi rekomendasi strategi masuk PTN, (c) mengirim notifikasi terkait layanan, (d) analisis aggregate yang tidak mengidentifikasi Anda secara pribadi. Kami tidak menjual data pribadi Anda kepada pihak ketiga.` },
          { title: '3. Keamanan Data', body: `Kami menerapkan enkripsi TLS untuk semua data yang ditransmisikan, autentikasi aman melalui Supabase Auth, dan Row-Level Security (RLS) di database sehingga setiap pengguna hanya dapat mengakses data miliknya sendiri. Data disimpan di server Supabase yang berlokasi di region Asia Tenggara.` },
          { title: '4. Berbagi Data dengan Pihak Ketiga', body: `Kami menggunakan layanan pihak ketiga berikut untuk operasional platform: Supabase (database & autentikasi), OpenAI/Groq (pemrosesan AI — konten essay dikirim untuk analisis), dan penyedia pembayaran untuk transaksi upgrade. Semua mitra terikat kewajiban kerahasiaan data.` },
          { title: '5. Hak Pengguna', body: `Anda berhak untuk: meminta akses ke data pribadi Anda, meminta koreksi data yang tidak akurat, meminta penghapusan akun dan seluruh data Anda, serta mencabut persetujuan penggunaan data. Hubungi kami di halo@otwptn.id untuk mengajukan permintaan tersebut.` },
          { title: '6. Penyimpanan dan Penghapusan', body: `Data akun aktif disimpan selama Anda menggunakan layanan. Setelah akun dihapus, data Anda akan dihapus permanen dari sistem kami dalam waktu 30 hari, kecuali ada kewajiban hukum untuk menyimpannya lebih lama.` },
          { title: '7. Perubahan Kebijakan', body: `Kebijakan ini dapat diperbarui sewaktu-waktu. Perubahan material akan kami beritahukan melalui email atau notifikasi dalam aplikasi. Penggunaan layanan setelah notifikasi dianggap sebagai penerimaan kebijakan yang diperbarui.` },
          { title: '8. Kontak', body: `Untuk pertanyaan terkait privasi, hubungi kami di: halo@otwptn.id atau melalui komunitas WhatsApp otwptn.` },
        ].map(({ title, body }) => (
          <div key={title} className="mb-8">
            <h2 className="text-base font-bold mb-2" style={{ color: 'var(--fg)' }}>{title}</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
