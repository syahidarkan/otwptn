import React from 'react'
import Link from 'next/link'
import {
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Video, FolderLock,
  CalendarCheck, Gamepad2, Users, Award, DollarSign, BookOpen, ShieldCheck, Flame
} from 'lucide-react'

export const ARTICLE_CONTENTS: Record<string, React.ReactNode> = {
  // ==========================================
  // 1. SJP UI (JALUR PRESTASI UI 2026)
  // ==========================================
  'sjp-ui-jalur-prestasi-masuk-ui-tanpa-tes': (
    <>
      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        1. Menjawab Rasa Penasaran: Apakah Universitas Indonesia Punya SJP?
      </h2>
      <p>
        Banyak siswa SMA/SMK/MA dan orang tua sering mencari informasi dengan kata kunci <strong>&ldquo;SJP UI&rdquo;</strong> di Google karena mengira Universitas Indonesia memiliki jalur seleksi bernama Seleksi Jalur Prestasi (SJP).
      </p>
      <div className="card p-5 rounded-2xl bg-amber-50/80 border border-amber-200 my-4">
        <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-amber-600 flex-shrink-0" /> Fakta Resmi Jalur Prestasi UI:
        </h4>
        <p className="text-xs text-gray-700 leading-relaxed">
          Secara nomenklatur resmi, istilah <strong>SJP adalah milik IPB University</strong> (Seleksi Jalur Prestasi IPB untuk Ketua OSIS & Juara Lomba). Di <strong>Universitas Indonesia (UI)</strong>, jalur seleksi prestasi tanpa ujian tulis terbagi menjadi <strong>3 pintu resmi</strong>:
        </p>
      </div>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        2. Tiga Jalur Prestasi &amp; Non-Tes Resmi di Universitas Indonesia
      </h2>
      <div className="space-y-4 not-prose my-6">
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">Jalur #1 Paling Populer</span>
            <span className="text-xs font-bold text-emerald-600">Sarjana &amp; Vokasi D3/D4</span>
          </div>
          <h4 className="text-base font-black text-gray-900 mb-1">PPKB UI (Prestasi dan Pemerataan Kesempatan Belajar)</h4>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            Seleksi berbasis nilai rapor semester 1-5 dan esai motivasi (Personal Statement). Terbuka untuk seluruh jurusan Sarjana (S1) dan Vokasi (D3/D4). Sekolah asal harus terakreditasi dan mengajukan permohonan akun ke kantor Penerimaan Mahasiswa Baru (PMB) UI.
          </p>
          <div className="text-[11px] font-semibold text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            Penilaian: Nilai rapor mata pelajaran pendukung, indeks sekolah, dan ketajaman esai refleksi diri.
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full">Jalur #2 Internasional</span>
            <span className="text-xs font-bold text-sky-600">Kelas Internasional (KKI)</span>
          </div>
          <h4 className="text-base font-black text-gray-900 mb-1">Talent Scouting UI</h4>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            Jalur non-tes khusus untuk program Sarjana Kelas Khusus Internasional (KKI UI) yang bermitra dengan universitas top dunia (Australia, Inggris, Belanda). Menilai rapor, sertifikat kemampuan Bahasa Inggris (TOEFL/IELTS), dan essay berbahasa Inggris.
          </p>
          <div className="text-[11px] font-semibold text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            Penilaian: Kemampuan bahasa Inggris, esai motivasi KKI, dan konsistensi akademik sains/sosial.
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full">Jalur #3 Lomba &amp; Bakat</span>
            <span className="text-xs font-bold text-purple-600">Sains, Olahraga &amp; Seni</span>
          </div>
          <h4 className="text-base font-black text-gray-900 mb-1">Jalur Prestasi SIMAK UI</h4>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            Inilah jalur yang paling mendekati konsep &ldquo;SJP UI&rdquo;! Jalur Prestasi UI diperuntukkan bagi peraih juara minimal Juara 1, 2, atau 3 di kompetisi sains nasional (OSN), kejuaraan olahraga resmi (PON, Sea Games), dan festival seni tingkat nasional/internasional.
          </p>
          <div className="text-[11px] font-semibold text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            Penilaian: Validitas sertifikat Puspresnas/KONI/Kemenpora dan keselarasan dengan program studi tujuan.
          </div>
        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
        3. Tips Lolos Seleksi Jalur Prestasi UI dari Mentor Alumni
      </h2>
      <ul className="space-y-3 list-disc list-inside text-sm text-gray-700">
        <li><strong>Jangan Salah Tulis Format Personal Statement:</strong> UI sangat selektif membaca essay motivasi. Buat essay yang orisinal, bebas klise, dan perjelas mengapa kamu butuh kurikulum UI. Gunakan fitur Essay AI Review OtwPTN untuk cek sebelum submit.</li>
        <li><strong>Rasionalisasikan Nilai Rapor:</strong> Jangan bertabrakan dengan teman seangkatan yang memilih prodi yang sama di UI jika nilaimu di bawah mereka. Manfaatkan Kalkulator Peluang OtwPTN untuk simulasi.</li>
        <li><strong>Legalitas Sertifikat:</strong> Sertifikat non-kedinasan wajib melampirkan surat keterangan keaslian dari lembaga penyelenggara.</li>
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
}
