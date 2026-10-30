export const metadata = { title: 'Syarat & Ketentuan - otwptn' }

export default function SyaratKetentuanPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <h1 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--fg)' }}>Syarat &amp; Ketentuan</h1>
        <p className="text-sm mb-10" style={{ color: 'var(--muted)' }}>Terakhir diperbarui: 1 Oktober 2025</p>

        {[
          { title: '1. Penerimaan Syarat', body: `Dengan mendaftar atau menggunakan layanan otwptn, Anda menyetujui syarat dan ketentuan ini. Jika tidak setuju, harap tidak menggunakan layanan kami. Layanan ini dioperasikan oleh PT. Lembaga Sains Nasional.` },
          { title: '2. Eligibilitas', body: `Layanan otwptn diperuntukkan bagi siswa SMA/SMK/MA sederajat yang sedang mempersiapkan masuk PTN melalui jalur non-tes (SNBP, jalur prestasi, essay, dll). Anda harus berusia minimal 13 tahun atau mendapat persetujuan orang tua/wali.` },
          { title: '3. Akun dan Keamanan', body: `Anda bertanggung jawab menjaga kerahasiaan kata sandi akun. Jangan bagikan akses akun kepada pihak lain. Laporkan segera jika Anda mencurigai akses tidak sah ke akun Anda. Setiap aktivitas dari akun Anda adalah tanggung jawab Anda.` },
          { title: '4. Pembayaran dan Refund', body: `Harga paket yang tertera sudah termasuk semua biaya. Pembayaran bersifat sekali bayar (one-time). Refund dapat diajukan dalam 7 hari setelah pembelian jika layanan tidak sesuai dengan deskripsi. Pengajuan refund melalui otwptn.com@gmail.com dengan menyertakan bukti transaksi.` },
          { title: '5. Konten dan Hak Kekayaan Intelektual', body: `Seluruh konten di platform otwptn (modul e-course, materi, desain) adalah hak milik PT. Lembaga Sains Nasional dan dilindungi hukum. Dilarang menyalin, mendistribusikan, atau mereproduksi konten tanpa izin tertulis. Essay dan dokumen yang Anda unggah tetap menjadi hak milik Anda.` },
          { title: '6. Penggunaan yang Dilarang', body: `Dilarang: (a) menyalahgunakan layanan untuk tujuan ilegal, (b) mencoba mengakses data pengguna lain, (c) mengunggah konten yang melanggar hukum atau merugikan pihak lain, (d) melakukan reverse engineering pada platform, (e) berbagi akses akun berbayar secara komersial.` },
          { title: '7. Disclaimer Hasil', body: `otwptn menyediakan alat bantu dan panduan berbasis AI. Kami tidak menjamin keberhasilan masuk PTN. Hasil analisis AI bersifat estimasi dan tidak menggantikan penilaian resmi dari PTN terkait. Keputusan penerimaan sepenuhnya berada pada wewenang masing-masing PTN.` },
          { title: '8. Perubahan Layanan', body: `Kami berhak mengubah, menangguhkan, atau menghentikan fitur layanan kapan saja dengan pemberitahuan wajar. Untuk perubahan yang berdampak signifikan pada paket berbayar, kami akan memberikan notifikasi minimal 30 hari sebelumnya.` },
          { title: '9. Hukum yang Berlaku', body: `Syarat dan ketentuan ini tunduk pada hukum Republik Indonesia. Sengketa diselesaikan melalui musyawarah mufakat, dan jika tidak tercapai, melalui Pengadilan Negeri Jakarta Selatan.` },
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
