export interface ELesson {
  id: string
  title: string
  type: 'text' | 'video'
  duration: string
  content: string
  videoUrl?: string
  isPremium?: boolean
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

// ─────────────────────────────────────────────────────────────
// 1. PPKB UI TRACK (10 Units with Free & Premium Lessons)
// ─────────────────────────────────────────────────────────────
const PPKB_STAGES: EStage[] = [
  {
    id: 1,
    title: 'Mengenal PPKB UI',
    duration: '20 menit',
    lessons: [
      {
        id: 'ppkb-1-1',
        title: 'Apa itu PPKB UI & Peluang Lolosnya?',
        type: 'video',
        duration: '8 menit',
        videoUrl: 'https://www.youtube.com/embed/fG8Oye9oHz4',
        content: `<h2>Apa itu PPKB UI?</h2><p>PPKB (Program Pemerataan Kesempatan Belajar) UI adalah jalur seleksi rapor dan prestasi non-tes khusus untuk Universitas Indonesia. Berbeda dari SNBP yang menggunakan kuota nasional, PPKB menilai <strong>essay motivasi personal</strong>, prestasi, dan rekam jejak sekolah secara komprehensif.</p><p>Keunggulan utama jalur PPKB:</p><ul><li>Seleksi murni berbasis portofolio dan rapor tanpa tes tertulis.</li><li>Tersedia untuk program Sarjana (S1) dan Vokasi (D3/D4) di hampir semua fakultas UI.</li><li>Peluang besar bagi siswa yang memiliki essay kuat dan prestasi linear.</li></ul>`,
      },
      {
        id: 'ppkb-1-2',
        title: 'Persyaratan & Ketentuan Pendaftaran',
        type: 'text',
        duration: '7 menit',
        content: `<h2>Persyaratan Umum PPKB UI</h2><p>Pastikan kamu memenuhi kriteria berikut sebelum mendaftar:</p><ul><li>Siswa kelas 12 SMA/SMK/MA yang diajukan oleh sekolah dan memiliki NISN valid.</li><li>Mendapat rekomendasi resmi dari Kepala Sekolah.</li><li>Memiliki nilai rapor semester 1 sampai 5 yang konsisten dan memenuhi batas aman prodi tujuan.</li><li>Memiliki sertifikat prestasi akademik atau non-akademik (minimal tingkat kota/kabupaten).</li></ul>`,
      },
      {
        id: 'ppkb-1-3',
        title: 'Bedah Kuota & Daya Tampung Tiap Fakultas UI',
        type: 'text',
        duration: '10 menit',
        isPremium: true,
        content: `<h2>[EKSKLUSIF PREMIUM] Analisis Daya Tampung & Ketetatan PPKB UI</h2><p>Materi premium ini membedah data ketetatan riil per fakultas di Universitas Indonesia (FK, FEB, FT, FH, Fasilkom, FIA, FISIP, FIB, FPsi, FMIPA):</p><ul><li><strong>Top 5 Prodi Paling Ketat:</strong> Kedokteran (1:35), Ilmu Komunikasi (1:28), Manajemen (1:25), Akuntansi (1:22), dan Psikologi (1:20).</li><li><strong>Prodi Peluang Tinggi:</strong> Teknik Perkapalan, Geofisika, Sastra Daerah/Jawa, dan Program Terapan Vokasi UI (rasio 1:4 sampai 1:8).</li><li><strong>Strategi Pemilihan:</strong> Gunakan Kalkulator Peluang OTWPTN untuk membandingkan rata-rata rapormu dengan nilai rata-rata alumni yang lolos tahun lalu.</li></ul>`,
      },
    ],
  },
  {
    id: 2,
    title: 'Persiapan Berkas & Dokumen',
    duration: '25 menit',
    lessons: [
      {
        id: 'ppkb-2-1',
        title: 'Daftar Dokumen Wajib PPKB UI',
        type: 'text',
        duration: '8 menit',
        content: `<h2>Dokumen Wajib yang Harus Disiapkan</h2><p>Siapkan berkas ini dalam format PDF siap unggah:</p><ul><li>Scan rapor semester 1 sampai 5 lengkap berlegalisir.</li><li>Surat rekomendasi Kepala Sekolah dengan cap basah atau barcode resmi.</li><li>Kartu Keluarga (KK) dan KTP / Kartu Pelajar.</li><li>Salinan sertifikat prestasi 3 tahun terakhir (maksimal 3 sertifikat terbaik).</li><li>Pasfoto formal terbaru dengan latar belakang merah/putih.</li></ul>`,
      },
      {
        id: 'ppkb-2-2',
        title: 'Standar Format Scan & Anti-Gagal Verifikasi',
        type: 'text',
        duration: '7 menit',
        content: `<h2>Tips Scan Berkas Bebas Diskualifikasi</h2><p>Banyak peserta gugur administrasi karena dokumen buram:</p><ul><li>Resolusi scan minimal 200 hingga 300 DPI dengan orientasi tegak (portrait).</li><li>Hindari foto dokumen menggunakan kamera HP tanpa aplikasi scanner.</li><li>Periksa bahwa tanda tangan dan stempel sekolah terlihat kontras dan terbaca.</li><li>Gunakan fitur Brankas Dokumen di platform ini untuk backup berkas aman di perangkatmu.</li></ul>`,
      },
      {
        id: 'ppkb-2-3',
        title: 'Template Surat Rekomendasi & Checklist Kurasi Prestasi',
        type: 'text',
        duration: '10 menit',
        isPremium: true,
        content: `<h2>[EKSKLUSIF PREMIUM] Template & Bobot Sertifikat PPKB UI</h2><p>Panduan kurasi sertifikat berbobot maksimal di mata verifikator UI:</p><ul><li><strong>Tingkat Internasional / Nasional Puspresnas:</strong> Bobot nilai tertinggi (skor 90-100).</li><li><strong>Sertifikat Kejuaraan vs Peserta:</strong> Sertifikat juara kompetisi berjenjang bernilai 3x lipat dibanding sertifikat seminar atau peserta biasa.</li><li><strong>Linearitas Jurusan:</strong> Sertifikat OSN Astronomi untuk Fisika/Teknik, KTI untuk Kedokteran/FEB, atau Lomba Debat untuk Hukum/FISIP.</li></ul>`,
      },
    ],
  },
  {
    id: 3,
    title: 'Strategi & Konsep Esai PPKB',
    duration: '30 menit',
    lessons: [
      {
        id: 'ppkb-3-1',
        title: 'Tutorial Menulis Essay Personal Statement Menarik',
        type: 'video',
        duration: '12 menit',
        videoUrl: 'https://www.youtube.com/embed/aRHrCCbzxes',
        content: `<h2>Bedah Esai Lolos Seleksi PTN & Beasiswa</h2><p>Video ini mengupas rahasia merangkai narasi personal statement yang autentik, menarik perhatian penyeleksi, dan membuktikan kelayakanmu sebagai calon mahasiswa unggulan.</p><p>Poin penting yang dipelajari:</p><ul><li>Cara menemukan hook pembuka yang kuat di kalimat pertama.</li><li>Menghindari klise "Sejak kecil saya bercita-cita...".</li><li>Menyambungkan masa lalu, minat akademik saat ini, dan impian karir masa depan.</li></ul>`,
      },
      {
        id: 'ppkb-3-2',
        title: 'Metode STAR dalam Mengangkat Pengalaman',
        type: 'text',
        duration: '8 menit',
        content: `<h2>Menulis Cerita dengan Metode STAR</h2><p>Gunakan formula STAR agar setiap pengalamanmu terdengar profesional:</p><ul><li><strong>Situation:</strong> Jelaskan situasi atau tantangan awal yang kamu hadapi.</li><li><strong>Task:</strong> Apa tanggung jawab atau target yang harus dicapai?</li><li><strong>Action:</strong> Langkah konkret apa yang kamu ambil secara mandiri?</li><li><strong>Result:</strong> Dampak positif apa yang tercipta dan apa pelajaran hidup yang kamu petik?</li></ul>`,
      },
      {
        id: 'ppkb-3-3',
        title: '10 Contoh Esai Lolos Mahasiswa Aktif UI (FK, FEB, Fasilkom)',
        type: 'text',
        duration: '15 menit',
        isPremium: true,
        content: `<h2>[EKSKLUSIF PREMIUM] Arsip 10 Esai Asli yang Diterima di PPKB UI</h2><p>Pelajari langsung struktur dan gaya bahasa esai alumni OTWPTN yang berhasil lolos ke prodi bergengsi UI:</p><ul><li><strong>Esai 1 (Kedokteran UI):</strong> Fokus pada observasi fasilitas puskesmas lokal dan inisiatif edukasi stunting remaja.</li><li><strong>Esai 2 (Ilmu Komputer UI):</strong> Membahas proyek aplikasi mobile sederhana untuk UMKM keluarga dan ketertarikan AI etis.</li><li><strong>Esai 3 (Manajemen FEB UI):</strong> Narasi kepemimpinan osis mengelola dana pensiun sekolah dengan transparansi digital.</li></ul>`,
      },
    ],
  },
  {
    id: 4,
    title: 'Penulisan & Finalisasi Esai',
    duration: '30 menit',
    lessons: [
      {
        id: 'ppkb-4-1',
        title: 'Cara Menulis Draft Esai Mengalir',
        type: 'video',
        duration: '10 menit',
        videoUrl: 'https://www.youtube.com/embed/DVBGDmcPzxI',
        content: `<h2>Menulis Esai untuk Pemula Tanpa Stuck</h2><p>Panduan langkah demi langkah memecah proses menulis esai dari draft kasar menjadi karya utuh yang siap direview AI dan mentor.</p>`,
      },
      {
        id: 'ppkb-4-2',
        title: 'Checklist Self-Proofreading & EYD',
        type: 'text',
        duration: '8 menit',
        content: `<h2>Koreksi Mandiri Sebelum Submit</h2><ul><li>Cek batas jumlah kata sesuai ketentuan fakultas (biasanya 500-800 kata).</li><li>Hindari kata tidak baku seperti 'dimana' sebagai kata hubung, 'antar sesama', atau 'merubah'.</li><li>Pastikan transisi antarparagraf terasa padu dan kohesif.</li><li>Manfaatkan fitur Essay AI Review OTWPTN untuk skor instan instrumen seleksi UI.</li></ul>`,
      },
      {
        id: 'ppkb-4-3',
        title: 'Rubrik Penilaian Esai Verifikator UI & Kriteria Diskualifikasi',
        type: 'text',
        duration: '12 menit',
        isPremium: true,
        content: `<h2>[EKSKLUSIF PREMIUM] Rubrik 4 Aspek Penilaian Dosen UI</h2><p>Dosen penilai UI menggunakan matriks berikut dalam memberi nilai esai:</p><ol><li><strong>Autentisitas & Refleksi Diri (30%):</strong> Bukan esai hasil plagiat atau generik buatan prompt standar.</li><li><strong>Kecocokan Visi Prodi (25%):</strong> Pemahaman mendalam mengenai kurikulum prodi di UI.</li><li><strong>Komitmen Kontribusi (25%):</strong> Rencana realistis yang memberi dampak bagi masyarakat setelah lulus.</li><li><strong>Kualitas Bahasa & Ejaan (20%):</strong> Tata bahasa terstruktur dan enak dibaca.</li></ol>`,
      },
    ],
  },
  {
    id: 5,
    title: 'Analisis Nilai Rapor & Peluang',
    duration: '25 menit',
    lessons: [
      {
        id: 'ppkb-5-1',
        title: 'Trik Membaca Tren Nilai Rapor & Indeks Sekolah',
        type: 'video',
        duration: '11 menit',
        videoUrl: 'https://www.youtube.com/embed/isgqGjGOZYE',
        content: `<h2>Kupas Tuntas Indeks Sekolah & Nilai Rapor</h2><p>Pahami bagaimana universitas top menghitung bobot nilai rapormu berdasarkan rekam jejak alumni sekolahmu di PTN terkait.</p>`,
      },
      {
        id: 'ppkb-5-2',
        title: 'Mapel Pendukung Linear per Fakultas',
        type: 'text',
        duration: '8 menit',
        content: `<h2>Mata Pelajaran yang Paling Menentukan</h2><p>Masing-masing fakultas memiliki pembobotan khusus:</p><ul><li><strong>Sains & Teknologi:</strong> Matematika Peminatan/Lanjut, Fisika, Kimia, Biologi.</li><li><strong>Sosial Humaniora:</strong> Matematika, Bahasa Indonesia, Ekonomi, Sosiologi, Sejarah.</li><li><strong>Kedokteran & Kesehatan:</strong> Biologi, Kimia, dan Bahasa Inggris akademik.</li></ul>`,
      },
      {
        id: 'ppkb-5-3',
        title: 'Kalkulasi Skor Peluang & Simulasi Rasio Lolos',
        type: 'text',
        duration: '10 menit',
        isPremium: true,
        content: `<h2>[EKSKLUSIF PREMIUM] Database Nilai Rapor Diterima PPKB UI</h2><p>Rekapitulasi nilai rata-rata rapor siswa lolos tahun lalu:</p><ul><li>FK UI: Rata-rata 91.8 (terendah 89.2 dengan prestasi nasional).</li><li>Fasilkom UI: Rata-rata 89.5 (terendah 87.8).</li><li>FEB UI: Rata-rata 89.0 (terendah 87.2).</li><li>Hukum UI: Rata-rata 88.6 (terendah 86.5).</li></ul>`,
      },
    ],
  },
]

// ─────────────────────────────────────────────────────────────
// 2. SNBP TRACK (Strategi Non-Tes & Rapor Nasional)
// ─────────────────────────────────────────────────────────────
const SNBP_STAGES: EStage[] = [
  {
    id: 1,
    title: 'Mengenal SNBP & Sistem Seleksi',
    duration: '20 menit',
    lessons: [
      {
        id: 'snbp-1-1',
        title: 'Aturan Resmi SNBP & Komponen Penilaian Rapor',
        type: 'video',
        duration: '9 menit',
        videoUrl: 'https://www.youtube.com/embed/fG8Oye9oHz4',
        content: `<h2>Aturan Seleksi SNBP Nasional</h2><p>SNBP menilai seluruh mata pelajaran dengan bobot minimal 50% untuk rata-rata seluruh mapel, dan maksimal 50% untuk mapel pendukung program studi yang dituju ditambah portofolio/prestasi.</p>`,
      },
      {
        id: 'snbp-1-2',
        title: 'Cara Menentukan Kuota Siswa Eligible',
        type: 'text',
        duration: '7 menit',
        content: `<h2>Penentuan Siswa Eligible di Sekolah</h2><p>Akreditasi sekolah menentukan persentase siswa terbaik yang berhak mendaftar:</p><ul><li>Akreditasi A: 40% siswa terbaik.</li><li>Akreditasi B: 25% siswa terbaik.</li><li>Akreditasi C dan lainnya: 5% siswa terbaik.</li></ul>`,
      },
      {
        id: 'snbp-1-3',
        title: 'Strategi Lolos Siswa Eligible Peringkat Bawah',
        type: 'text',
        duration: '10 menit',
        isPremium: true,
        content: `<h2>[EKSKLUSIF PREMIUM] Trik Masuk PTN dari Peringkat 30% ke Bawah</h2><p>Jika peringkat eligible-mu tidak berada di 10 besar, jangan berkecil hati. Gunakan strategi ini:</p><ul><li>Hindari mendaftar di prodi yang sudah dipilih oleh teman satu sekolah yang memiliki peringkat di atasmu.</li><li>Pilih PTN di luar domisili yang memiliki kuota besar namun peminat moderat.</li><li>Maksimalkan nilai sertifikat pendukung dan portofolio kejuruan.</li></ul>`,
      },
    ],
  },
  {
    id: 2,
    title: 'Strategi Pemilihan Jurusan & PTN',
    duration: '25 menit',
    lessons: [
      {
        id: 'snbp-2-1',
        title: 'Strategi Memilih Jurusan & Menghindari Saling Bunuh Teman',
        type: 'video',
        duration: '12 menit',
        videoUrl: 'https://www.youtube.com/embed/7Yox72bv9CY',
        content: `<h2>Trik Mengatur Pilihan 1 & 2 di SNBP</h2><p>Video ini mengupas cara menghindari bentrokan pilihan dengan teman satu sekolah yang nilainya lebih tinggi, serta aturan pilihan PTN lintas provinsi.</p>`,
      },
      {
        id: 'snbp-2-2',
        title: 'Aturan Pemilihan 2 Prodi & Lokasi PTN',
        type: 'text',
        duration: '6 menit',
        content: `<h2>Ketentuan Pilihan Program Studi</h2><ul><li>Jika memilih 2 program studi, salah satu harus berada di PTN pada provinsi yang sama dengan sekolah asalmu.</li><li>Jika hanya memilih 1 program studi, kamu bebas memilih PTN di provinsi manapun di seluruh Indonesia.</li><li>Pastikan pilihan ke-1 adalah impian terbesarmu, dan pilihan ke-2 adalah opsi realistis yang memiliki rasio penerimaan lebih tinggi.</li></ul>`,
      },
      {
        id: 'snbp-2-3',
        title: 'Matriks Pemetaan Kompetisi Sekolah & Indeks Alumni PTN',
        type: 'text',
        duration: '12 menit',
        isPremium: true,
        content: `<h2>[EKSKLUSIF PREMIUM] Rumus Indeks Sekolah Versi Dosen Seleksi</h2><p>Indeks sekolah dihitung berdasarkan:</p><ol><li>Jumlah alumni yang aktif berkuliah di PTN tersebut (skor bobot 40%).</li><li>Rata-rata IPK alumni di PTN tersebut (skor bobot 30%).</li><li>Prestasi sekolah di ajang nasional (skor bobot 15%).</li><li>Akreditasi dan nilai UTBK rata-rata sekolah tahun sebelumnya (skor bobot 15%).</li></ol>`,
      },
    ],
  },
]

// ─────────────────────────────────────────────────────────────
// 3. PBM & PPU TRACK (Literasi Bahasa & Pemahaman Teks UTBK)
// ─────────────────────────────────────────────────────────────
const PBM_STAGES: EStage[] = [
  {
    id: 1,
    title: 'Pondasi Kalimat Efektif & S-P-O-K',
    duration: '25 menit',
    lessons: [
      {
        id: 'pbm-1-1',
        title: 'Konsep Dasar Kalimat Efektif & Ciri Kalimat Rancu',
        type: 'video',
        duration: '14 menit',
        videoUrl: 'https://www.youtube.com/embed/H7V70J12mZI',
        content: `<h2>Materi Inti Pemahaman Bacaan & Menulis</h2><p>Materi ini membahas syarat utama kalimat efektif dalam bahasa Indonesia akademik:</p><ul><li><strong>Kejelasan Subjek & Predikat:</strong> Kalimat tidak boleh kehilangan subjek karena diawali kata depan yang salah (misal: "Bagi yang belum bayar harus melapor" $\rightarrow$ salah).</li><li><strong>Ketepatan Diksi:</strong> Menggunakan kata yang memiliki arti presisi sesuai konteks kalimat.</li><li><strong>Kesejajaran Bentuk (Paralelisme):</strong> Imbuhan dalam kalimat majemuk setara harus seragam (misal: "membersihkan, mencuci, dan menyapu").</li></ul>`,
      },
      {
        id: 'pbm-1-2',
        title: 'Analisis Kalimat Tidak Lengkap (Subjek / Predikat Hilang)',
        type: 'text',
        duration: '8 menit',
        content: `<h2>Mendeteksi Kalimat yang Buntung / Cacat</h2><p>Contoh kesalahan yang paling sering muncul di UTBK dan penulisan esai:</p><ul><li><em>Salah:</em> "Menurut para ahli menyatakan bahwa iklim berubah." (Subjek hilang karena didahului kata keterangan 'menurut').</li><li><em>Benar:</em> "Menurut para ahli, iklim berubah." ATAU "Para ahli menyatakan bahwa iklim berubah."</li><li><em>Salah:</em> "Di dalam rapat itu memutuskan lima poin penting."</li><li><em>Benar:</em> "Rapat itu memutuskan lima poin penting."</li></ul>`,
      },
      {
        id: 'pbm-1-3',
        title: 'Cheatsheet Pola Kalimat & 50 Soal Analisis SPOK',
        type: 'text',
        duration: '12 menit',
        isPremium: true,
        content: `<h2>[EKSKLUSIF PREMIUM] Bedah Soal Asli SPOK & Inti Kalimat</h2><p>Trik cepat menemukan inti kalimat panjang dan bertingkat dalam waktu kurang dari 15 detik:</p><ul><li>Abaikan klausa anak yang diawali konjungsi 'yang', 'karena', 'walaupun', atau tanda kurung/koma penjelas.</li><li>Fokus cari Kata Benda pertama tanpa preposisi (itulah Subjek).</li><li>Cari Kata Kerja inti yang dikenai langsung oleh Subjek (itulah Predikat).</li></ul>`,
      },
    ],
  },
  {
    id: 2,
    title: 'PUEBI & Ejaan Bahasa Indonesia Resmi',
    duration: '25 menit',
    lessons: [
      {
        id: 'pbm-2-1',
        title: 'Kupas Tuntas EYD: Kata Depan Tempat vs Imbuhan',
        type: 'video',
        duration: '12 menit',
        videoUrl: 'https://www.youtube.com/embed/mzbbG_EuBpM',
        content: `<h2>Penulisan Kata Depan 'di/ke' vs Imbuhan 'di-/ke-'</h2><p>Panduan praktis agar tidak tertukar dalam ujian:</p><ul><li><strong>Kata Depan:</strong> Menunjukkan arah atau tempat, ditulis terpisah dengan spasi (contoh: <em>di kampus</em>, <em>ke sekolah</em>, <em>di rumah</em>).</li><li><strong>Imbuhan Pasif:</strong> Melekat pada kata kerja, ditulis serangkai tanpa spasi (contoh: <em>ditulis</em>, <em>dikembangkan</em>, <em>dilakukan</em>).</li><li><strong>Uji Coba Cepat:</strong> Jika bisa diubah ke bentuk aktif 'me-', maka wajib serangkai (contoh: ditulis $\rightarrow$ menulis). Jika tidak bisa (dikampus $\rightarrow$ mengampus?), berarti harus dipisah!</li></ul>`,
      },
      {
        id: 'pbm-2-2',
        title: 'Penulisan Huruf Kapital & Huruf Miring Resmi',
        type: 'text',
        duration: '7 menit',
        content: `<h2>Aturan Huruf Kapital & Miring</h2><ul><li><strong>Kapital:</strong> Huruf pertama nama geografi jika diikuti nama diri (<em>Pulau Jawa</em>, <em>Selat Sunda</em>, <em>Sungai Kapuas</em>). Namun nama geografi yang jadi jenis buah/makanan huruf kecil (<em>jeruk bali</em>, <em>kunci inggris</em>).</li><li><strong>Miring:</strong> Untuk istilah bahasa asing atau daerah yang belum diserap ke dalam KBBI (contoh: <em>online</em> ditulis <em>daring</em>, jika tetap online maka dimiringkan: <em>online</em>).</li></ul>`,
      },
      {
        id: 'pbm-2-3',
        title: 'Bank 150 Kata Baku KBBI yang Paling Sering Menjebak',
        type: 'text',
        duration: '15 menit',
        isPremium: true,
        content: `<h2>[EKSKLUSIF PREMIUM] Daftar Kata Baku vs Tidak Baku Terlengkap</h2><table border="1" cellpadding="6" style="width: 100%; border-collapse: collapse;"><thead><tr style="background: #fef3c7;"><th>Baku (Resmi KBBI)</th><th>Tidak Baku (Salah)</th></tr></thead><tbody><tr><td>analisis</td><td>analisa</td></tr><tr><td>praktik</td><td>praktek</td></tr><tr><td>kualitas</td><td>kualitet / kwalitas</td></tr><tr><td>sistem</td><td>sistim</td></tr><tr><td>napas</td><td>nafas</td></tr><tr><td>aktivitas</td><td>aktifitas</td></tr><tr><td>objek</td><td>obyek</td></tr><tr><td>konkret</td><td>kongkret / konkrit</td></tr><tr><td>isap</td><td>hisap</td></tr><tr><td>izin</td><td>ijin</td></tr></tbody></table>`,
      },
    ],
  },
  {
    id: 3,
    title: 'Konjungsi & Redundansi (Kalimat Efektif)',
    duration: '25 menit',
    lessons: [
      {
        id: 'pbm-3-1',
        title: 'Strategi Mengatasi Kalimat Boros & Kata Berlebihan',
        type: 'video',
        duration: '11 menit',
        videoUrl: 'https://www.youtube.com/embed/gmcDyBd0zsE',
        content: `<h2>Bedah Soal Menghapus Kata yang Mubazir</h2><p>Video ini membahas pola soal kalimat tidak efektif di mana terdapat kata berlebihan yang wajib dihilangkan (seperti 'sangat setuju sekali', 'agar supaya', 'sejak dari dulu').</p>`,
      },
      {
        id: 'pbm-3-2',
        title: 'Konjungsi Antarkalimat vs Intrakalimat',
        type: 'text',
        duration: '8 menit',
        content: `<h2>Tata Cara Penggunaan Kata Sambung</h2><ul><li><strong>Intrakalimat (di dalam 1 kalimat):</strong> sehingga, karena, walaupun, sedangkan, tetapi. Jangan ditaruh di awal kalimat!</li><li><strong>Antarkalimat (di awal kalimat baru, diikuti koma):</strong> Oleh karena itu, Namun, Selain itu, Meskipun demikian.</li><li><em>Salah:</em> "Saya belajar giat. Sehingga saya lulus."</li><li><em>Benar:</em> "Saya belajar giat sehingga saya lulus." ATAU "Saya belajar giat. Oleh karena itu, saya lulus."</li></ul>`,
      },
      {
        id: 'pbm-3-3',
        title: 'Trik Pola Soal Kalimat Hapus di Arena Latihan',
        type: 'text',
        duration: '10 menit',
        isPremium: true,
        content: `<h2>[EKSKLUSIF PREMIUM] Strategi Menjawab Soal Tipe 'Hapus Kata Ini'</h2><p>Gunakan logika berikut saat bermain di Arena Kuis PBM:</p><ul><li>Cek apakah ada dua kata bersinonim yang berdekatan: misal 'amat' dengan 'sangat', 'hanya' dengan 'saja', 'daftar' dengan 'list'.</li><li>Cek apakah ada pengulangan jamak: 'banyak siswa-siswa' (cukup 'banyak siswa' atau 'siswa-siswa').</li><li>Cek kata hubung ganda yang bertentangan: 'Meskipun lelah, tetapi ia terus berjalan' (pilih salah satu: buang 'tetapi').</li></ul>`,
      },
    ],
  },
  {
    id: 4,
    title: 'PPU: Analogi & Padanan Hubungan Kata',
    duration: '25 menit',
    lessons: [
      {
        id: 'pbm-4-1',
        title: 'Trik Menguasai Soal Padanan Kata & Analogi PPU',
        type: 'video',
        duration: '13 menit',
        videoUrl: 'https://www.youtube.com/embed/mtQSGQFFV3E',
        content: `<h2>Logika Hubungan Kata Penalaran Umum</h2><p>Membahas formula menyusun jembatan kalimat antara kata pertama dan kedua agar hubungan analogisnya presisi dan tidak terkecoh jawaban distraktor.</p>`,
      },
      {
        id: 'pbm-4-2',
        title: 'Pola Hubungan Analogi yang Sering Keluar',
        type: 'text',
        duration: '8 menit',
        content: `<h2>Kategori Hubungan Analogi</h2><ul><li><strong>Profesi dan Tempat Kerja:</strong> Guru : Sekolah = Dokter : Rumah Sakit.</li><li><strong>Alat dan Fungsi:</strong> Sendok : Makan = Pisau : Memotong.</li><li><strong>Bagian dan Keseluruhan:</strong> Sayap : Burung = Sirip : Ikan.</li><li><strong>Sebab dan Akibat:</strong> Gempa : Tsunami = Hujan : Banjir.</li></ul>`,
      },
      {
        id: 'pbm-4-3',
        title: '124 Bank Soal Arena Kuis PPU & PBM Lengkap dengan Kunci',
        type: 'text',
        duration: '15 menit',
        isPremium: true,
        content: `<h2>[EKSKLUSIF PREMIUM] Akses Seluruh Bank Soal Pembahasan Mendalam</h2><p>Seluruh soal dalam bank soal arena telah diverifikasi tim akademik OTWPTN untuk mencerminkan pola soal seleksi PTN terbaru.</p><p>Kamu bisa langsung mempraktikkan materi ini di menu <strong>Arena Latihan PPU/PBM</strong>.</p>`,
      },
    ],
  },
]

export const EJALUR_LIST: EJalur[] = [
  { id: 'ppkb', label: 'PPKB UI (Esai & Rapor)', stages: PPKB_STAGES },
  { id: 'snbp', label: 'SNBP (Jalur Prestasi Nasional)', stages: SNBP_STAGES },
  { id: 'pbm', label: 'PBM & PPU (Literasi & Bahasa)', stages: PBM_STAGES },
]
