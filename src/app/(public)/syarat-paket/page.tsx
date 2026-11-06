import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Shield, AlertCircle, Sparkles, Clock, Users, BookOpen } from 'lucide-react'

export const metadata = {
  title: 'Peraturan & Ketentuan Paket - otwptn',
  description: 'Panduan lengkap hak, kewajiban, masa berlaku, dan batasan tiap paket bimbingan otwptn dari Akun Premium hingga Royal Jelly.',
}

export default function SyaratPaketPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-24">
        {/* Breadcrumb / Back button */}
        <Link
          href="/upgrade"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Kembali ke Pilihan Paket
        </Link>

        <div className="mb-12">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full inline-block mb-3">
            Dokumen Kebijakan Layanan & Transparansi
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-gray-950 tracking-tight mb-3">
            Peraturan & Ketentuan Paket Layanan
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
            Harap membaca seluruh hak akses, masa aktif, batasan, dan tata tertib bimbingan sebelum melakukan transaksi. Pembelian paket di otwptn tunduk pada ketentuan tertulis berikut.
          </p>
        </div>

        {/* SECTION 1: MODE BELAJAR */}
        <div className="mb-14 p-6 md:p-8 rounded-3xl bg-gray-50 border border-gray-100 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center flex-shrink-0">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-950">1. Skema Mode Pendaftaran</h2>
              <p className="text-xs text-gray-500">Pilihan keikutsertaan per orangan atau bersama kelompok belajar.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-white border border-gray-200/80 space-y-2">
              <span className="text-xs font-black text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full inline-block">
                Mode Individu
              </span>
              <h3 className="text-sm font-bold text-gray-900">Privat untuk 1 Siswa</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Ditujukan untuk persiapan intensif personal. Akses platform, AI, riwayat dokumen, serta sesi bimbingan mentor hanya terhubung ke satu email akun terdaftar. Seluruh feedback mentor bersifat rahasia dan spesifik mengupas profil akademik kamu.
              </p>
              <p className="text-[11px] text-gray-400 font-medium pt-1">
                Dapat menggunakan kode referral ambassador untuk potongan harga.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-200/80 space-y-2">
              <span className="text-xs font-black text-sky-900 bg-sky-50 px-2.5 py-0.5 rounded-full inline-block">
                Mode Squad (Circle)
              </span>
              <h3 className="text-sm font-bold text-gray-900">Kelompok Belajar (Harga Spesial)</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Ditujukan untuk kamu yang mendaftar bersama teman satu sekolah atau tim belajar. Setiap anggota mendapatkan akun masing-masing dengan benefit paket yang dipilih. Biaya per orang menjadi jauh lebih hemat karena sistem bundling kelompok.
              </p>
              <p className="text-[11px] text-gray-400 font-medium pt-1">
                Ketua squad menerima link undangan khusus setelah pembayaran selesai untuk dibagikan ke anggota tim.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: FOKUS & RUMPUN JALUR */}
        <div className="mb-14 p-6 md:p-8 rounded-3xl bg-gray-50 border border-gray-100 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center flex-shrink-0">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-950">2. Klasifikasi Rumpun & Fokus Seleksi</h2>
              <p className="text-xs text-gray-500">Materi bimbingan disesuaikan dengan jenis seleksi PTN yang kamu tuju.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 space-y-2">
              <h3 className="text-xs font-black text-gray-900">A. Essay Only</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Fokus penuh pada penyusunan motivation letter, personal statement, dan esai reflektif (contoh: PPKB UI, Talent Scouting UI, SBM ITB, IUP UGM/Airlangga). Mentor membimbing perumusan hook, struktur STAR, dan konsistensi visi prodi.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 space-y-2">
              <h3 className="text-xs font-black text-gray-900">B. Prestasi Only</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Fokus pada kurasi sertifikat Puspresnas, OSN, O2SN, FLS2N, rekam jejak kepemimpinan (Ketua OSIS), kepramukaan, dan sertifikasi kejuaraan untuk seleksi PBUB UGM, SJP IPB, Golden Ticket UNAIR, dan SNBP.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 space-y-2">
              <h3 className="text-xs font-black text-gray-900">C. Hybrid (Essay + Prestasi)</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Pendampingan komprehensif mengawinkan kekuatan portofolio prestasi dan ketajaman narasi esai motivasi. Solusi terbaik bagi siswa yang membidik beberapa jalur non-tes sekaligus dalam 1 musim seleksi.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: RINCIAN PER PAKET */}
        <div className="space-y-10">
          <div>
            <h2 className="text-xl font-black text-gray-950 tracking-tight">
              3. Detail Hak, Batasan, dan Peraturan Tiap Paket
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Dipaparkan secara rinci dari Akun Premium hingga Royal Jelly.
            </p>
          </div>

          {/* 1. AKUN PREMIUM */}
          <div className="p-6 md:p-8 rounded-3xl bg-white border-2 border-gray-100 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  Level 1 - Self Service Platform
                </span>
                <h3 className="text-lg font-black text-gray-900 mt-1">Akun Premium</h3>
              </div>
              <span className="text-xs font-bold text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                Masa Berlaku: 30 Hari Aktif
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-gray-700">
              <p className="font-bold text-gray-900">A. Fasilitas yang Didapatkan:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Akses penuh chat konsultan Otbee AI tanpa batasan harian (dilengkapi safety-cap 5 jam untuk pencegahan otomatisasi bot).</li>
                <li>Fitur Essay AI Review & Scoring instan tanpa batas kuota.</li>
                <li>Kalkulator Peluang SNBP & Seleksi Mandiri berbasis rapor tanpa batas hitung.</li>
                <li>Fitur Atur Strategi pilihan prodi 1 vs pilihan 2 dan pembobotan sertifikat.</li>
                <li>Akses 100% ke seluruh modul e-course (110 lesson, video pembelajaran, rangkuman materi, dan lembar kerja).</li>
                <li>Hak membuat Study Circle baru di dashboard Komunitas untuk memimpin diskusi.</li>
              </ul>

              <p className="font-bold text-gray-900 pt-2">B. Batasan Layanan:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Tidak mencakup review tulisan manual oleh mentor alumni (hanya evaluasi otomatis AI).</li>
                <li>Tidak mencakup sesi tatap muka Google Meet atau Zoom privat.</li>
                <li>Tidak mendapatkan slot grup WhatsApp mentor maupun koordinasi hotline.</li>
              </ul>

              <p className="font-bold text-gray-900 pt-2">C. Peraturan & Syarat:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Akses bersifat personal dan dilarang diperjualbelikan atau dibagikan ke pihak ketiga (sistem mendeteksi multi-device login mencurigakan).</li>
                <li>Perpanjangan akun dilakukan secara mandiri sebelum masa aktif 30 hari berakhir.</li>
              </ul>
            </div>
          </div>

          {/* 2. PAKET NECTAR */}
          <div className="p-6 md:p-8 rounded-3xl bg-white border-2 border-amber-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  Level 2 - Async Mentorship
                </span>
                <h3 className="text-lg font-black text-gray-900 mt-1">Paket Nectar</h3>
              </div>
              <span className="text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Masa Berlaku: Hingga 2x Putaran Review Selesai (Maks. 45 Hari)
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-gray-700">
              <p className="font-bold text-gray-900">A. Fasilitas yang Didapatkan:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Otomatis mendapatkan seluruh fitur Akun Premium</strong> aktif selama periode bimbingan.</li>
                <li>2 (dua) kali putaran review dan anotasi mendalam draf esai motivasi atau berkas prestasi oleh mentor alumni PTN top (UI, ITB, UGM, Unair).</li>
                <li>Feedback koreksi tertulis kalimat per kalimat di Google Docs / dokumen bimbingan, mencakup evaluasi hook pembuka, relevansi visi prodi, dan pembuktian pengalaman.</li>
                <li>Validasi berkas dokumen kelayakan administratif seleksi.</li>
              </ul>

              <p className="font-bold text-gray-900 pt-2">B. Batasan Layanan:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Bimbingan berlangsung secara tertulis / asinkron (tidak ada sesi tatap muka langsung via Zoom/Meet).</li>
                <li>Maksimal 2 putaran revisi draf naskah. Draf ketiga dan seterusnya memerlukan add-on revisi.</li>
                <li>Tidak mendapatkan grup WhatsApp khusus mentor (komunikasi review via dokumen dan notifikasi portal).</li>
              </ul>

              <p className="font-bold text-gray-900 pt-2">C. Peraturan & Syarat:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Draf esai wajib dikirimkan mentee minimal 3x24 jam sebelum deadline penutupan portal pendaftaran PTN, agar mentor memiliki waktu kerja yang cukup untuk analisis komprehensif.</li>
                <li>Mentor berhak meminta perbaikan format jika draf tidak memenuhi kriteria minimal panjang kata (minimal 250 kata).</li>
              </ul>
            </div>
          </div>

          {/* 3. PAKET HONEYCOMB */}
          <div className="p-6 md:p-8 rounded-3xl bg-white border-2 border-amber-300 shadow-md space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-950 bg-amber-300 px-2 py-0.5 rounded-full">
                  Level 3 - Live 1-on-1 Mentorship
                </span>
                <h3 className="text-lg font-black text-gray-900 mt-1">Paket Honeycomb</h3>
              </div>
              <span className="text-xs font-bold text-amber-950 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                Masa Berlaku: Hingga Musim Seleksi Selesai (Maks. 60 Hari)
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-gray-700">
              <p className="font-bold text-gray-900">A. Fasilitas yang Didapatkan:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Otomatis mendapatkan seluruh fitur Akun Premium</strong> aktif tanpa biaya tambahan.</li>
                <li>5 (lima) kali putaran revisi esai motivasi / kurasi portofolio sampai naskah dinilai prima oleh mentor.</li>
                <li>2 (dua) kali sesi privat live Zoom / Google Meet (durasi 45 menit per sesi) tatap muka langsung bersama mentor alumni jurusan tujuan.</li>
                <li>Akses Grup WhatsApp koordinasi eksklusif bertiga (Mentee, Mentor Alumni, dan Admin otwptn) untuk konsultasi harian cepat.</li>
                <li>Audit kelayakan sertifikat kejuaraan dan pencocokan dengan profil dewan juri PTN.</li>
              </ul>

              <p className="font-bold text-gray-900 pt-2">B. Batasan Layanan:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Sesi tatap muka daring dibatasi 2 kali sesi. Sesi tambahan dapat dijadwalkan dengan biaya add-on resmi.</li>
                <li>Jadwal temu Google Meet mengikuti ketersediaan kalender mentor yang tidak bertabrakan dengan tanggal blackout.</li>
              </ul>

              <p className="font-bold text-gray-900 pt-2">C. Peraturan & Syarat:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Booking sesi Meet wajib diajukan minimal H-2 sebelum jadwal yang diinginkan.</li>
                <li>Toleransi keterlambatan kehadiran di ruang Zoom maksimal 15 menit. Keterlambatan lebih dari batas tanpa konfirmasi sebelumnya akan menghitung kuota sesi tersebut telah terpakai.</li>
                <li>Komunikasi grup WhatsApp wajib menjaga etika santun pada jam operasional 08.00 - 21.00 WIB.</li>
              </ul>
            </div>
          </div>

          {/* 4. PAKET ROYAL JELLY */}
          <div className="p-6 md:p-8 rounded-3xl bg-amber-50/70 border-2 border-amber-400 shadow-lg space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-950 bg-amber-400 px-3 py-0.5 rounded-full shadow-2xs">
                  Level 4 - VIP Priority Full Guidance
                </span>
                <h3 className="text-xl font-black text-gray-950 mt-1">Paket Royal Jelly</h3>
              </div>
              <span className="text-xs font-bold text-amber-950 bg-amber-200 px-3 py-1 rounded-full border border-amber-400">
                Masa Berlaku: Pendampingan Penuh Hingga Hari Pengumuman Resmi PTN
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-gray-800">
              <p className="font-bold text-gray-950">A. Fasilitas Eksklusif yang Didapatkan:</p>
              <ul className="list-disc pl-5 space-y-1 font-medium">
                <li><strong>Otomatis mendapatkan seluruh fitur Akun Premium</strong> aktif sepanjang musim seleksi.</li>
                <li><strong>Revisi Esai & Portofolio Tanpa Batas (Unlimited Putaran):</strong> Mentor mendampingi sampai naskah sempurna dan siap diunggah ke portal resmi universitas.</li>
                <li><strong>Sesi Privat Google Meet / Zoom Tanpa Batas (Prioritas):</strong> Konsultasi tatap muka berkala untuk bedah esai, strategi pilihan cadangan, dan evaluasi berkas.</li>
                <li><strong>Fitur Eksklusif Rapor & Kelengkapan Profil (Scan OCR Rapor):</strong> Ekstraksi otomatis nilai rapor 5 semester + slot analisis linieritas dan komentar resmi mentor khusus akun Royal Jelly.</li>
                <li><strong>Simulasi Wawancara 1-on-1:</strong> Latihan tanya jawab komprehensif menguji kesiapan mental dan gestur untuk seleksi mandiri berbasis interview.</li>
                <li><strong>Exclusive Campus Tour & Trip ke Universitas Indonesia:</strong> Kunjungan langsung dan bimbingan temu mentor di lingkungan kampus bagi mentee yang memenuhi kriteria program.</li>
                <li><strong>Direct WhatsApp Hotline Mentor & Supervisi Tim Kurasi:</strong> Jalur cepat komunikasi koordinasi dokumen tanpa antrean.</li>
              </ul>

              <p className="font-bold text-gray-950 pt-2">B. Batasan Layanan:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Kuota peserta Royal Jelly sangat dibatasi per angkatan demi menjaga rasio bimbingan intensif 1-on-1.</li>
                <li>Kunjungan kampus (Exclusive Trip) mengikuti jadwal resmi yang ditentukan oleh tim operasional otwptn.</li>
              </ul>

              <p className="font-bold text-gray-950 pt-2">C. Peraturan & Syarat:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Mentee wajib berkomitmen mengunggah data rapor dan draft dokumen tepat waktu sesuai timeline yang telah disepakati bersama mentor.</li>
                <li>Seluruh dokumen dan sertifikat yang diunggah harus autentik dan dapat dipertanggungjawabkan keabsahannya.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FOOTER CTA */}
        <div className="mt-16 p-8 rounded-3xl bg-gray-900 text-white text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-gray-950 flex items-center justify-center mx-auto shadow-md">
            <Shield size={24} />
          </div>
          <h3 className="text-xl font-black">Siap Melangkah Menuju Kampus Impian?</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            Pilih paket yang paling sesuai dengan target persiapanmu. Dapatkan pendampingan teruji dari mentor alumni terbaik PTN.
          </p>
          <div className="pt-2">
            <Link
              href="/upgrade"
              className="btn btn-primary text-xs font-black px-8 py-3 rounded-full inline-block text-gray-950"
            >
              Lihat & Pilih Paket Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
