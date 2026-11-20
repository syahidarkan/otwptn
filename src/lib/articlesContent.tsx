import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Video, FolderLock,
  CalendarCheck, Gamepad2, Users, Award, DollarSign, BookOpen, ShieldCheck, Flame,
  FileText, School, UserCheck, Clock, ExternalLink
} from 'lucide-react'

export const ARTICLE_CONTENTS: Record<string, React.ReactNode> = {
  // ==========================================
  // 1. SJP UI (SELEKSI JALUR PRESTASI UI / JAPRES UI)
  // ==========================================
  'sjp-ui-jalur-prestasi-masuk-ui-tanpa-tes': (
    <>
      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        1. SJP UI (Seleksi Jalur Prestasi UI / Japres UI) Adalah: Jalur Resmi UI Tanpa Tes Tulis
      </h2>
      <p>
        Bagi kamu pejuang kampus kuning, <strong>SJP UI</strong> adalah sebutan resmi dan terpopuler dari <strong>Seleksi Jalur Prestasi Universitas Indonesia</strong> (kerap disingkat siswa sebagai <strong>Japres UI</strong>). Banyak situs informasi umum yang belum memahami istilah ini dan mengira seleksi prestasi hanya milik IPB University (padahal IPB jalur resminya bernama <strong>PIN IPB / Prestasi Internasional dan Nasional IPB</strong>).
      </p>
      <div className="card p-5 rounded-2xl bg-amber-50/80 border border-amber-200 my-4">
        <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-amber-600 flex-shrink-0" /> Keunggulan SJP UI / Japres UI:
        </h4>
        <p className="text-xs text-gray-700 leading-relaxed">
          <strong>SJP UI (Seleksi Jalur Prestasi UI)</strong> memberikan tiket emas masuk program Sarjana (S1) dan Vokasi (D3/D4) Universitas Indonesia murni berdasarkan <strong>sertifikat kejuaraan sains (OSN), riset (OPSI), olahraga (PON/Kejurnas), seni budaya (FLS2N), dan teknologi</strong> tanpa harus bertaruh di ujian tulis SIMAK CBT yang sangat ketat!
        </p>
      </div>

      {/* Infografis Gambar Resmi SJP UI untuk Google Images */}
      <figure className="my-6">
        <Image
          src="/images/jadwal/jadwal-sjp-ui-2026-seleksi-jalur-prestasi.webp"
          alt="Jadwal SJP UI 2026 - Timeline Resmi Seleksi Jalur Prestasi UI Tanpa Ujian Tulis"
          width={1200}
          height={675}
          className="w-full h-auto rounded-2xl border border-amber-200 shadow-md"
          priority
        />
        <figcaption className="text-center text-xs text-gray-500 font-semibold mt-2">
          Infografis Resmi: Timeline &amp; Alur Pendaftaran Seleksi Jalur Prestasi (SJP UI / Japres UI) 2026 oleh OtwPTN.com
        </figcaption>
      </figure>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        2. Tiga Pilar Jalur Prestasi &amp; Non-Tes Resmi Universitas Indonesia
      </h2>
      <div className="space-y-4 not-prose my-6">
        <div className="p-5 rounded-2xl bg-white border-2 border-amber-300 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-200 px-2.5 py-0.5 rounded-full">Pilar #1 Juara Lomba</span>
            <span className="text-xs font-bold text-amber-700">Sains, Olahraga &amp; Seni</span>
          </div>
          <h4 className="text-base font-black text-gray-900 mb-1">SJP UI / Japres UI (Seleksi Jalur Prestasi UI)</h4>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            Diperuntukkan bagi peraih medali Emas, Perak, Perunggu, atau Juara 1, 2, 3 di kompetisi bergengsi tingkat Nasional (OSN Kemendikbud, O2SN, FLS2N, PON, Kejurnas) dan Internasional. Menilai keselarasan sertifikat dengan program studi tujuan (misal: OSN Biologi untuk FK UI).
          </p>
          <div className="text-[11px] font-semibold text-gray-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            Penilaian: Keabsahan sertifikat Puspresnas / KONI / Kemenpora + verifikasi portofolio karya.
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">Pilar #2 Nilai Rapor &amp; Esai</span>
            <span className="text-xs font-bold text-emerald-600">Sarjana &amp; Vokasi D3/D4</span>
          </div>
          <h4 className="text-base font-black text-gray-900 mb-1">PPKB UI (Prestasi &amp; Pemerataan Kesempatan Belajar)</h4>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            Seleksi berbasis rekam jejak nilai rapor 5 semester dan esai motivasi (Personal Statement). Terbuka untuk seluruh jurusan Sarjana (S1) dan Vokasi UI melalui akun sekolah yang terakreditasi.
          </p>
          <div className="text-[11px] font-semibold text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            Penilaian: Konsistensi nilai rapor mata pelajaran pendukung, indeks prestasi sekolah, dan esai diri.
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full">Pilar #3 Kelas Internasional</span>
            <span className="text-xs font-bold text-sky-600">KKI Double Degree</span>
          </div>
          <h4 className="text-base font-black text-gray-900 mb-1">Talent Scouting UI</h4>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            Jalur non-tes khusus untuk program Sarjana Kelas Khusus Internasional (KKI UI) yang bermitra dengan universitas top dunia. Menilai rapor, sertifikat kemampuan Bahasa Inggris (TOEFL/IELTS), dan essay berbahasa Inggris.
          </p>
          <div className="text-[11px] font-semibold text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            Penilaian: Skor TOEFL/IELTS, esai motivasi KKI, dan konsistensi akademik sains/sosial.
          </div>
        </div>
      </div>

      {/* Gambar Timeline PPKB UI */}
      <figure className="my-6">
        <Image
          src="/images/jadwal/jadwal-ppkb-ui-2026-timeline-resmi.webp"
          alt="Timeline PPKB UI 2026 - Jadwal Resmi Jalur Rapor dan Esai Universitas Indonesia"
          width={1200}
          height={675}
          className="w-full h-auto rounded-2xl border border-emerald-200 shadow-md"
        />
        <figcaption className="text-center text-xs text-gray-500 font-semibold mt-2">
          Infografis Resmi: Jadwal &amp; Tahapan Seleksi PPKB UI 2026 oleh OtwPTN.com
        </figcaption>
      </figure>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        3. Bedanya SJP UI dengan PIN IPB (Prestasi Internasional &amp; Nasional IPB)
      </h2>
      <p>
        Biar kamu tidak tertukar istilah saat mendaftar:
      </p>
      <ul className="space-y-2 list-disc list-inside text-sm text-gray-700">
        <li><strong>SJP UI (Seleksi Jalur Prestasi UI):</strong> Jalur prestasi Universitas Indonesia. Sangat memprioritaskan juara lomba olimpiade sains (OSN), kejuaraan olahraga, dan seni.</li>
        <li><strong>PIN IPB (Prestasi Internasional dan Nasional IPB):</strong> Jalur prestasi resmi IPB University. Selain juara lomba, PIN IPB juga memiliki sub-jalur khusus untuk <strong>Ketua OSIS</strong> dan <strong>Pramuka Garuda</strong>.</li>
      </ul>

      {/* Gambar Timeline PIN IPB */}
      <figure className="my-6">
        <Image
          src="/images/jadwal/jadwal-pin-ipb-2026-prestasi-internasional-nasional.webp"
          alt="Jadwal PIN IPB 2026 - Prestasi Internasional dan Nasional IPB University"
          width={1200}
          height={675}
          className="w-full h-auto rounded-2xl border border-blue-200 shadow-md"
        />
        <figcaption className="text-center text-xs text-gray-500 font-semibold mt-2">
          Infografis Resmi: Jadwal PIN IPB (Prestasi Internasional &amp; Nasional) 2026 oleh OtwPTN.com
        </figcaption>
      </figure>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        4. Tips Memaksimalkan Peluang Lolos SJP UI / Japres UI dari Mentor Alumni
      </h2>
      <ul className="space-y-3 list-disc list-inside text-sm text-gray-700">
        <li><strong>Relevansi Linear Sertifikat:</strong> Pastikan kejuaraanmu selaras dengan jurusan yang dipilih. Juara OSN Kimia memiliki nilai konversi jauh lebih tinggi untuk Kedokteran/Farmasi dibanding sertifikat juara pidato.</li>
        <li><strong>Cek Kategori di Direktori Jalur:</strong> Pantau pembukaan pendaftaran SJP UI di <Link href="/jalur" className="text-amber-700 font-bold underline">Direktori Jalur OtwPTN</Link> agar tidak ada dokumen legalisir yang tertinggal.</li>
        <li><strong>Gunakan Kalkulator Peluang:</strong> Rasionalisasikan nilai rapor dan bobot sertifikatmu dengan data historis penerimaan UI di <Link href="/dashboard/kalkulator" className="text-amber-700 font-bold underline">Kalkulator Peluang OtwPTN</Link>.</li>
      </ul>

      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 my-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-black text-gray-900">Ingin Tahu Peluang Lolosmu di UI?</h4>
          <p className="text-xs text-gray-600">Hitung nilai rapor 5 semestermu dengan Kalkulator Peluang OtwPTN.</p>
        </div>
        <Link href="/dashboard/kalkulator" className="btn-brand-primary px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap">
          Cek Peluang UI Gratis <ArrowRight size={13} className="inline ml-1" />
        </Link>
      </div>
    </>
  ),

  // ==========================================
  // 2. OTBEE TV (STUDY CAM & VIDEO CALL)
  // ==========================================
  'otbee-tv-belajar-bareng-study-cam-pejuang-ptn': (
    <>
      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        1. Apa Itu Otbee TV? Ruang Belajar Virtual Pejuang Masuk PTN
      </h2>
      <p>
        Salah satu kendala terbesar pejuang seleksi non-tes (SNBP &amp; Mandiri Prestasi) adalah <strong>kejenuhan dan rasa kesepian</strong> saat harus merevisi esai berulang kali, merapikan berkas sertifikat, atau belajar mapel pendukung sendirian di kamar.
      </p>
      <p>
        <strong>Otbee TV</strong> adalah fitur ruang belajar interaktif (Study Cam / Study With Me) yang menghubungkanmu secara instan via video langsung dengan sesama pejuang PTN dari Sabang sampai Merauke.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose my-6">
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-center">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2">
            <Video size={18} />
          </div>
          <h4 className="text-xs font-black text-gray-900 mb-1">Random Peer Matching</h4>
          <p className="text-[11px] text-gray-600">Terhubung satu lawan satu dengan pejuang kampus impian untuk saling semangati.</p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-center">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2">
            <Flame size={18} />
          </div>
          <h4 className="text-xs font-black text-gray-900 mb-1">Akuntabilitas Pomodoro</h4>
          <p className="text-[11px] text-gray-600">Saling pantau fokus nulis draf esai dan belajar tanpa distraksi scroll medsos.</p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-center">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2">
            <ShieldCheck size={18} />
          </div>
          <h4 className="text-xs font-black text-gray-900 mb-1">Aman &amp; Terenkripsi</h4>
          <p className="text-[11px] text-gray-600">Fitur mute mic dan matikan kamera fleksibel, dengan sistem filter ramah pelajar.</p>
        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        2. Manfaat Belajar Bareng di Otbee TV Dibanding Belajar Sendiri
      </h2>
      <ul className="space-y-2 list-disc list-inside text-sm text-gray-700">
        <li><strong>Fokus Berlipat Ganda:</strong> Melihat teman di layar sedang tekun membaca dan mengetik memicu dorongan psikologis untuk ikut produktif.</li>
        <li><strong>Tukar Wawasan Jalur:</strong> Kamu bisa saling bertanya tentang aturan kuota sekolah, akreditasi, dan pengalaman lomba dari berbagai provinsi.</li>
        <li><strong>Hilangkan Stress Menjelang Deadline:</strong> Rasa cemas menjelang pengumuman SNBP atau submit berkas PPKB UI terasa jauh lebih ringan saat dihadapi bersama komunitas.</li>
      </ul>

      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 my-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-black text-gray-900">Yuk Coba Otbee TV Sekarang!</h4>
          <p className="text-xs text-gray-600">Nyalakan kamera, temukan teman belajar satu frekuensi, dan gaspol lolos PTN.</p>
        </div>
        <Link href="/dashboard" className="btn-brand-primary px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap">
          Buka Otbee TV <ArrowRight size={13} className="inline ml-1" />
        </Link>
      </div>
    </>
  ),

  // ==========================================
  // 3. PENYIMPANAN DOKUMEN (DOCUMENT VAULT)
  // ==========================================
  'penyimpanan-dokumen-persiapan-jalur-non-tes-ptn': (
    <>
      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        1. Jangan Biarkan Berkas Tercecer Menggagalkan Impian Masuk PTN
      </h2>
      <p>
        Pendaftaran jalur non-tes PTN (SNBP, PPKB UI, PBUB UGM, SJP IPB) memiliki persyaratan berkas yang sangat padat: scan rapor semester 1 sampai 5, piagam sertifikat kejuaraan, surat rekomendasi kepala sekolah, hingga surat pernyataan bebas narkoba.
      </p>
      <p>
        Faktanya, <strong>lebih dari 30% kendala pendaftaran di hari H</strong> disebabkan oleh file sertifikat yang hilang, scan rapor buram, atau ukuran PDF yang melebihi batas upload portal kampus.
      </p>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        2. Solusi Brankas Dokumen Pintar OtwPTN
      </h2>
      <p>
        Fitur <strong>Penyimpanan Dokumen OtwPTN</strong> adalah brankas cloud pribadi yang dirancang khusus untuk memfasilitasi kebutuhan seleksi kampus:
      </p>
      <div className="space-y-3 not-prose my-6">
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <FolderLock size={20} className="text-amber-800 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-gray-900">Rapor Vault Terstruktur</h4>
            <p className="text-[11px] text-gray-600">Unggah dan rapikan scan rapor semester 1 hingga 5 dalam folder rapi per semester, siap diverifikasi kapan saja.</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <Award size={20} className="text-amber-800 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-gray-900">Kurasi 3 Sertifikat Terbaik</h4>
            <p className="text-[11px] text-gray-600">Simpan seluruh piagam lomba dan gunakan kurasi AI OtwPTN untuk memilih 3 sertifikat dengan bobot poin tertinggi di Puspresnas.</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <BookOpen size={20} className="text-amber-800 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-gray-900">Draf Esai Versi Terakhir</h4>
            <p className="text-[11px] text-gray-600">Simpan draf Personal Statement PPKB UI atau esai motivasi yang sudah direvisi bersama mentor alumni.</p>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 my-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-black text-gray-900">Amankan Berkasmu Hari Ini</h4>
          <p className="text-xs text-gray-600">Upload dan tata dokumen pendaftaranmu di brankas digital OtwPTN.</p>
        </div>
        <Link href="/dashboard/dokumen" className="btn-brand-primary px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap">
          Buka Penyimpanan Dokumen <ArrowRight size={13} className="inline ml-1" />
        </Link>
      </div>
    </>
  ),

  // ==========================================
  // 4. TRACKING JALUR NON-TES
  // ==========================================
  'tracking-jalur-non-tes-ptn-timeline-kalender-resmi': (
    <>
      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        1. Dilema 50+ Jadwal Seleksi Jalur Non-Tes yang Sering Berbenturan
      </h2>
      <p>
        Banyak siswa mengira seleksi masuk PTN tanpa tes hanya ada SNBP di bulan Februari. Padahal, mulai dari Januari hingga Juli, ada <strong>lebih dari 50 jalur mandiri prestasi</strong> di berbagai PTN seperti:
      </p>
      <ul className="space-y-1.5 list-disc list-inside text-sm text-gray-700">
        <li>PPKB &amp; Talent Scouting UI (Maret - April)</li>
        <li>PBUB UGM Sains, Seni, Olahraga &amp; Kemitraan (Maret - Mei)</li>
        <li>SJP IPB Ketua OSIS &amp; Prestasi Pramuka Garuda (Februari - April)</li>
        <li>Golden Ticket UNAIR (Januari - Februari)</li>
        <li>SMUP Minat Bakat Unpad &amp; Mandiri Prestasi ITS/Undip (Mei - Juni)</li>
      </ul>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        2. Fitur Tracking Jalur OtwPTN: Anti-Ketinggalan Deadline
      </h2>
      <p>
        Dengan fitur <strong>Tracking Jalur OtwPTN</strong>, kamu tidak perlu repot membuka puluhan website resmi kampus setiap hari:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose my-6">
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <CalendarCheck size={20} className="text-amber-800 mb-2" />
          <h4 className="text-xs font-bold text-gray-900 mb-1">Timeline Interaktif Real-Time</h4>
          <p className="text-[11px] text-gray-600">Visualisasi timeline jadwal pendaftaran, verifikasi berkas, hingga pengumuman hasil.</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <AlertTriangle size={20} className="text-amber-800 mb-2" />
          <h4 className="text-xs font-bold text-gray-900 mb-1">Status Pendaftaran Pribadi</h4>
          <p className="text-[11px] text-gray-600">Tandai status tiap jalur yang kamu ikuti: Rencana, Sedang Draft, Sudah Submit, atau Lolos!</p>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 my-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-black text-gray-900">Cek Kalender Jalur Sekarang</h4>
          <p className="text-xs text-gray-600">Lihat seluruh jadwal jalur non-tes 2026 yang sedang dibuka.</p>
        </div>
        <Link href="/tracking-jalur" className="btn-brand-primary px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap">
          Buka Tracking Jalur <ArrowRight size={13} className="inline ml-1" />
        </Link>
      </div>
    </>
  ),

  // ==========================================
  // 5. GAMES EDUKASI (BAKU, BENERIN, PADANAN)
  // ==========================================
  'game-edukasi-persiapan-ptn-baku-kalimat-padanan-kata': (
    <>
      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        1. Belajar Persiapan Esai &amp; Literasi Sambil Bermain
      </h2>
      <p>
        Banyak siswa yang gagal di seleksi esai (PPKB UI / SJP IPB) bukan karena ide yang buruk, melainkan karena <strong>banyaknya kata tidak baku, kalimat rancu, dan kesalahan logika verbal</strong> yang membuat penguji kehilangan minat membaca.
      </p>
      <p>
        OtwPTN menghadirkan arena <strong>Games Edukasi Interaktif</strong> untuk melatih kemampuan tata bahasa Indonesia secara seru dan adiktif di sela-sela waktu istirahat belajarmu:
      </p>

      <div className="space-y-3 not-prose my-6">
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <Gamepad2 size={20} className="text-amber-800 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-gray-900">Game 1: Baku Atau Nggak</h4>
            <p className="text-[11px] text-gray-600">Uji seberapa cepat kamu membedakan kata baku resmi KBBI vs kata sehari-hari (misal: antre vs antri, kualitas vs kwalitas, izin vs ijin).</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <CheckCircle2 size={20} className="text-amber-800 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-gray-900">Game 2: Benerin Kalimat</h4>
            <p className="text-[11px] text-gray-600">Latih insting menyunting kalimat ambigu dan bertele-tele agar menjadi narasi yang ringkas, berbobot, dan enak dibaca reviewer.</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <Sparkles size={20} className="text-amber-800 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-gray-900">Game 3: Padanan Kata</h4>
            <p className="text-[11px] text-gray-600">Asah analogi logika kata untuk memperkaya perbendaharaan kosakata akademismu saat menulis esai maupun wawancara.</p>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 my-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-black text-gray-900">Mainkan Game Sekarang</h4>
          <p className="text-xs text-gray-600">Gratis dan langsung dapat skor akurasi kemampuan literasimu.</p>
        </div>
        <Link href="/latihan-seleksi" className="btn-brand-primary px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap">
          Mulai Main Game <ArrowRight size={13} className="inline ml-1" />
        </Link>
      </div>
    </>
  ),

  // ==========================================
  // 6. KOMUNITAS PEJUANG PTN
  // ==========================================
  'komunitas-pejuang-ptn-non-tes-otwptn': (
    <>
      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        1. Circle Belajar Menentukan Peluang Kelolosanmu
      </h2>
      <p>
        Perjalanan seleksi masuk perguruan tinggi adalah maraton mental. Belajar di lingkungan yang pasif sering kali membuat siswa kehilangan motivasi dan terlambat menyadari update aturan baru seleksi nasional.
      </p>
      <p>
        <strong>Komunitas OtwPTN</strong> adalah forum resmi pejuang masuk PTN non-tes terbesar di Indonesia yang mempertemukan siswa SMA/SMK/MA berprestasi dari berbagai sekolah.
      </p>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        2. Aktivitas Seru di Komunitas OtwPTN
      </h2>
      <ul className="space-y-2 list-disc list-inside text-sm text-gray-700">
        <li><strong>Room Diskusi Per Kampus:</strong> Masuk ke kanal khusus calon mahasiswa UI, ITB, IPB, UGM, Unair, dll.</li>
        <li><strong>Sharing Sertifikat &amp; Portofolio:</strong> Tanyakan apakah piagam lombamu masuk kurasi Puspresnas atau butuh surat pengesahan tambahan.</li>
        <li><strong>Tanya Mentor Alumni Langsung:</strong> Mentor-mentor mahasiswa aktif yang sudah lolos seleksi jalur non-tes sering aktif menjawab pertanyaan di komunitas.</li>
      </ul>

      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 my-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-black text-gray-900">Gabung Komunitas Pejuang PTN</h4>
          <p className="text-xs text-gray-600">Temukan teman seperjuangan dari seluruh Indonesia sekarang.</p>
        </div>
        <Link href="/komunitas" className="btn-brand-primary px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap">
          Masuk ke Komunitas <ArrowRight size={13} className="inline ml-1" />
        </Link>
      </div>
    </>
  ),

  // ==========================================
  // 7. PROGRAM STUDENT AMBASSADOR
  // ==========================================
  'program-student-ambassador-otwptn-pelajar-sma': (
    <>
      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        1. Apa Itu Program Student Ambassador OtwPTN?
      </h2>
      <p>
        Program <strong>OtwPTN Student Ambassador</strong> adalah program kepemimpinan dan kemitraan resmi bagi siswa-siswi SMA/SMK/MA di seluruh Indonesia yang memiliki jiwa kepemimpinan, aktif di organisasi sekolah (OSIS/MPK/Ekskul), dan ingin menginspirasi teman-temannya lolos PTN impian.
      </p>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        2. Deretan Benefit Eksklusif untuk Ambassador
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose my-6">
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <Award size={20} className="text-amber-800 mb-2" />
          <h4 className="text-xs font-bold text-gray-900 mb-1">Sertifikat Nasional Resmi</h4>
          <p className="text-[11px] text-gray-600">Sertifikat resmi dari PT. Lembaga Sains Nasional yang sangat bernilai untuk portofolio kepemimpinan SNBP &amp; SJP IPB.</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <Users size={20} className="text-amber-800 mb-2" />
          <h4 className="text-xs font-bold text-gray-900 mb-1">Mentoring Eksklusif 1-on-1</h4>
          <p className="text-[11px] text-gray-600">Bimbingan langsung dengan mentor alumni UI, ITB, dan UGM untuk bedah rapor dan review esai pribadimu.</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <DollarSign size={20} className="text-amber-800 mb-2" />
          <h4 className="text-xs font-bold text-gray-900 mb-1">Komisi &amp; Reward Cuan Nyata</h4>
          <p className="text-[11px] text-gray-600">Dapatkan komisi uang tunai dari setiap teman yang mendaftar paket bimbingan menggunakan kode unikmu.</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <Sparkles size={20} className="text-amber-800 mb-2" />
          <h4 className="text-xs font-bold text-gray-900 mb-1">Akses Fitur Premium Gratis</h4>
          <p className="text-[11px] text-gray-600">Gunakan seluruh fitur unggulan kalkulator dan AI review tanpa biaya langganan.</p>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 my-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-black text-gray-900">Daftar Jadi Student Ambassador</h4>
          <p className="text-xs text-gray-600">Buka dashboard ambassador dan dapatkan link referral pribadimu.</p>
        </div>
        <Link href="/ambassador/dashboard" className="btn-brand-primary px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap">
          Daftar Ambassador <ArrowRight size={13} className="inline ml-1" />
        </Link>
      </div>
    </>
  ),

  // ==========================================
  // 8. PROGRAM CONTENT CREATOR
  // ==========================================
  'program-content-creator-otwptn-dibayar-per-video': (
    <>
      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        1. Dibayar Per Video! Program Kemitraan Content Creator OtwPTN
      </h2>
      <p>
        Punya akun TikTok atau Instagram dan suka bikin konten tentang tips sekolah, keluh kesah pejuang PTN, atau motivasi belajar? Jangan cuma posting gratis! Di OtwPTN, kamu bisa <strong>dibayar untuk setiap video edukatif</strong> yang kamu buat.
      </p>
      <p>
        Tidak perlu punya ratusan ribu followers atau studio mewah. Yang kami cari adalah kreativitas, energi positif, dan kemampuan menyampaikan pesan yang relatable bagi anak SMA se-Indonesia.
      </p>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        2. Keuntungan Menjadi Content Creator OtwPTN
      </h2>
      <ul className="space-y-2 list-disc list-inside text-sm text-gray-700">
        <li><strong>Dibayar Per Video yang Disetujui:</strong> Pembayaran transparan dan langsung cair tanpa perlu menunggu endorse ribet.</li>
        <li><strong>Bonus Tambahan untuk Video Viral:</strong> Dapatkan reward ekstra jika videomu menembus angka views tertentu di FYP TikTok atau Reels.</li>
        <li><strong>100% Kerja Remote dari Mana Saja:</strong> Cukup gunakan kamera HP dan rekam di kamar atau ruang belajarmu.</li>
        <li><strong>Dukungan Ide &amp; Script:</strong> Tim kreatif OtwPTN menyediakan bank ide konten viral dan arahan copywriting yang siap pakai.</li>
      </ul>

      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 my-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-black text-gray-900">Tertarik Jadi Kreator OtwPTN?</h4>
          <p className="text-xs text-gray-600">Simak kriteria lengkap dan kirim portofolio videomu sekarang.</p>
        </div>
        <Link href="/career/content-creator" className="btn-brand-primary px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap">
          Daftar Content Creator <ArrowRight size={13} className="inline ml-1" />
        </Link>
      </div>
    </>
  ),

  // ==========================================
  // 9. CARA DAFTAR SNBP 2026 (VIRAL GSC SURGE +490%)
  // ==========================================
  'cara-daftar-snbp': (
    <>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/90 text-amber-900 text-xs font-black mb-2">
        <Flame size={14} className="text-amber-600 fill-amber-500 animate-pulse" />
        Panduan Resmi BPPP SNPMB 2026 Terlengkap
      </div>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-2">
        1. Alur Resmi &amp; Timeline Seleksi SNBP 2026
      </h2>
      <p>
        <strong>SNBP (Seleksi Nasional Berdasarkan Prestasi)</strong> adalah jalur seleksi nasional masuk Perguruan Tinggi Negeri (PTN) tanpa tes tulis berbasis rekam jejak nilai rapor dan prestasi unggul. Proses pendaftaran SNBP dilakukan secara terpusat melalui portal resmi <strong>SNPMB BPPP Kemendikbudristek</strong>.
      </p>

      {/* Official Infographic Visual */}
      <figure className="my-6">
        <Image
          src="/images/jadwal/timeline-snbp-2026-seleksi-nasional-prestasi.webp"
          alt="Timeline dan Alur Cara Daftar SNBP 2026 Resmi BPPP SNPMB Kemdikbud"
          width={1200}
          height={675}
          className="w-full h-auto rounded-2xl border border-amber-200 shadow-lg"
          priority
        />
        <figcaption className="text-center text-xs text-gray-500 font-semibold mt-2.5">
          Infografis Timeline &amp; Alur Resmi Pendaftaran SNBP 2026 — Divalidasi oleh Tim Riset Akademik otwptn.com
        </figcaption>
      </figure>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 not-prose my-6">
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <Clock size={18} className="text-amber-800 mb-1.5" />
          <h4 className="text-xs font-bold text-gray-900">Registrasi Akun Siswa</h4>
          <p className="text-[11px] text-gray-600 mt-0.5">Awal Januari s.d. Pertengahan Februari 2026</p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <FileText size={18} className="text-amber-800 mb-1.5" />
          <h4 className="text-xs font-bold text-gray-900">Pendaftaran Resmi SNBP</h4>
          <p className="text-[11px] text-gray-600 mt-0.5">Pertengahan s.d. Akhir Februari 2026</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
          <Award size={18} className="text-emerald-800 mb-1.5" />
          <h4 className="text-xs font-bold text-gray-900">Pengumuman Kelulusan</h4>
          <p className="text-[11px] text-gray-600 mt-0.5">Akhir Maret 2026 (Pukul 15.00 WIB)</p>
        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        2. Syarat Kuota Siswa Eligible SNBP Berdasarkan Akreditasi Sekolah
      </h2>
      <p>
        Tidak semua siswa kelas 12 dapat mendaftar SNBP. Hanya siswa yang masuk dalam <strong>kuota siswa eligible</strong> yang berhak melakukan pendaftaran prodi di portal SNBP. Kuota eligible ditentukan secara proporsional berdasarkan akreditasi sekolah asal:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose my-6">
        <div className="p-5 rounded-2xl bg-white border-2 border-amber-400 shadow-sm relative overflow-hidden">
          <span className="absolute top-0 right-0 bg-amber-400 text-gray-950 text-[10px] font-black px-2.5 py-0.5 rounded-bl-lg">TOP TIER</span>
          <h4 className="text-base font-black text-gray-900">Akreditasi A</h4>
          <div className="text-2xl font-black text-amber-700 my-1">40%</div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Siswa terbaik di jurusannya (IPA/IPS/Bahasa/Kejuruan) berdasarkan ranking akumulasi rapor semester 1 s.d. 5.
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h4 className="text-base font-black text-gray-900">Akreditasi B</h4>
          <div className="text-2xl font-black text-gray-700 my-1">25%</div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Siswa terbaik di sekolah dengan kuota seperempat total siswa angkatan per jurusan peminatan.
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h4 className="text-base font-black text-gray-900">Akreditasi C &amp; Lainnya</h4>
          <div className="text-2xl font-black text-gray-500 my-1">5%</div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Siswa terbaik peringkat teratas yang ditetapkan oleh pihak sekolah.
          </p>
        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        3. Langkah Step-by-Step Cara Daftar SNBP 2026 di Portal SNPMB
      </h2>
      <p>
        Berikut adalah panduan teknis langkah demi langkah pendaftaran SNBP di portal resmi <code>portal-snpmb.bppp.kemdikbud.go.id</code>:
      </p>

      <div className="space-y-4 not-prose my-6">
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs flex gap-4">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-black flex items-center justify-center flex-shrink-0 text-sm">1</div>
          <div>
            <h4 className="text-sm font-black text-gray-900 mb-1">Registrasi &amp; Simpan Permanen Akun SNPMB Siswa</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Buka situs resmi SNPMB, pilih menu <strong>Daftar Akun Siswa</strong>, masukkan kombinasi <strong>NISN, NPSN, dan tanggal lahir</strong> sesuai data Dapodik/EMIS. Lakukan aktivasi via tautan email, unggah pasfoto formal terbaru (background polos), lalu lakukan <strong>Simpan Permanen Akun</strong> sebelum batas tenggat.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs flex gap-4">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-black flex items-center justify-center flex-shrink-0 text-sm">2</div>
          <div>
            <h4 className="text-sm font-black text-gray-900 mb-1">Login ke Portal SNBP &amp; Validasi Data Rapor PDSS</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Setelah sekolah menyelesaikan finalisasi PDSS (Pangkalan Data Sekolah dan Siswa), login ke portal SNBP menggunakan email dan password terdaftar. Periksa kesesuaian nilai rapor semester 1 s.d. 5. Jika ada selisih nilai, segera laporkan ke pihak kurikulum/BK sekolah sebelum finalisasi.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs flex gap-4">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-black flex items-center justify-center flex-shrink-0 text-sm">3</div>
          <div>
            <h4 className="text-sm font-black text-gray-900 mb-1">Pemilihan Program Studi &amp; PTN (Aturan Domisili Provinsi)</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Setiap siswa berhak memilih <strong>maksimal 2 program studi</strong> dari 1 PTN atau 2 PTN berbeda. <em>PENTING:</em> Jika kamu memilih 2 prodi, <strong>salah satu PTN WAJIB berada di provinsi yang sama dengan sekolah asalmu</strong>. Jika hanya memilih 1 prodi, kamu bebas memilih PTN di provinsi mana saja di seluruh Indonesia.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs flex gap-4">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-black flex items-center justify-center flex-shrink-0 text-sm">4</div>
          <div>
            <h4 className="text-sm font-black text-gray-900 mb-1">Unggah Portofolio Khusus &amp; Maksimal 3 Sertifikat Prestasi</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Bagi peminat program studi bidang <strong>Seni dan Olahraga</strong>, wajib mengunggah dokumen &amp; video portofolio sesuai format template resmi BPPP. Selain itu, seluruh peserta dapat mengunggah <strong>maksimal 3 sertifikat prestasi terbaik</strong> (Puspresnas, OSN, O2SN, FLS2N, atau kejuaraan bereputasi lainnya) dengan melampirkan bukti piagam sah.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs flex gap-4">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-black flex items-center justify-center flex-shrink-0 text-sm">5</div>
          <div>
            <h4 className="text-sm font-black text-gray-900 mb-1">Finalisasi Simpan Permanen &amp; Cetak Kartu Peserta SNBP</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Cek kembali seluruh data prodi pilihan dan berkas lampiran. Klik <strong>Simpan Permanen</strong>. Ingat: data yang sudah difinalisasi <strong>tidak dapat diubah kembali dengan alasan apapun</strong>. Unduh dan cetak <strong>Kartu Tanda Peserta SNBP</strong> sebagai bukti sah pendaftaran.
            </p>
          </div>
        </div>
      </div>

      {/* Critical Warning Alert */}
      <div className="card p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 my-6">
        <h4 className="text-sm font-black text-rose-950 flex items-center gap-2 mb-1.5">
          <AlertTriangle size={18} className="text-rose-600 flex-shrink-0" /> Peringatan Krusial Konsekuensi Kelulusan SNBP:
        </h4>
        <p className="text-xs text-rose-900 leading-relaxed">
          Sesuai Permendikbudristek terbaru, siswa yang dinyatakan <strong>LOLOS SNBP 2026 TIDAK DAPAT MENDAFTAR UTBK-SNBT 2026</strong> dan secara sistemik <strong>DIBLOKIR dari seluruh Jalur Seleksi Mandiri di PTN mana pun se-Indonesia</strong>. Oleh karena itu, jangan pernah memilih program studi &ldquo;asal coba-coba&rdquo; jika kamu tidak bersedia mengambilnya saat diterima!
        </p>
      </div>

      {/* Interactive Tool Lead Magnet */}
      <div className="card p-6 md:p-8 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-600 text-white my-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full inline-block mb-2">
              Fitur AI Unggulan otwptn
            </span>
            <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
              Hitung Peluang Lolos SNBP 2026 Kamu Sekarang!
            </h3>
            <p className="text-xs md:text-sm text-amber-100 mt-2 max-w-xl">
              Jangan tebak-tebak buah manggis. Masukkan nilai rapor semester 1-5 dan sertifikatmu, algoritma AI otwptn langsung merasionalisasi peluangmu terhadap kuota prodi dan rekam jejak alumni sekolahmu.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full md:w-auto">
            <Link
              href="/dashboard/kalkulator"
              className="btn bg-gray-950 hover:bg-black text-white px-6 py-3 rounded-full text-xs md:text-sm font-black text-center shadow-lg hover:scale-105 transition-transform"
            >
              Cek Peluang Gratis <ArrowRight size={14} className="inline ml-1" />
            </Link>
            <Link
              href="/dashboard/essay"
              className="btn bg-white hover:bg-amber-50 text-gray-900 px-5 py-3 rounded-full text-xs md:text-sm font-bold text-center"
            >
              Review Portofolio
            </Link>
          </div>
        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        4. Strategi Memilih Jurusan Agar Tidak Bertabrakan dengan Teman Satu Sekolah
      </h2>
      <p>
        Banyak siswa yang memiliki nilai rapor tinggi justru gugur di SNBP karena <strong>memilih jurusan yang sama dengan teman seangkatan yang memiliki nilai lebih unggul atau indeks sertifikat lebih tinggi</strong>. PTN umumnya membatasi alokasi penerimaan dari satu sekolah tertentu untuk menjaga diversitas asal daerah.
      </p>
      <p>
        Lakukan pemetaan internal bersama guru BK, gunakan fitur <strong>Tracking Jalur &amp; Rapor Profil otwptn</strong>, dan pilih kombinasi prodi prioritas yang memiliki peluang kelolosan paling maksimal.
      </p>
    </>
  ),

  // ==========================================
  // 10. SYARAT SNBP 2026
  // ==========================================
  'syarat-snbp': (
    <>
      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        1. Ketentuan Umum &amp; Persyaratan Peserta SNBP 2026
      </h2>
      <p>
        Seleksi Nasional Berdasarkan Prestasi (SNBP) menetapkan syarat kualifikasi ketat bagi siswa maupun sekolah. Kriteria ini dirancang agar penerimaan mahasiswa baru jalur prestasi berlangsung adil, transparan, dan terstandarisasi secara nasional.
      </p>

      {/* Infographic Visual */}
      <figure className="my-6">
        <Image
          src="/images/jadwal/timeline-snbp-2026-seleksi-nasional-prestasi.webp"
          alt="Syarat dan Timeline Lengkap SNBP 2026 Resmi BPPP Kemendikbud"
          width={1200}
          height={675}
          className="w-full h-auto rounded-2xl border border-amber-200 shadow-md"
        />
        <figcaption className="text-center text-xs text-gray-500 font-semibold mt-2">
          Ketentuan Resmi Seleksi Siswa Eligible &amp; Registrasi SNBP 2026
        </figcaption>
      </figure>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        2. Syarat Wajib Siswa Pendaftar SNBP 2026
      </h2>
      <ul className="space-y-3 list-disc list-inside text-sm text-gray-700">
        <li><strong>Siswa SMA/MA/SMK Kelas 12 (Angkatan 2026):</strong> Memiliki prestasi akademik unggul dan masuk kuota pemeringkatan sekolah.</li>
        <li><strong>Memiliki NISN Aktif:</strong> Terdaftar resmi dan valid di basis data Dapodik (Kemendikbud) atau EMIS (Kemenag).</li>
        <li><strong>Nilai Rapor Lengkap di PDSS:</strong> Seluruh nilai rapor semester 1 sampai 5 telah diisi dan disahkan secara final oleh sekolah di sistem PDSS.</li>
        <li><strong>Memiliki Akun SNPMB Siswa:</strong> Telah membuat dan menyelesaikan simpan permanen akun SNPMB pada periode registrasi akun.</li>
        <li><strong>Portofolio Resmi:</strong> Khusus pemilih program studi bidang Seni rupa/desain, Musik, Tari, Teater, Perfilman, Fotografi, dan Olahraga.</li>
      </ul>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        3. Komponen Nilai &amp; Pembobotan Mata Pelajaran Pendukung
      </h2>
      <p>
        Penilaian SNBP tidak lagi hanya menghitung nilai rata-rata umum seluruh mata pelajaran. Kemendikbudristek menetapkan dua komponen penilaian:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose my-6">
        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200">
          <span className="text-xs font-black text-amber-900 uppercase">Komponen 1 (Min. 50%)</span>
          <h4 className="text-sm font-bold text-gray-900 my-1">Rata-Rata Seluruh Mata Pelajaran</h4>
          <p className="text-xs text-gray-600">Menghargai konsistensi dan ketekunan belajar siswa di semua bidang studi semester 1 s.d. 5.</p>
        </div>
        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200">
          <span className="text-xs font-black text-amber-900 uppercase">Komponen 2 (Maks. 50%)</span>
          <h4 className="text-sm font-bold text-gray-900 my-1">Mapel Pendukung &amp; Sertifikat Prestasi</h4>
          <p className="text-xs text-gray-600">Fokus pada 2 mata pelajaran yang relevan dengan program studi pilihan serta maksimal 3 sertifikat kejuaraan.</p>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 my-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-black text-gray-900">Ingin Tahu Mapel Pendukung Jurusan Pilihanmu?</h4>
          <p className="text-xs text-gray-600">Gunakan fitur Direktori Jalur &amp; Kalkulator Peluang otwptn untuk mencocokkan nilaimu.</p>
        </div>
        <Link href="/dashboard/kalkulator" className="btn-brand-primary px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap">
          Cek Mapel Pendukung <ArrowRight size={13} className="inline ml-1" />
        </Link>
      </div>
    </>
  ),

  // ==========================================
  // 11. CARA HITUNG RATA-RATA NILAI RAPOR SNBP 2026
  // ==========================================
  'cara-hitung-rata-rata-nilai-rapor-snbp': (
    <>
      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        1. Dua Rumus Komponen Penilaian SNBP 2026
      </h2>
      <p>
        Banyak siswa salah mengira bahwa kelulusan SNBP hanya ditentukan oleh nilai rata-rata umum di atas kertas rapor. Sejak regulasi transformasi seleksi nasional diberlakukan oleh BPPP Kemendikbudristek, penilaian rapor dipecah menjadi dua komponen dengan pembobotan matematis:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose my-6">
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full inline-block mb-2">
            Komponen 1 (Bobot Minimal 50%)
          </span>
          <h4 className="text-base font-bold text-gray-900 mb-1">Rata-Rata Seluruh Mata Pelajaran</h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            Dihitung dari total penjumlahan seluruh nilai mapel (Agama, PPKn, Bahasa Indonesia, Matematika, Bahasa Inggris, Sejarah, dsb.) dari <strong>semester 1 sampai semester 5</strong> dibagi total mata pelajaran. Komponen ini mengukur konsistensi belajar secara komprehensif.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200">
          <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 bg-sky-200/60 px-2 py-0.5 rounded-full inline-block mb-2">
            Komponen 2 (Bobot Maksimal 50%)
          </span>
          <h4 className="text-base font-bold text-gray-900 mb-1">Mapel Pendukung Prodi &amp; Prestasi</h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            Dihitung khusus dari <strong>2 mata pelajaran pendukung</strong> prodi pilihan (misalnya Kedokteran: Biologi &amp; Kimia; Manajemen: Matematika &amp; Ekonomi), ditambah poin kurasi <strong>maksimal 3 sertifikat prestasi</strong> atau nilai portofolio.
          </p>
        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        2. Simulasi Perhitungan Nilai Rapor SNBP
      </h2>
      <p>
        Misalkan kamu memilih program studi <strong>Ilmu Komputer / Informatika</strong> di PTN A:
      </p>
      <div className="card p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs my-4 not-prose space-y-3">
        <div className="flex items-center justify-between text-xs border-b border-gray-100 pb-2">
          <span className="font-semibold text-gray-600">Rata-rata seluruh mapel sem 1-5 (Komponen 1):</span>
          <span className="font-black text-gray-900">89.40 (x 50% = 44.70)</span>
        </div>
        <div className="flex items-center justify-between text-xs border-b border-gray-100 pb-2">
          <span className="font-semibold text-gray-600">Rata-rata Mapel Pendukung (Matematika Tingkat Lanjut):</span>
          <span className="font-black text-gray-900">93.20 (x 30% = 27.96)</span>
        </div>
        <div className="flex items-center justify-between text-xs border-b border-gray-100 pb-2">
          <span className="font-semibold text-gray-600">Sertifikat Juara 2 OSN Informatika Tingkat Provinsi:</span>
          <span className="font-black text-amber-700">+ 18.00 poin prestasi</span>
        </div>
        <div className="flex items-center justify-between text-sm pt-1">
          <span className="font-black text-gray-900">Total Skor Estimasi Kelayakan SNBP:</span>
          <span className="font-black text-amber-900 text-base">90.66 / 100</span>
        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        3. Pentingnya Indeks Sekolah &amp; Rekam Jejak Alumni
      </h2>
      <p>
        Perlu diingat: Skor rapor tinggi tidak serta merta menjamin kelulusan jika indeks sekolahmu di PTN tersebut rendah. PTN mengalikan skor mentah dengan <strong>faktor pengali akreditasi sekolah dan IPK alumni sekolahmu yang sedang berkuliah di PTN tersebut</strong>.
      </p>

      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 my-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-black text-gray-900">Cek Rasionalisasi Rapor Otomatis di otwptn</h4>
          <p className="text-xs text-gray-600">Input nilaimu sekali, AI langsung menghitung perbandingan dengan passing grade prodi.</p>
        </div>
        <Link href="/dashboard/kalkulator" className="btn-brand-primary px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap">
          Gunakan Kalkulator SNBP <ArrowRight size={13} className="inline ml-1" />
        </Link>
      </div>
    </>
  ),

  // ==========================================
  // 12. SERTIFIKAT YANG BISA LOLOS SNBP PUSPRESNAS
  // ==========================================
  'sertifikat-yang-bisa-lolos-snbp-puspresnas': (
    <>
      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        1. Aturan Kurasi 3 Sertifikat Prestasi Maksimal di SNBP 2026
      </h2>
      <p>
        Sistem SNPMB memberikan fasilitas pengunggahan <strong>maksimal 3 sertifikat prestasi terbaik</strong> bagi peserta SNBP. Mengingat slot yang sangat terbatas, mengunggah sertifikat yang salah atau tidak berbobot bisa menjadi bumerang.
      </p>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        2. Tingkatan &amp; Bobot Sertifikat yang Diakui PTN
      </h2>
      <div className="space-y-3 not-prose my-6">
        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5 h-5 rounded-full bg-amber-400 text-gray-950 font-black text-xs flex items-center justify-center">1</span>
            <h4 className="text-sm font-black text-gray-900">Puspresnas / BPTI Kemendikbudristek (Prioritas Tertinggi)</h4>
          </div>
          <p className="text-xs text-gray-600">
            Ajang resmi talenta nasional: <strong>OSN (Sains), O2SN (Olahraga), FLS2N (Seni), OPSI (Penelitian Siswa), LDBI/NSDC (Debat)</strong>. Sertifikat ini memiliki database terintegrasi langsung di sistem SNPMB.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-800 font-black text-xs flex items-center justify-center">2</span>
            <h4 className="text-sm font-black text-gray-900">Kementerian &amp; Lembaga Negara Resmi</h4>
          </div>
          <p className="text-xs text-gray-600">
            Kejuaraan yang diadakan kementerian lain seperti Kemenpora, Kemenag (KSM, AKSIOMA), Kwarda/Kwarnas Pramuka Garuda, dan kejuaraan resmi KONI/PON.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-800 font-black text-xs flex items-center justify-center">3</span>
            <h4 className="text-sm font-black text-gray-900">Lomba Universitas Terakreditasi Nasional</h4>
          </div>
          <p className="text-xs text-gray-600">
            Kompetisi karya tulis ilmiah, olimpiade matematika, atau lomba debat tingkat nasional yang diselenggarakan oleh fakultas/BEM di perguruan tinggi negeri terkemuka.
          </p>
        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        3. Tips Linearitas Sertifikat dengan Program Studi
      </h2>
      <p>
        Sertifikat juara olimpiade Kimia memiliki bobot maksimal jika mendaftar di Teknik Kimia, Farmasi, atau Kedokteran. Namun sertifikat yang sama memiliki nilai tambah yang jauh lebih kecil jika mendaftar di jurusan Sastra Inggris atau Manajemen. <strong>Pilihlah 3 sertifikat yang paling linear dengan prodi pilihan pertamamu!</strong>
      </p>

      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 my-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-black text-gray-900">Simpan &amp; Kurasi Sertifikatmu di Cloud Vault otwptn</h4>
          <p className="text-xs text-gray-600">Fitur Penyimpanan Dokumen membantu mengurutkan sertifikat dengan bobot tertinggi.</p>
        </div>
        <Link href="/dashboard/dokumen" className="btn-brand-primary px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap">
          Buka Penyimpanan Dokumen <ArrowRight size={13} className="inline ml-1" />
        </Link>
      </div>
    </>
  ),

  // ==========================================
  // 13. 7 KESALAHAN FATAL PENDAFTARAN SNBP
  // ==========================================
  'kesalahan-fatal-pendaftaran-snbp-gagal-lolos': (
    <>
      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        1. Mengapa Siswa Peringkat 1 Sekolah Bisa Gagal di SNBP?
      </h2>
      <p>
        Setiap tahun, ribuan siswa berprestasi dengan rapor nyaris sempurna harus menelan kekecewaan di pengumuman SNBP. Kegagalan tersebut sering kali bukan karena nilai rapor kurang tinggi, melainkan akibat <strong>kesalahan strategi dan kelalaian teknis dalam pendaftaran</strong>.
      </p>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        2. Tujuh Kesalahan Fatal yang Wajib Kamu Hindari
      </h2>
      <div className="space-y-4 not-prose my-6">
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
          <h4 className="text-sm font-bold text-rose-950 flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-rose-600" /> 1. Tabrakan Pilihan Prodi dengan Teman Satu Sekolah
          </h4>
          <p className="text-xs text-rose-900 leading-relaxed">
            Dua atau tiga siswa mendaftar jurusan yang sama di satu PTN. Jika kuota alumni sekolahmu hanya 1 orang, siswa dengan ranking lebih rendah otomatis langsung tereliminasi.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
          <h4 className="text-sm font-bold text-rose-950 flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-rose-600" /> 2. Melanggar Aturan Wilayah Provinsi (Lintas Provinsi)
          </h4>
          <p className="text-xs text-rose-900 leading-relaxed">
            Memilih 2 program studi di luar provinsi sekolah asal. Aturan SNPMB tegas: Jika memilih 2 prodi, salah satu PTN wajib berada di provinsi yang sama dengan sekolah asal.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
          <h4 className="text-sm font-bold text-rose-950 flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-rose-600" /> 3. Mengunggah Portofolio Tidak Sesuai Template Resmi
          </h4>
          <p className="text-xs text-rose-900 leading-relaxed">
            Format file video, surat pernyataan keaslian karya, atau template instruksi BPPP tidak dipatuhi, menyebabkan skor portofolio langsung gugur di tahap verifikasi awal.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
          <h4 className="text-sm font-bold text-rose-950 flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-rose-600" /> 4. Memilih Prodi Pilihan 2 dengan Passing Grade Lebih Tinggi
          </h4>
          <p className="text-xs text-rose-900 leading-relaxed">
            Meletakkan jurusan sangat ketat di pilihan 2. Hampir seluruh PTN top memprioritaskan pemilih pilihan 1. Meletakkan prodi favorit di pilihan 2 sering kali berujung kuota sudah habis terisi.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
          <h4 className="text-sm font-bold text-rose-950 flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-rose-600" /> 5. Mengabaikan Riwayat Rekam Jejak Alumni
          </h4>
          <p className="text-xs text-rose-900 leading-relaxed">
            Mendaftar di kampus yang belum pernah menerima satupun alumni dari sekolahmu, atau sekolahmu sedang terkena sanksi kuota (blacklist) akibat ada alumni yang tidak mengambil SNBP tahun sebelumnya.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
          <h4 className="text-sm font-bold text-rose-950 flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-rose-600" /> 6. Terlambat Simpan Permanen Akun SNPMB
          </h4>
          <p className="text-xs text-rose-900 leading-relaxed">
            Menunda finalisasi hingga jam-jam terakhir saat portal server mengalami lonjakan traffic tinggi dan error down.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
          <h4 className="text-sm font-bold text-rose-950 flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-rose-600" /> 7. Asal Pilih Prodi Cadangan Tanpa Niat Mengambil
          </h4>
          <p className="text-xs text-rose-900 leading-relaxed">
            Ingat: Lulus SNBP berarti kamu diblokir permanen dari UTBK-SNBT dan seluruh Jalur Mandiri di Indonesia!
          </p>
        </div>
      </div>
    </>
  ),

  // ==========================================
  // 14. PERBEDAAN SNBP DAN SNBT 2026
  // ==========================================
  'perbedaan-snbp-dan-snbt-2026-panduan-lengkap': (
    <>
      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        1. Tabel Perbandingan Lengkap SNBP vs SNBT 2026
      </h2>
      <p>
        Sebelum menentukan fokus belajarmu, pahami perbedaan fundamental antara kedua jalur seleksi nasional yang diselenggarakan oleh BPPP SNPMB:
      </p>

      <div className="card p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs my-6 not-prose overflow-x-auto">
        <table className="w-full text-xs text-left text-gray-700">
          <thead className="text-[11px] font-black uppercase bg-amber-50 text-amber-900">
            <tr>
              <th className="p-3">Aspek Penilaian</th>
              <th className="p-3">SNBP (Prestasi)</th>
              <th className="p-3">SNBT (Tes UTBK)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="p-3 font-bold">Kriteria Utama</td>
              <td className="p-3">Nilai Rapor semester 1-5 + Sertifikat/Portofolio</td>
              <td className="p-3">Skor Ujian Tertulis Berbasis Komputer (UTBK)</td>
            </tr>
            <tr>
              <td className="p-3 font-bold">Peserta yang Berhak</td>
              <td className="p-3">Hanya siswa eligible angkatan 2026</td>
              <td className="p-3">Lulusan 2026, 2025, dan 2024 (Gap Year)</td>
            </tr>
            <tr>
              <td className="p-3 font-bold">Biaya Pendaftaran</td>
              <td className="p-3">Gratis (Ditanggung Pemerintah)</td>
              <td className="p-3">Rp200.000,- (Kecuali KIP-Kuliah)</td>
            </tr>
            <tr>
              <td className="p-3 font-bold">Kuota Minimum PTN</td>
              <td className="p-3">Minimal 20% daya tampung kampus</td>
              <td className="p-3">Minimal 40% (PTN-BLU/Satker) / 30% (PTN-BH)</td>
            </tr>
            <tr>
              <td className="p-3 font-bold">Konsekuensi Kelulusan</td>
              <td className="p-3 text-rose-700 font-bold">Diblokir dari UTBK &amp; Mandiri</td>
              <td className="p-3">Hanya diblokir dari Mandiri jika mendaftar ulang</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        2. Haruskah Tetap Belajar UTBK Meskipun Ikut SNBP?
      </h2>
      <p>
        <strong>JAWABANNYA: SANGAT WAJIB!</strong> Kuota SNBP secara nasional rata-rata hanya menerima sekitar 20% dari total pendaftar. Menjadikan SNBP sebagai satu-satunya harapan tanpa menyiapkan materi TPS, Literasi Bahasa, dan Penalaran Matematika untuk UTBK-SNBT adalah salah satu kesalahan terbesar pejuang kampus.
      </p>
    </>
  ),
}
