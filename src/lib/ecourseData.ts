export interface ELesson {
  id: string
  title: string
  type: 'text' | 'video'
  duration: string
  content: string
}

export interface EStage {
  id: number
  title: string
  duration: string
  lessons: ELesson[]
}

export interface EJalur {
  id: string
  label: string
  stages: EStage[]
}

const PPKB_STAGES: EStage[] = [
  {
    id: 1, title: 'Mengenal PPKB UI', duration: '20 menit',
    lessons: [
      { id: 'ppkb-1-1', title: 'Apa itu PPKB UI?', type: 'text', duration: '7 menit', content: `<h2>Apa itu PPKB UI?</h2><p>PPKB (Penerimaan Peserta Kegiatan Belajar) UI adalah jalur masuk Universitas Indonesia yang diperuntukkan bagi siswa berprestasi. Berbeda dari SNBP yang menggunakan nilai rapor nasional, PPKB memiliki komponen seleksi berupa <strong>essay motivasi</strong> dan portofolio prestasi.</p><p>Jalur ini terbuka untuk siswa SMA/SMK/MA yang memiliki rekam jejak prestasi akademik maupun non-akademik yang kuat.</p><ul><li>Tidak memerlukan UTBK</li><li>Fokus pada prestasi dan essay</li><li>Tersedia untuk hampir semua fakultas UI</li></ul>` },
      { id: 'ppkb-1-2', title: 'Persyaratan & Ketentuan', type: 'text', duration: '8 menit', content: `<h2>Persyaratan Umum PPKB UI</h2><p>Untuk mendaftar PPKB UI, pastikan kamu memenuhi syarat berikut:</p><ul><li>Siswa kelas 12 SMA/SMK/MA atau lulusan 2 tahun terakhir</li><li>Rekomendasi dari kepala sekolah</li><li>Nilai rapor rata-rata ≥ 75 (tergantung prodi)</li><li>Tidak sedang diterima di PTN melalui jalur lain</li><li>Memiliki prestasi akademik/non-akademik yang dapat dibuktikan</li></ul><p><strong>Catatan:</strong> Syarat spesifik per prodi bisa berbeda. Selalu cek halaman resmi UI sebelum mendaftar.</p>` },
      { id: 'ppkb-1-3', title: 'Timeline Pendaftaran', type: 'text', duration: '5 menit', content: `<h2>Timeline PPKB UI</h2><p>Berikut jadwal umum pendaftaran PPKB UI (dapat berubah tiap tahun):</p><ul><li><strong>Januari–Februari:</strong> Pengumuman pembukaan pendaftaran</li><li><strong>Februari–Maret:</strong> Periode pendaftaran online di penerimaan.ui.ac.id</li><li><strong>Maret–April:</strong> Seleksi berkas dan verifikasi</li><li><strong>April–Mei:</strong> Pengumuman hasil seleksi</li><li><strong>Juni:</strong> Daftar ulang peserta yang diterima</li></ul><p>Pantau selalu website resmi UI karena jadwal bisa berubah setiap tahunnya.</p>` },
    ]
  },
  {
    id: 2, title: 'Persiapan Dokumen', duration: '25 menit',
    lessons: [
      { id: 'ppkb-2-1', title: 'Dokumen Wajib yang Dibutuhkan', type: 'text', duration: '8 menit', content: `<h2>Dokumen Wajib PPKB UI</h2><p>Siapkan dokumen berikut jauh-jauh hari agar pendaftaranmu lancar:</p><ul><li>Scan rapor semester 1–5 (legalisir)</li><li>Surat rekomendasi kepala sekolah (bermaterai)</li><li>Kartu keluarga & KTP/KIA</li><li>Ijazah/SKL (untuk lulusan)</li><li>Sertifikat prestasi (jika ada)</li><li>Pas foto 3×4 background merah</li><li>Essay motivasi (diunggah dalam PDF)</li></ul>` },
      { id: 'ppkb-2-2', title: 'Cara Scan Dokumen yang Benar', type: 'text', duration: '7 menit', content: `<h2>Tips Scan Dokumen</h2><p>Dokumen yang buruk kualitasnya bisa menyebabkan berkas ditolak. Ikuti panduan ini:</p><ul><li>Resolusi minimal 300 DPI</li><li>Format file: PDF atau JPG (cek ketentuan portal)</li><li>Ukuran file: maksimal 1 MB per file</li><li>Pastikan semua teks terbaca jelas, tidak blur</li><li>Tidak ada bayangan atau lipatan yang menutupi teks</li></ul><p>Gunakan aplikasi CamScanner atau Adobe Scan jika tidak punya scanner fisik.</p>` },
      { id: 'ppkb-2-3', title: 'Checklist Kesiapan Berkas', type: 'text', duration: '10 menit', content: `<h2>Checklist Final Dokumen</h2><p>Sebelum submit, pastikan semua item ini sudah ✓:</p><ul><li>☐ Rapor semester 1–5 (lengkap, legalisir)</li><li>☐ Surat rekomendasi (ditandatangani, bermaterai)</li><li>☐ KK dan KTP/KIA (jelas, tidak kedaluwarsa)</li><li>☐ Sertifikat prestasi (relevan, tidak lebih dari 3 tahun)</li><li>☐ Foto formal terbaru</li><li>☐ Essay sudah di-review dan difinalisasi</li><li>☐ Semua file sesuai format dan ukuran yang diminta</li></ul><p>Simpan semua dokumen dalam satu folder terorganisir sebelum upload.</p>` },
    ]
  },
  {
    id: 3, title: 'Strategi Essay Bagian 1', duration: '30 menit',
    lessons: [
      { id: 'ppkb-3-1', title: 'Memahami Prompt Essay PPKB', type: 'text', duration: '10 menit', content: `<h2>Memahami Prompt Essay</h2><p>Essay PPKB UI biasanya terdiri dari beberapa pertanyaan yang menggali:</p><ul><li><strong>Motivasi:</strong> Mengapa memilih prodi ini? Apa yang mendorongmu?</li><li><strong>Rencana masa depan:</strong> Apa kontribusimu setelah lulus?</li><li><strong>Pengalaman relevan:</strong> Apa yang sudah kamu lakukan terkait bidang ini?</li><li><strong>Kesesuaian nilai:</strong> Bagaimana nilai hidupmu selaras dengan visi UI?</li></ul><p>Kunci: <em>jujur, spesifik, dan personal</em>. Hindari klise seperti "saya ingin membanggakan orang tua".</p>` },
      { id: 'ppkb-3-2', title: 'Teknik Brainstorming Essay', type: 'text', duration: '10 menit', content: `<h2>Brainstorming Ide Essay</h2><p>Sebelum menulis, luangkan 30 menit untuk brainstorming dengan cara ini:</p><ol><li><strong>Mind mapping:</strong> Tuliskan kata kunci dari prompt di tengah, lalu cabangkan dengan pengalaman pribadimu</li><li><strong>Metode STAR:</strong> Situation, Task, Action, Result — cocok untuk cerita pengalaman</li><li><strong>5 Whys:</strong> Tanya "kenapa?" 5 kali berturut-turut untuk menemukan motivasi terdalam</li></ol><p>Pilih 1–2 cerita paling kuat yang autentik dan spesifik.</p>` },
      { id: 'ppkb-3-3', title: 'Struktur Essay yang Kuat', type: 'text', duration: '10 menit', content: `<h2>Struktur Essay PPKB</h2><p>Essay yang baik punya struktur yang jelas:</p><ol><li><strong>Hook (1 paragraf):</strong> Buka dengan cerita spesifik atau fakta menarik yang langsung relevan</li><li><strong>Isi (2–3 paragraf):</strong> Jelaskan pengalamanmu, pelajaran yang didapat, dan kaitannya dengan prodi pilihan</li><li><strong>Closing (1 paragraf):</strong> Visi masa depan yang konkret — bukan sekadar "saya ingin sukses"</li></ol><p>Total: 500–700 kata adalah ideal untuk essay PPKB.</p>` },
    ]
  },
  {
    id: 4, title: 'Menulis Essay Bagian 2', duration: '35 menit',
    lessons: [
      { id: 'ppkb-4-1', title: 'Menulis Draft Pertama', type: 'text', duration: '12 menit', content: `<h2>Cara Menulis Draft Pertama</h2><p>Draft pertama bukan soal kesempurnaan — soal menuangkan semua ide ke dalam tulisan.</p><ul><li>Set timer 20 menit, tulis tanpa berhenti</li><li>Jangan edit dulu saat menulis draft</li><li>Tulis lebih dari batas kata — kamu bisa potong nanti</li><li>Gunakan bahasa yang natural, seperti kamu berbicara</li></ul><p>Setelah draft selesai, istirahat 1–2 jam sebelum mulai revisi. Jarak waktu membuatmu lebih objektif.</p>` },
      { id: 'ppkb-4-2', title: 'Proses Revisi Essay', type: 'text', duration: '12 menit', content: `<h2>Cara Merevisi Essay dengan Efektif</h2><p>Revisi adalah proses multi-tahap:</p><ol><li><strong>Revisi konten:</strong> Apakah setiap paragraf punya tujuan yang jelas? Ada yang perlu dihapus?</li><li><strong>Revisi alur:</strong> Apakah satu paragraf mengalir ke yang berikutnya dengan mulus?</li><li><strong>Revisi bahasa:</strong> Ganti kata klise dengan yang lebih spesifik dan powerful</li><li><strong>Revisi teknis:</strong> EYD, tanda baca, konsistensi format</li></ol>` },
      { id: 'ppkb-4-3', title: 'Proofreading & Finalisasi', type: 'text', duration: '11 menit', content: `<h2>Proofreading Final Essay</h2><p>Sebelum submit, lakukan proofreading dengan cara ini:</p><ul><li>Baca keras-keras — telinga lebih peka menangkap kalimat janggal</li><li>Minta orang lain membaca — teman, guru, atau anggota keluarga</li><li>Gunakan grammarly atau LanguageTool untuk cek otomatis</li><li>Cek kesesuaian dengan ketentuan: jumlah kata, format, topik</li></ul><p>Finalisasi: simpan sebagai PDF, cek tampilan PDF-nya sebelum upload.</p>` },
    ]
  },
  {
    id: 5, title: 'Nilai Rapor & Prestasi', duration: '25 menit',
    lessons: [
      { id: 'ppkb-5-1', title: 'Cara Hitung Nilai Rapor', type: 'text', duration: '8 menit', content: `<h2>Menghitung Rata-rata Rapor</h2><p>Nilai rapor yang dihitung biasanya adalah semester 1–5. Cara hitungnya:</p><ul><li>Jumlahkan semua nilai akhir per mata pelajaran per semester</li><li>Bagi dengan jumlah mata pelajaran × 5 semester</li><li>Beberapa prodi memberi bobot lebih pada mapel tertentu (cek di SIMAK UI)</li></ul><p>Tips: Pastikan nilai rapor yang kamu input di portal sesuai persis dengan nilai di rapor fisikmu.</p>` },
      { id: 'ppkb-5-2', title: 'Mata Pelajaran yang Diperhitungkan', type: 'text', duration: '8 menit', content: `<h2>Mapel yang Dihitung PPKB UI</h2><p>Umumnya semua mata pelajaran dihitung, tapi mapel inti mendapat perhatian lebih:</p><ul><li>Matematika, Bahasa Indonesia, Bahasa Inggris (wajib)</li><li>IPA: Fisika, Kimia, Biologi (untuk prodi sains/teknik)</li><li>IPS: Ekonomi, Sejarah, Geografi (untuk prodi sosial/humaniora)</li></ul><p>Cek persyaratan spesifik prodi yang kamu tuju karena bisa berbeda.</p>` },
      { id: 'ppkb-5-3', title: 'Strategi Highlight Prestasi', type: 'text', duration: '9 menit', content: `<h2>Menonjolkan Prestasi dengan Tepat</h2><p>Strategi memilih prestasi yang paling impactful:</p><ul><li>Prioritaskan prestasi yang <strong>relevan dengan prodi</strong> yang dituju</li><li>Tingkat: internasional > nasional > provinsi > kota/kabupaten</li><li>Recency: prestasi 1–3 tahun terakhir lebih kuat</li><li>Kuantifikasi jika bisa: "Juara 1 dari 500 peserta" lebih kuat dari sekadar "Juara 1"</li></ul>` },
    ]
  },
  {
    id: 6, title: 'Memilih Program Studi', duration: '30 menit',
    lessons: [
      { id: 'ppkb-6-1', title: 'Riset Prodi Impianmu', type: 'text', duration: '10 menit', content: `<h2>Cara Riset Program Studi</h2><p>Sebelum mendaftar, pastikan kamu benar-benar paham prodinya:</p><ul><li>Baca kurikulum di website resmi UI</li><li>Cek prospek karir lulusan (LinkedIn, Jobstreet)</li><li>Cari tahu dosen dan penelitian yang sedang berjalan</li><li>Ikut webinar prodi atau open house UI</li><li>Hubungi mahasiswa aktif prodi tersebut</li></ul>` },
      { id: 'ppkb-6-2', title: 'Memahami Daya Tampung & Peminat', type: 'text', duration: '10 menit', content: `<h2>Daya Tampung & Tingkat Persaingan</h2><p>Cara baca statistik daya tampung PPKB:</p><ul><li>Cek LTMPT/SNPMB untuk data resmi tiap tahun</li><li>Perhatikan rasio pendaftar vs diterima</li><li>Prodi populer (FKUI, FH, FE) biasanya rasio 1:20 ke atas</li><li>Prodi sains murni biasanya lebih rendah persaingannya</li></ul><p>Gunakan data ini untuk membuat strategi realistis.</p>` },
      { id: 'ppkb-6-3', title: 'Strategi Pilihan Prodi', type: 'text', duration: '10 menit', content: `<h2>Strategi Memilih Prodi PPKB</h2><p>PPKB biasanya hanya 1 pilihan prodi per pendaftaran. Tips:</p><ul><li>Pilih prodi yang benar-benar kamu inginkan — bukan yang dianggap "aman"</li><li>Selaraskan dengan pengalamanmu di essay</li><li>Pastikan profilmu (rapor + prestasi + essay) sesuai dengan standar prodi itu</li><li>Jika berambisi ke prodi sangat kompetitif, persiapkan jalur cadangan</li></ul>` },
    ]
  },
  {
    id: 7, title: 'Simulasi Pendaftaran', duration: '20 menit',
    lessons: [
      { id: 'ppkb-7-1', title: 'Langkah Daftar Online', type: 'text', duration: '7 menit', content: `<h2>Cara Daftar PPKB Online</h2><p>Pendaftaran dilakukan di <strong>penerimaan.ui.ac.id</strong>. Langkah-langkahnya:</p><ol><li>Buat akun dengan email aktif</li><li>Isi data diri dan data sekolah</li><li>Pilih jalur: PPKB</li><li>Pilih program studi</li><li>Isi data nilai rapor</li><li>Upload dokumen yang diminta</li><li>Tulis/upload essay</li><li>Bayar biaya pendaftaran</li><li>Submit dan cetak bukti pendaftaran</li></ol>` },
      { id: 'ppkb-7-2', title: 'Tips Mengisi Formulir', type: 'text', duration: '6 menit', content: `<h2>Tips Mengisi Formulir dengan Benar</h2><ul><li>Gunakan browser Chrome/Firefox terbaru</li><li>Jangan refresh halaman saat sedang upload</li><li>Isi data sesuai dokumen resmi (nama, NIK, NISN)</li><li>Screenshot setiap langkah sebagai bukti</li><li>Simpan draft sebelum berpindah halaman</li><li>Jangan menunggu deadline — server bisa lambat di hari terakhir</li></ul>` },
      { id: 'ppkb-7-3', title: 'Review Sebelum Submit', type: 'text', duration: '7 menit', content: `<h2>Checklist Sebelum Submit Akhir</h2><ul><li>☐ Semua kolom terisi, tidak ada yang kosong</li><li>☐ Nilai rapor sesuai dengan rapor fisik</li><li>☐ Semua dokumen terupload dengan benar dan terbaca</li><li>☐ Essay sudah final (tidak bisa diubah setelah submit)</li><li>☐ Email konfirmasi sudah diterima</li><li>☐ Nomor pendaftaran sudah dicatat</li></ul><p>Setelah submit, simpan semua bukti dan nomor pendaftaran.</p>` },
    ]
  },
  {
    id: 8, title: 'Strategi Mental & Waktu', duration: '20 menit',
    lessons: [
      { id: 'ppkb-8-1', title: 'Manajemen Waktu Persiapan', type: 'text', duration: '7 menit', content: `<h2>Timeline Persiapan Ideal</h2><p>Idealnya persiapan PPKB dimulai 3–4 bulan sebelum deadline:</p><ul><li><strong>Bulan 1:</strong> Riset prodi, kumpulkan dokumen, brainstorming essay</li><li><strong>Bulan 2:</strong> Tulis dan revisi essay, legalisir dokumen</li><li><strong>Bulan 3:</strong> Review final, minta feedback, scan dokumen</li><li><strong>2 minggu sebelum:</strong> Siapkan akun, coba simulasi upload</li><li><strong>1 minggu sebelum:</strong> Submit pendaftaran</li></ul>` },
      { id: 'ppkb-8-2', title: 'Mengelola Anxiety & Ekspektasi', type: 'text', duration: '7 menit', content: `<h2>Mengelola Kecemasan</h2><p>Wajar merasa cemas sebelum seleksi. Tips mengelolanya:</p><ul><li>Fokus pada proses yang bisa kamu kontrol, bukan hasil</li><li>Cerita ke orang yang supportif — jangan pendam sendiri</li><li>Buat rencana B dari awal agar gak terlalu bergantung satu jalur</li><li>Ingat: ditolak bukan berarti gagal. Ada banyak jalur lain.</li></ul>` },
      { id: 'ppkb-8-3', title: 'Rencana Cadangan yang Solid', type: 'text', duration: '6 menit', content: `<h2>Menyiapkan Jalur Cadangan</h2><p>Jangan taruh semua harapan di satu jalur. Strategi:</p><ul><li>Daftar SNBP dan PPKB bersamaan (jika jadwal memungkinkan)</li><li>Persiapkan untuk UTBK-SNBT sejak awal</li><li>Pertimbangkan jalur mandiri PTN lain sebagai opsi</li><li>Tidak ada salahnya mempertimbangkan PTN lain yang sesuai bidang minatmu</li></ul>` },
    ]
  },
  {
    id: 9, title: 'Review & Latihan', duration: '25 menit',
    lessons: [
      { id: 'ppkb-9-1', title: 'Evaluasi Kesiapan Diri', type: 'text', duration: '8 menit', content: `<h2>Self-Assessment Sebelum Daftar</h2><p>Jujur jawab pertanyaan ini:</p><ul><li>Apakah nilai raporku kompetitif untuk prodi ini?</li><li>Apakah essayku sudah benar-benar kuat dan autentik?</li><li>Apakah prestasimu relevan dan terverifikasi?</li><li>Apakah semua dokumenku sudah lengkap?</li></ul><p>Jika ada yang belum siap, masih ada waktu untuk diperbaiki sebelum deadline.</p>` },
      { id: 'ppkb-9-2', title: 'Review Essay dengan Mentor', type: 'text', duration: '10 menit', content: `<h2>Cara Review Essay dengan Efektif</h2><p>Feedback dari orang lain sangat penting. Tips:</p><ul><li>Minta guru bahasa Indonesia untuk review EYD dan gaya bahasa</li><li>Minta guru BK untuk review konten dan relevansi</li><li>Minta teman yang sudah diterima di jalur serupa</li><li>Gunakan fitur Essay AI Review di platform ini untuk feedback cepat</li></ul>` },
      { id: 'ppkb-9-3', title: 'Perbaikan Terakhir', type: 'text', duration: '7 menit', content: `<h2>Final Touch Sebelum Submit</h2><p>Iterasi terakhir yang sering dilupakan:</p><ul><li>Cek konsistensi nama prodi dan universitas (jangan salah ketik!)</li><li>Pastikan essay tidak mengandung nama orang tua/kerabat secara berlebihan</li><li>Baca ulang sekali lagi dengan fresh eyes</li><li>Konfirmasi dengan guru BK bahwa surat rekomendasi sudah ditandatangani</li></ul>` },
    ]
  },
  {
    id: 10, title: 'Hari H & Pengumuman', duration: '15 menit',
    lessons: [
      { id: 'ppkb-10-1', title: 'Persiapan Hari Pengumuman', type: 'text', duration: '5 menit', content: `<h2>Checklist Hari Pengumuman</h2><ul><li>Catat tanggal dan jam pengumuman resmi</li><li>Pantau website resmi UI (bukan sumber tidak resmi)</li><li>Siapkan nomor pendaftaran untuk cek hasil</li><li>Informasikan ke orang tua agar mereka tahu jadwalnya</li></ul>` },
      { id: 'ppkb-10-2', title: 'Jika Diterima: Langkah Selanjutnya', type: 'text', duration: '5 menit', content: `<h2>Diterima di PPKB UI — Apa Selanjutnya?</h2><p>Selamat! Segera lakukan:</p><ol><li>Cek jadwal dan prosedur daftar ulang</li><li>Siapkan dokumen untuk registrasi</li><li>Bayar UKT/biaya kuliah sesuai ketentuan</li><li>Jangan lupa undur diri dari jalur lain yang masih aktif</li><li>Bergabung dengan grup angkatan dan orientasi mahasiswa baru</li></ol>` },
      { id: 'ppkb-10-3', title: 'Jika Belum Diterima: Move Forward', type: 'text', duration: '5 menit', content: `<h2>Belum Diterima — Bukan Akhir Segalanya</h2><p>Penolakan bukan kegagalan permanen. Yang perlu dilakukan:</p><ul><li>Tenangkan diri dulu — wajar kecewa</li><li>Segera fokus ke jalur berikutnya (SNBT, mandiri)</li><li>Evaluasi: apa yang bisa ditingkatkan?</li><li>Jika tahun depan mencoba lagi, kamu punya pengalaman lebih</li></ul><p>Banyak orang sukses yang tidak diterima di pilihan pertamanya.</p>` },
    ]
  },
]

