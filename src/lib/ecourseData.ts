export interface ELesson {
  id: string
  title: string
  type: 'text' | 'video'
  duration: string
  content: string
  videoUrl?: string
  videoCredit?: string
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
  description?: string
  stages: EStage[]
}

// ─────────────────────────────────────────────────────────────
// 1. SNBP (Seleksi Nasional Berdasarkan Prestasi)
// ─────────────────────────────────────────────────────────────
const SNBP_STAGES: EStage[] = [
  {
    id: 1,
    title: 'Mengenal Seleksi SNBP & Kuota Eligible',
    duration: '35 menit',
    lessons: [
      {
        id: 'snbp-1-1',
        title: 'Aturan Resmi SNBP & Komponen Nilai Rapor',
        type: 'video',
        duration: '12 menit',
        videoUrl: 'https://www.youtube.com/embed/fG8Oye9oHz4',
        videoCredit: 'Kanal YouTube Edukasi PTN (Referensi Belajar Resmi SNPMB)',
        isPremium: false,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li><strong>Komponen 1 (Minimal 50%):</strong> Nilai rata-rata seluruh mata pelajaran dari semester 1 sampai 5.</li>
                <li><strong>Komponen 2 (Maksimal 50%):</strong> Nilai maksimal 2 mata pelajaran pendukung program studi ditambah sertifikat prestasi atau portofolio.</li>
                <li><strong>Faktor Eksternal Penentu:</strong> Indeks sekolah, rekam jejak alumni di PTN tujuan, dan akreditasi sekolah.</li>
                <li><strong>Aturan Anti-Bentrokan:</strong> Jangan memilih prodi yang sama dengan teman seangkatan yang memiliki nilai dan peringkat lebih tinggi.</li>
              </ol>
            </div>

            <h3 class="text-base font-black text-gray-950">1. Prinsip Utama Seleksi SNBP Nasional</h3>
            <p>Seleksi Nasional Berdasarkan Prestasi (SNBP) dirancang oleh SNPMB Balai Pengelolaan Pengujian Pendidikan untuk memberikan penghargaan kepada siswa yang menunjukkan prestasi akademik holistik selama 5 semester di bangku SMA/SMK/MA. Berbeda dengan sistem lama yang hanya menghitung mata pelajaran tertentu, SNBP menghargai seluruh mata pelajaran agar siswa tidak mengabaikan pelajaran lain.</p>

            <h3 class="text-base font-black text-gray-950">2. Dua Komponen Pembobotan Resmi</h3>
            <p>Penilaian SNBP dibagi menjadi dua pilar utama:</p>
            <ul class="list-disc list-inside text-xs space-y-1 text-gray-700">
              <li><strong>Komponen Nilai Rata-rata Rapor (Bobot min. 50%):</strong> Menghitung rata-rata dari seluruh nilai rapor semester 1 sampai 5. Tujuannya memastikan integritas akademik umum.</li>
              <li><strong>Komponen Minat & Bakat (Bobot maks. 50%):</strong> Dihitung dari 2 nilai mata pelajaran pendukung prodi yang dituju (sesuai Kepmenristekdikti), sertifikat prestasi akademik/non-akademik, atau portofolio khusus (untuk bidang seni dan olahraga).</li>
            </ul>

            <h3 class="text-base font-black text-gray-950">3. Kunci Sukses: Menjaga Tren Grafik Nilai</h3>
            <p>PTN sangat menyukai grafik nilai yang menunjukkan tren peningkatan (naik konsisten dari semester 1 ke semester 5) atau stabil tinggi di atas rata-rata angkatan. Penurunan nilai yang drastis di semester 4 atau 5 menjadi salah satu red flag yang sering menurunkan skor rasionalisasi.</p>
          </div>
        `,
      },
      {
        id: 'snbp-1-2',
        title: 'Strategi Penentuan Kuota Eligible & Trik Peringkat Bawah',
        type: 'text',
        duration: '15 menit',
        isPremium: true,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Kuota eligible ditentukan akreditasi: A (40%), B (25%), C (5% terbaik paralel).</li>
                <li>Siswa peringkat 30%-40% wajib menggunakan strategi "Blue Ocean PTN".</li>
                <li>Gunakan sertifikat kejuaraan nasional/provinsi untuk mendongkrak Komponen 2 hingga 30 poin.</li>
              </ol>
            </div>

            <h3 class="text-base font-black text-gray-950">Strategi Siswa Eligible Peringkat Menengah ke Bawah</h3>
            <p>Bagi kamu yang berada di kuota eligible namun bukan peringkat 10 besar, peluang lolos tetap sangat terbuka lebar jika menggunakan strategi rasionalisasi matang:</p>
            <ul class="list-disc list-inside text-xs space-y-2 text-gray-700">
              <li><strong>Hindari PTN Favorit Cluster 1 untuk Jurusan Terketat:</strong> Jika peringkatmu 25 dari 50 siswa eligible, bersaing di Kedokteran UI atau Teknik Informatika ITB memiliki risiko tinggi karena akan tersaring oleh sesama teman sekolah yang nilainya lebih tinggi.</li>
              <li><strong>Pilih PTN Baru atau PTN Luar Daerah:</strong> Banyak PTN berkualitas seperti ITERA, ITK, Universitas Syiah Kuala, atau Universitas Udayana yang memiliki daya tampung besar dengan rasio persaingan jauh lebih bersahabat.</li>
              <li><strong>Manfaatkan Sertifikat Linear:</strong> Sertifikat juara OSN/FLS2N/KTI dapat menjadi game-changer yang membedakan profilmu dari siswa lain yang hanya mengandalkan nilai rapor tanpa sertifikat.</li>
            </ul>
          </div>
        `,
      },
      {
        id: 'snbp-1-3',
        title: 'Matriks Pemetaan Nilai Rapor & Indeks Sekolah Nasional',
        type: 'text',
        duration: '18 menit',
        isPremium: true,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Indeks sekolah dihitung dari rekam jejak IPK alumni di PTN dan prestasi lomba sekolah.</li>
                <li>Sekolah yang rutin mengirim alumni ke prodi X di PTN Y memiliki kuota tidak tertulis.</li>
                <li>Gunakan Kalkulator Peluang OTWPTN untuk mencocokkan riwayat alumni sekolahmu.</li>
              </ol>
            </div>

            <h3 class="text-base font-black text-gray-950">Formula Rahasia Indeks Sekolah Versi Asesor</h3>
            <p>Masing-masing PTN memiliki sistem perangkingan internal terhadap sekolah asal pelamar:</p>
            <p><strong>Skor Sekolah = (Nilai Rata-rata UTBK Sekolah x 0.4) + (IPK Alumni di PTN x 0.3) + (Prestasi Nasional Sekolah x 0.2) + (Akreditasi x 0.1)</strong></p>
            <p class="text-xs text-gray-700">Jika sekolahmu memiliki riwayat alumni yang berprestasi di prodi tujuan, nilai rapormu yang berada di angka 86 bisa mengalahkan pelamar dari sekolah lain yang bernilai 90 namun belum memiliki rekam jejak alumni di kampus tersebut.</p>
          </div>
        `,
      },
    ],
  },
  {
    id: 2,
    title: 'Strategi Pemilihan Jurusan & PTN',
    duration: '40 menit',
    lessons: [
      {
        id: 'snbp-2-1',
        title: 'Menentukan Pilihan 1 & 2 Tanpa Bentrok Teman',
        type: 'video',
        duration: '14 menit',
        videoUrl: 'https://www.youtube.com/embed/7Yox72bv9CY',
        videoCredit: 'Kanal YouTube Edukasi Masuk Kampus (Bedah Aturan Pilihan SNBP)',
        isPremium: false,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Jika memilih 2 prodi, salah satu wajib berada di PTN satu provinsi dengan sekolah asal.</li>
                <li>Jika hanya memilih 1 prodi, kamu bebas memilih PTN di provinsi manapun di Indonesia.</li>
                <li>Pilihan 1 adalah Dream Major (Peluang Utama), Pilihan 2 adalah Safe Choice (Jaring Pengaman).</li>
                <li>Hampir 85% siswa yang diterima di SNBP lolos pada Pilihan 1.</li>
              </ol>
            </div>

            <h3 class="text-base font-black text-gray-950">1. Aturan Geografis Pemilihan PTN</h3>
            <p>Pastikan kamu tidak melanggar ketentuan domisili: Siswa SMA di Jawa Barat yang memilih 2 prodi harus menyertakan minimal 1 prodi di PTN Jawa Barat (UI, ITB, UNPAD, IPB, UPI, dll.). Jika melanggar aturan ini, sistem pendaftaran SNPMB akan menolak submission kamu.</p>

            <h3 class="text-base font-black text-gray-950">2. Cara Menghindari Persaingan Sesama Teman Sekolah</h3>
            <p>PTN memiliki kuota penerimaan maksimal per sekolah asal (biasanya 1 sampai 3 siswa per jurusan dari sekolah yang sama). Lakukan komunikasi terbuka dengan guru BK dan teman eligible untuk memetakan prodi pilihan agar tidak terjadi saling bentrok di jurusan yang sama.</p>
          </div>
        `,
      },
      {
        id: 'snbp-2-2',
        title: 'Rumus Rasionalisasi Peluang Lolos & Pembobotan Mapel Pendukung',
        type: 'text',
        duration: '15 menit',
        isPremium: true,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Mapel pendukung Kedokteran: Biologi & Kimia.</li>
                <li>Mapel pendukung Teknik / Komputer: Matematika Lanjut / Peminatan & Fisika.</li>
                <li>Mapel pendukung Manajemen / Akuntansi / Hukum: Matematika, Ekonomi, Sosiologi.</li>
              </ol>
            </div>
            <p class="text-xs text-gray-700 leading-relaxed">Evaluasi nilai mapel pendukungmu selama 5 semester. Jika nilai biologi dan kimiamu konsisten di atas 92, daya saingmu untuk rumpun kesehatan sangat kompetitif.</p>
          </div>
        `,
      },
      {
        id: 'snbp-2-3',
        title: 'Bedah Kuota Tampung & Daya Saing 50 Prodi Terketat SNBP',
        type: 'text',
        duration: '18 menit',
        isPremium: true,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Ketetatan di bawah 3% berarti hanya 3 orang diterima dari setiap 100 pendaftar.</li>
                <li>Ilmu Komunikasi, Manajemen, Farmasi, dan Informatika konsisten menempati top 10 terketat.</li>
                <li>Rasio aman untuk pilihan kedua adalah prodi dengan tingkat ketetatan di atas 10%.</li>
              </ol>
            </div>
            <p class="text-xs text-gray-700 leading-relaxed">Gunakan data historis daya tampung 3 tahun terakhir untuk menyusun strategi piramida pilihan prodi yang realistis dan terukur.</p>
          </div>
        `,
      },
    ],
  },
]