// Simplified version for other jalurs (same structure, different content)
function makeStages(prefix: string, jalurName: string): EStage[] {
  const topics = [
    ['Mengenal ' + jalurName, ['Apa itu ' + jalurName + '?', 'Persyaratan Umum', 'Timeline Pendaftaran']],
    ['Persiapan Berkas', ['Dokumen Wajib', 'Cara Scan Dokumen', 'Checklist Kesiapan']],
    ['Strategi Essay', ['Memahami Prompt', 'Teknik Brainstorming', 'Struktur Essay']],
    ['Menulis Essay', ['Draft Pertama', 'Proses Revisi', 'Proofreading Final']],
    ['Nilai & Prestasi', ['Cara Hitung Nilai', 'Mapel yang Diperhitungkan', 'Highlight Prestasi']],
    ['Pilihan Prodi', ['Riset Prodi', 'Daya Tampung & Peminat', 'Strategi Memilih']],
    ['Simulasi Daftar', ['Langkah Daftar Online', 'Tips Mengisi Formulir', 'Review Sebelum Submit']],
    ['Strategi Mental', ['Manajemen Waktu', 'Kelola Kecemasan', 'Rencana Cadangan']],
    ['Review & Latihan', ['Evaluasi Diri', 'Review dengan Mentor', 'Perbaikan Terakhir']],
    ['Hari H', ['Persiapan Pengumuman', 'Jika Diterima', 'Jika Belum Diterima']],
  ] as [string, string[]][]

  return topics.map(([title, lessons], si) => ({
    id: si + 1,
    title,
    duration: `${15 + si * 2} menit`,
    lessons: lessons.map((lt, li) => ({
      id: `${prefix}-${si + 1}-${li + 1}`,
      title: lt,
      type: 'text' as const,
      duration: `${5 + li * 2} menit`,
      content: `<h2>${lt}</h2><p>Materi ini membahas ${lt.toLowerCase()} dalam konteks ${jalurName}. Konten lengkap segera hadir — pantau update terbaru di platform ini!</p>`,
    }))
  }))
}

export const EJALUR_LIST: EJalur[] = [
  { id: 'ppkb', label: 'PPKB UI', stages: PPKB_STAGES },
  { id: 'snbp', label: 'SNBP', stages: makeStages('snbp', 'SNBP') },
  { id: 'sjp', label: 'SJP UI', stages: makeStages('sjp', 'SJP UI') },
  { id: 'ssu-rapor-itb', label: 'SSU Rapor ITB', stages: makeStages('ssu', 'SSU Rapor ITB') },
]