// ─────────────────────────────────────────────────────────────
// 2. JALUR ESSAY (Strategi Non-Teknis Seleksi Berbasis Esai)
// ─────────────────────────────────────────────────────────────
const JALUR_ESSAY_STAGES: EStage[] = [
  {
    id: 1,
    title: 'Peta Jalur Masuk PTN Berbasis Esai',
    duration: '35 menit',
    lessons: [
      {
        id: 'je-1-1',
        title: 'Karakteristik Seleksi Berbasis Esai vs Tes Tertulis',
        type: 'video',
        duration: '11 menit',
        videoUrl: 'https://www.youtube.com/embed/isgqGjGOZYE',
        videoCredit: 'Kanal YouTube Edukasi Jalur Mandiri & PPKB UI',
        isPremium: false,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Jalur esai menilai kepribadian, visi karir, dan kesiapan mental calon mahasiswa.</li>
                <li>Esai adalah alat negosiasi jika nilai rapormu berada di batas aman rata-rata.</li>
                <li>Contoh jalur utama: PPKB UI, SJP UI, International Undergraduate Program (IUP), Mandiri Prestasi.</li>
                <li>Asesor menghabiskan waktu rata-rata 60 sampai 90 detik membaca satu esai.</li>
              </ol>
            </div>

            <h3 class="text-base font-black text-gray-950">1. Mengapa Kampus Top Membuka Jalur Esai?</h3>
            <p>Universitas terkemuka seperti UI, UGM, dan ITB menyadari bahwa kecerdasan intelektual (angka rapor) tidak selalu mencerminkan determinasi, kepemimpinan, dan etika kerja seorang calon mahasiswa. Melalui esai motivasi personal, dewan penguji dapat melihat siapa dirimu di luar angka, motivasi terdalam memilih jurusan, dan bagaimana kamu akan berkontribusi kepada masyarakat setelah lulus.</p>

            <h3 class="text-base font-black text-gray-950">2. Keunggulan Strategis Jalur Esai</h3>
            <p>Jika nilai rapormu berada di rentang 85-88 (yang mungkin sulit bersaing murni di SNBP), esai yang autentik dan berbobot tinggi bisa menjadi faktor pengungkit yang membuat profilmu unggul di atas kandidat lain yang rapormu lebih tinggi tetapi esainya generik atau klise.</p>
          </div>
        `,
      },
      {
        id: 'je-1-2',
        title: 'Analisis Psikologi Asesor & Kriteria Personal Statement yang Dicari',
        type: 'text',
        duration: '14 menit',
        isPremium: true,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Asesor bosan membaca ribuan esai dengan kalimat pembuka klise yang sama.</li>
                <li>Yang dicari adalah: Autentisitas, Integritas, Kematangan Emosional, dan Visi Karir Spesifik.</li>
                <li>Hindari esai yang terdengar seperti daftar riwayat hidup berbentuk prosa.</li>
              </ol>
            </div>
            <p class="text-xs text-gray-700 leading-relaxed">Asesor mencari mahasiswa yang memiliki ketahanan mental (grit) dan tahu pasti mengapa prodi di kampus tersebut adalah satu-satunya wadah terbaik untuk mewujudkan cita-citanya.</p>
          </div>
        `,
      },
      {
        id: 'je-1-3',
        title: 'Blueprint Menyusun Roadmap Persiapan Esai 6 Bulan Sebelum Deadline',
        type: 'text',
        duration: '16 menit',
        isPremium: true,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Bulan 1-2: Brainstorming pengalaman kunci & eksplorasi kurikulum kampus tujuan.</li>
                <li>Bulan 3: Penulisan draft pertama tanpa self-censorship.</li>
                <li>Bulan 4: Revisi struktur konten dengan Essay AI Review OTWPTN.</li>
                <li>Bulan 5-6: Proofreading tata bahasa & finalisasi layout berkas PDF.</li>
              </ol>
            </div>
            <p class="text-xs text-gray-700 leading-relaxed">Esai terbaik tidak pernah ditulis semalam sebelum deadline. Membangun narasi yang berbobot memerlukan waktu inkubasi dan proses evaluasi berulang kali.</p>
          </div>
        `,
      },
    ],
  },
  {
    id: 2,
    title: 'Menemukan Visi Diri & Autentisitas Narasi',
    duration: '35 menit',
    lessons: [
      {
        id: 'je-2-1',
        title: 'Cara Menggali Motivasi Murni Tanpa Terjebak Klise',
        type: 'text',
        duration: '12 menit',
        isPremium: false,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Haram menulis klise: "Saya ingin membanggakan orang tua" atau "Sejak kecil saya hobi...".</li>
                <li>Ceritakan satu momen spesifik (turning point) yang memicu rasa ingin tahumu.</li>
                <li>Fokus pada aksi nyata yang sudah kamu lakukan, bukan sekadar angan-angan.</li>
              </ol>
            </div>

            <h3 class="text-base font-black text-gray-950">Menemukan The 'Why' dalam Hidupmu</h3>
            <p>Setiap orang memiliki cerita unik, tetapi banyak pelamar gagal menceritakannya karena terjebak pada generalisasi. Perhatikan perbandingan ini:</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                <p class="font-bold mb-1">❌ Contoh Klise yang Lemah:</p>
                <em>"Saya memilih Kedokteran karena sejak kecil saya terharu melihat orang sakit dan ingin membahagiakan orang tua."</em>
              </div>
              <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <p class="font-bold mb-1">✓ Contoh Autentik yang Kuat:</p>
                <em>"Saat mendampingi kakek berobat di puskesmas pelosok dan melihat antrean 6 jam untuk satu dokter umum, saya menyadari urgensi ketimpangan distribusi tenaga medis primer di Indonesia."</em>
              </div>
            </div>
          </div>
        `,
      },
      {
        id: 'je-2-2',
        title: 'Metode 5-Whys & STAR dalam Menemukan Nilai Hidup',
        type: 'text',
        duration: '15 menit',
        isPremium: true,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Tanyakan "Kenapa?" sebanyak 5 kali berturut-turut untuk menyaring motivasi terdalam.</li>
                <li>Formula STAR: Situation (Situasi), Task (Tantangan), Action (Aksi), Result (Hasil).</li>
                <li>Kuantifikasi dampak aksimu (angka, persentase, orang yang terbantu).</li>
              </ol>
            </div>
            <p class="text-xs text-gray-700 leading-relaxed">Gunakan framework STAR untuk membuktikan bahwa kamu adalah problem solver yang aktif dan berinisiatif tinggi.</p>
          </div>
        `,
      },
      {
        id: 'je-2-3',
        title: '5 Contoh Esai Profil Unik Mahasiswa Berprestasi Nasional',
        type: 'text',
        duration: '18 menit',
        isPremium: true,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Arsip 5 esai asli mahasiswa lolos PPKB UI Kedokteran, FEB, dan Fasilkom.</li>
                <li>Pelajari cara mengaitkan riset dosen kampus tujuan ke dalam paragraf visi.</li>
                <li>Perhatikan ritme kalimat pendek-panjang yang membuat esai sangat enak dibaca.</li>
              </ol>
            </div>
            <p class="text-xs text-gray-700 leading-relaxed">Bedah bagaimana alumni menyusun narasi kepemimpinan dan minat keilmuan mereka tanpa terdengar sombong.</p>
          </div>
        `,
      },
    ],
  },
]

// ─────────────────────────────────────────────────────────────
// 3. JALUR PRESTASI (Kurasi Prestasi & Portofolio Non-Tes)
// ─────────────────────────────────────────────────────────────
const JALUR_PRESTASI_STAGES: EStage[] = [
  {
    id: 1,
    title: 'Kurasi Prestasi & Portofolio Non-Tes',
    duration: '35 menit',
    lessons: [
      {
        id: 'jp-1-1',
        title: 'Hirarki Bobot Sertifikat di Mata Panitia Seleksi',
        type: 'video',
        duration: '10 menit',
        videoUrl: 'https://www.youtube.com/embed/FGfAmiLm6Ns',
        videoCredit: 'Kanal YouTube Panduan Seleksi Jalur Prestasi Mandiri PTN',
        isPremium: false,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li><strong>Tier 1 (Bobot Tertinggi):</strong> Puspresnas / BPTI / Kemendikbud (OSN, FLS2N, O2SN, KSM).</li>
                <li><strong>Tier 2:</strong> Kompetisi resmi berskala Nasional diselenggarakan oleh PTN Berbadan Hukum.</li>
                <li><strong>Tier 3:</strong> Kejuaraan tingkat Provinsi atau Kabupaten/Kota berjenjang resmi dinas.</li>
                <li>Linearitas bidang sertifikat dengan prodi yang dituju melipatgandakan poin hingga 2 kali lipat.</li>
              </ol>
            </div>

            <h3 class="text-base font-black text-gray-950">Aturan Kurasi Maksimal 3 Sertifikat Terbaik</h3>
            <p>Sebagian besar portal pendaftaran jalur prestasi membatasi unggahan maksimal 3 sertifikat. Memilih 3 sertifikat terbaik yang saling melengkapi adalah kunci memenangkan seleksi:</p>
            <ul class="list-disc list-inside text-xs space-y-1.5 text-gray-700">
              <li><strong>Prioritas 1:</strong> Sertifikat juara kompetisi linear dengan prodi pilihanmu (contoh: OSN Kebumian untuk Teknik Geologi).</li>
              <li><strong>Prioritas 2:</strong> Sertifikat kepemimpinan atau kejuaraan tingkat nasional lainnya (contoh: Parlemen Remaja, Ketua OSIS, Duta Bahasa).</li>
              <li><strong>Prioritas 3:</strong> Sertifikat pendukung yang membuktikan keaktifan non-akademik atau riset ilmiah (contoh: LKTI, Kejuaraan Olahraga/Seni).</li>
            </ul>
          </div>
        `,
      },
      {
        id: 'jp-1-2',
        title: 'Strategi Legalisasi, Verifikasi Puspresnas, & Portofolio Seni/Olahraga',
        type: 'text',
        duration: '15 menit',
        isPremium: true,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Sertifikat wajib tercatat di Sistem Informasi Manajemen Talenta (SIMT) Puspresnas jika ada.</li>
                <li>Portofolio seni rupa dan olahraga memerlukan video bukti performa dan surat pernyataan orisinalitas bermaterai.</li>
                <li>Pastikan nama siswa pada sertifikat cocok huruf per huruf dengan rapor dan data Dapodik.</li>
              </ol>
            </div>
            <p class="text-xs text-gray-700 leading-relaxed">Hindari sertifikat webinar atau kepanitiaan biasa untuk slot sertifikat prestasi utama karena bobot nilainya sangat rendah.</p>
          </div>
        `,
      },
      {
        id: 'jp-1-3',
        title: 'Trik Memaksimalkan Sertifikat Tingkat Kota/Kabupaten & Non-Lomba',
        type: 'text',
        duration: '14 menit',
        isPremium: true,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Kombinasikan sertifikat tingkat kota dengan surat keterangan prestasi peringkat paralel sekolah.</li>
                <li>Tuliskan deskripsi dampak kejuaraan pada esai untuk memperkuat nilai sertifikat.</li>
                <li>Pilih PTN yang secara eksplisit mencantumkan apresiasi sertifikat non-akademik di panduannya.</li>
              </ol>
            </div>
            <p class="text-xs text-gray-700 leading-relaxed">Jangan biarkan sertifikat tingkat kabupatenmu terbuang begitu saja jika tidak memiliki sertifikat nasional.</p>
          </div>
        `,
      },
    ],
  },
]

// ─────────────────────────────────────────────────────────────
// 4. BASIC ESSAY (PPU & PBM - Literasi Bahasa & Analisis Teks)
// ─────────────────────────────────────────────────────────────
const BASIC_ESSAY_STAGES: EStage[] = [
  {
    id: 1,
    title: 'PBM: Pondasi Kalimat Efektif & Struktur SPOK',
    duration: '35 menit',
    lessons: [
      {
        id: 'be-1-1',
        title: 'Fondasi Kalimat Efektif & Menemukan Subjek yang Hilang',
        type: 'video',
        duration: '14 menit',
        videoUrl: 'https://www.youtube.com/embed/H7V70J12mZI',
        videoCredit: 'Kanal YouTube Ruangguru (Materi Resmi Pemahaman Bacaan & Menulis UTBK)',
        isPremium: false,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Kalimat efektif wajib memiliki Subjek (S) dan Predikat (P) yang jelas.</li>
                <li>Kata depan seperti 'Bagi', 'Untuk', 'Menurut', 'Dalam' di awal kalimat dapat menghilangkan Subjek.</li>
                <li>Hindari kalimat ambigu dan kalimat berkepala ganda (anak kalimat bertumpuk tanpa induk).</li>
                <li>Paralelisme imbuhan wajib seragam dalam satu konstruksi kalimat majemuk.</li>
              </ol>
            </div>

            <h3 class="text-base font-black text-gray-950">1. Prinsip Utama Kalimat Efektif</h3>
            <p>Kalimat efektif adalah kalimat yang mampu menyampaikan gagasan penulis kepada pembaca secara tepat, ringkas, dan tidak menimbulkan multitafsir. Baik dalam ujian PBM UTBK maupun penulisan esai seleksi PTN, kalimat efektif mencerminkan ketajaman logika berpikir calon mahasiswa.</p>

            <h3 class="text-base font-black text-gray-950">2. Jebakan Subjek Buntung / Cacat</h3>
            <div class="space-y-2 text-xs">
              <p><strong>Kasus 1: Preposisi yang Menenggelamkan Subjek</strong></p>
              <div class="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <p class="text-rose-600 font-bold">Salah: <em>"Dalam rapat koordinasi pimpinan itu memutuskan lima poin evaluasi."</em> (Keterangan + Predikat + Objek, Subjek TIDAK ADA).</p>
                <p class="text-emerald-700 font-bold mt-1">Benar: <em>"Rapat koordinasi pimpinan itu memutuskan lima poin evaluasi."</em> ATAU <em>"Dalam rapat koordinasi pimpinan itu, rektor memutuskan lima poin evaluasi."</em></p>
              </div>

              <p class="mt-2"><strong>Kasus 2: Konjungsi Anak Kalimat Tanpa Induk Kalimat</strong></p>
              <div class="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <p class="text-rose-600 font-bold">Salah: <em>"Meskipun hasil penelitian tersebut sudah terbukti valid."</em> (Klausa anak yang belum selesai).</p>
                <p class="text-emerald-700 font-bold mt-1">Benar: <em>"Meskipun hasil penelitian tersebut sudah terbukti valid, penerapannya masih menunggu uji klinis lanjutan."</em></p>
              </div>
            </div>
          </div>
        `,
      },
      {
        id: 'be-1-2',
        title: 'Kaidah PUEBI Resmi: Kata Depan Tempat, Huruf Kapital, & Kata Serapan',
        type: 'text',
        duration: '16 menit',
        isPremium: true,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Kata depan 'di' dan 'ke' untuk arah/tempat ditulis terpisah (di sekolah, ke kampus).</li>
                <li>Imbuhan pasif 'di-' melekat pada kata kerja tanpa spasi (dilakukan, ditulis).</li>
                <li>Huruf kapital nama geografi hanya jika diikuti nama diri (Pulau Jawa vs berenang di pulau).</li>
              </ol>
            </div>
            <p class="text-xs text-gray-700 leading-relaxed">Penguasaan tanda baca (koma sebelum konjungsi pertentangan, titik dua, tanda hubung) sangat menentukan kerapian naskah esaimu.</p>
          </div>
        `,
      },
      {
        id: 'be-1-3',
        title: 'Cheatsheet 200 Kata Baku KBBI yang Sering Menjebak',
        type: 'text',
        duration: '18 menit',
        isPremium: true,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Baku: praktik, aktivitas, kualitas, analisis, sistem, objek, konkret.</li>
                <li>Tidak baku: praktek, aktifitas, kwalitas, analisa, sistim, obyek, konkrit.</li>
                <li>Kata serapan berakhiran -tion diserap menjadi -si (organisasi, komunikasi).</li>
              </ol>
            </div>
            <p class="text-xs text-gray-700 leading-relaxed">Tabel lengkap kata baku KBBI edisi mutakhir untuk mempermudah pengerjaan latihan di Arena Kuis.</p>
          </div>
        `,
      },
    ],
  },
  {
    id: 2,
    title: 'PPU: Penalaran Analogi & Pemahaman Teks',
    duration: '35 menit',
    lessons: [
      {
        id: 'be-2-1',
        title: 'Trik Cepat Menjawab Soal Padanan Kata & Analogi PPU',
        type: 'video',
        duration: '13 menit',
        videoUrl: 'https://www.youtube.com/embed/mtQSGQFFV3E',
        videoCredit: 'Kanal YouTube GIA Academy (Trik Lolos Soal Analogi & PPU UTBK)',
        isPremium: false,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Buat kalimat penghubung (jembatan logika) yang sama persis antara kata A dan B.</li>
                <li>Urutan dan fungsi gramatikal tidak boleh terbalik.</li>
                <li>Kategori hubungan: Profesi-Tempat, Alat-Fungsi, Sebab-Akibat, Bagian-Keseluruhan.</li>
              </ol>
            </div>

            <h3 class="text-base font-black text-gray-950">Rumus Jembatan Kalimat (The Bridge Technique)</h3>
            <p class="text-xs text-gray-700">Untuk memecahkan soal analogi <em>Guru : Sekolah = Petani : ?</em>:</p>
            <div class="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
              <p>Jembatan kalimat: <strong>Seorang [GURU] bekerja di [SEKOLAH].</strong></p>
              <p>Maka pasangan analogisnya: <strong>Seorang [PETANI] bekerja di [SAWAH].</strong></p>
              <p class="text-gray-500 mt-1">Jawaban seperti 'Cangkul' salah karena itu alat, bukan tempat kerja.</p>
            </div>
          </div>
        `,
      },
      {
        id: 'be-2-2',
        title: 'Menemukan Gagasan Utama, Inti Kalimat, & Simpulan Teks',
        type: 'text',
        duration: '15 menit',
        isPremium: true,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Gagasan utama paragraf deduktif ada di kalimat pertama.</li>
                <li>Gagasan utama paragraf induktif ada di kalimat akhir dengan konjungsi simpulan.</li>
                <li>Inti kalimat didapat dengan membuang seluruh klausa perluasan dan preposisi tambahan.</li>
              </ol>
            </div>
            <p class="text-xs text-gray-700 leading-relaxed">Latih kemampuan skimming dan scanning teks ilmiah berbobot 300-500 kata dalam waktu 45 detik.</p>
          </div>
        `,
      },
      {
        id: 'be-2-3',
        title: 'Bank Soal Prediksi Hot PPU & PBM Lengkap Pembahasan',
        type: 'text',
        duration: '18 menit',
        isPremium: true,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Kumpulan 124 soal hot PPU & PBM dari bank soal OTWPTN.</li>
                <li>Pembahasan step-by-step untuk setiap opsi jebakan.</li>
                <li>Latihan terintegrasi langsung dengan menu Arena Latihan.</li>
              </ol>
            </div>
            <p class="text-xs text-gray-700 leading-relaxed">Kuasai pola soal yang paling sering keluar pada UTBK dan ujian mandiri PTN 3 tahun terakhir.</p>
          </div>
        `,
      },
    ],
  },
]

// ─────────────────────────────────────────────────────────────
// 5. ESSAY (Teknis Penulisan & Kurasi Naskah)
// ─────────────────────────────────────────────────────────────
const ESSAY_TEKNIS_STAGES: EStage[] = [
  {
    id: 1,
    title: 'Teknis Struktur Penulisan Esai',
    duration: '35 menit',
    lessons: [
      {
        id: 'et-1-1',
        title: 'Formula 3 Babak: Hook, Eksplorasi, dan Visi Masa Depan',
        type: 'video',
        duration: '12 menit',
        videoUrl: 'https://www.youtube.com/embed/aRHrCCbzxes',
        videoCredit: 'Kanal YouTube Edukasi Penulisan Esai Lolos Seleksi PTN & Beasiswa',
        isPremium: false,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li><strong>Babak 1 (Hook Pembuka):</strong> Tangkap perhatian di 2 kalimat pertama dengan konflik atau momen nyata.</li>
                <li><strong>Babak 2 (Eksplorasi Akademik):</strong> Buktikan dedikasi belajarmu dengan proyek, lomba, atau aksi konkret.</li>
                <li><strong>Babak 3 (Visi & Solusi):</strong> Tunjukkan bagaimana kuliah di kampus tujuan akan mentransformasikan potensimu menjadi kontribusi nyata.</li>
              </ol>
            </div>

            <h3 class="text-base font-black text-gray-950">Struktur Esai 500-800 Kata yang Terbukti Efektif</h3>
            <p class="text-xs text-gray-700">Gunakan rasio panjang paragraf yang seimbang:</p>
            <ul class="list-disc list-inside text-xs space-y-1.5 text-gray-700">
              <li><strong>Paragraf 1 (15%):</strong> Kalimat pembuka magnetik, pengenalan diri otentik, dan benang merah motivasi.</li>
              <li><strong>Paragraf 2-3 (55%):</strong> Rekam jejak pembelajaran mandiri, mengatasi kendala nyata dengan metode STAR, dan keterkaitan dengan mata kuliah spesifik.</li>
              <li><strong>Paragraf 4 (30%):</strong> Target kontribusi pasca-kampus dan alasan kuat mengapa universitas ini adalah katalis terbaikmu.</li>
            </ul>
          </div>
        `,
      },
      {
        id: 'et-1-2',
        title: 'Seni Menulis Paragraf Pembuka yang Menghipnotis Reviewer',
        type: 'text',
        duration: '15 menit',
        isPremium: true,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Mulai dengan adegan visual atau dialog internal yang relevan.</li>
                <li>Jangan memperkenalkan nama di kalimat pertama (nama sudah ada di form identitas!).</li>
                <li>Ciptakan rasa penasaran intelektual yang memaksa reviewer membaca paragraf selanjutnya.</li>
              </ol>
            </div>
            <p class="text-xs text-gray-700 leading-relaxed">Pelajari teknik in medias res (masuk ke tengah cerita) untuk membuat kalimat pertamamu berkesan mendalam.</p>
          </div>
        `,
      },
      {
        id: 'et-1-3',
        title: 'Bedah Kalimat Demi Kalimat: Mentranslasikan Pengalaman Menjadi Nilai Jual',
        type: 'text',
        duration: '18 menit',
        isPremium: true,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Ubah kata kerja pasif menjadi kata kerja aksi aktif (menginisiasi, merancang, memimpin).</li>
                <li>Hubungkan pengalaman non-akademik (olahraga/seni) dengan determinasi akademik.</li>
                <li>Gunakan Essay AI Review OTWPTN untuk mendapatkan masukan kalimat per kalimat.</li>
              </ol>
            </div>
            <p class="text-xs text-gray-700 leading-relaxed">Panduan revisi mikro naskah esai agar setiap kalimat memiliki fungsi esensial dan tidak ada ruang kosong sia-sia.</p>
          </div>
        `,
      },
    ],
  },
  {
    id: 2,
    title: 'Revisi, Diksi Akademik & Proofreading',
    duration: '35 menit',
    lessons: [
      {
        id: 'et-2-1',
        title: 'Checklist Proofreading Mandiri & Eliminasi Kata Mubazir',
        type: 'text',
        duration: '12 menit',
        isPremium: false,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Baca naskahmu dengan suara keras (read aloud) untuk mendeteksi kalimat yang tersendat.</li>
                <li>Cari dan hapus kata mubazir: 'sangat sekali', 'agar supaya', 'adalah merupakan'.</li>
                <li>Pastikan ejaan nama universitas dan nama program studi tertulis dengan akurat 100%.</li>
              </ol>
            </div>

            <h3 class="text-base font-black text-gray-950">Checklist Final Sebelum Unggah Berkas</h3>
            <ul class="list-disc list-inside text-xs space-y-1.5 text-gray-700">
              <li>☐ Jumlah kata berada dalam batas yang diizinkan (misal 500-750 kata).</li>
              <li>☐ Font dan ukuran formal (Times New Roman / Arial 11-12 pt, spasi 1.5).</li>
              <li>☐ Disimpan dalam format PDF berukuran di bawah 2 MB dengan nama file formal: <em>Esai_NamaLengkap_ProdiTujuan.pdf</em>.</li>
              <li>☐ Sudah diuji melalui instrumen Essay AI Review OTWPTN dengan skor di atas 80.</li>
            </ul>
          </div>
        `,
      },
      {
        id: 'et-2-2',
        title: 'Teknik Diksi Akademik & Variasi Transisi Antarparagraf',
        type: 'text',
        duration: '15 menit',
        isPremium: true,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Gunakan kata transisi: 'Meskipun demikian', 'Lebih jauh lagi', 'Konsekuensinya'.</li>
                <li>Hindari kata informal seperti 'banget', 'bikin', 'gimana', 'nggak'.</li>
                <li>Pertahankan konsistensi sudut pandang orang pertama ('saya').</li>
              </ol>
            </div>
            <p class="text-xs text-gray-700 leading-relaxed">Tingkatkan kualitas gaya bahasamu dari tulisan anak SMA biasa menjadi naskah bernuansa intelektual calon sarjana.</p>
          </div>
        `,
      },
      {
        id: 'et-2-3',
        title: 'Rubrik Penilaian Verifikator UI/UGM & Red Flags yang Menggugurkan Esai',
        type: 'text',
        duration: '18 menit',
        isPremium: true,
        content: `
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 class="font-black text-amber-950 flex items-center gap-1.5 text-sm mb-2">
                📌 Ringkasan Cepat
              </h4>
              <ol class="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Red Flag 1: Plagiarisme atau naskah hasil AI tanpa personalisasi pengalaman nyata.</li>
                <li>Red Flag 2: Menyebutkan nama PTN lain (salah copy-paste template!).</li>
                <li>Red Flag 3: Terlalu banyak mengeluh tanpa menyertakan resolusi dan aksi nyata.</li>
              </ol>
            </div>
            <p class="text-xs text-gray-700 leading-relaxed">Panduan lengkap rubrik penilaian verifikator resmi agar naskahmu mendapatkan skor maksimal.</p>
          </div>
        `,
      },
    ],
  },
]

export const EJALUR_LIST: EJalur[] = [
  { id: 'snbp', label: 'SNBP (Jalur Prestasi Nasional)', stages: SNBP_STAGES },
  { id: 'jalur-essay', label: 'Jalur Essay (Strategi Non-Teknis)', stages: JALUR_ESSAY_STAGES },
  { id: 'jalur-prestasi', label: 'Jalur Prestasi & Portofolio', stages: JALUR_PRESTASI_STAGES },
  { id: 'basic-essay', label: 'Basic Essay (PPU & PBM)', stages: BASIC_ESSAY_STAGES },
  { id: 'essay', label: 'Essay (Teknis Penulisan & Kurasi)', stages: ESSAY_TEKNIS_STAGES },
]
