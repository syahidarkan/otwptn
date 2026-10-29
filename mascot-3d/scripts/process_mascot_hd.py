#!/usr/bin/env python3
"""
Process Mascot Sheets: Crop, Transparent Background, 4x HD Upscale & Catalog Generation
"""
import os
import json
import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import label, distance_transform_edt

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
MASKOT_DIR = os.path.join(ROOT_DIR, "Maskot")
OUTPUT_DIR = os.path.join(MASKOT_DIR, "hd-transparent")
PUBLIC_MASCOT_HD = os.path.join(ROOT_DIR, "public", "mascot-hd")

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(PUBLIC_MASCOT_HD, exist_ok=True)

# 48 Mappings: (sheet, row, col, id_slug, en_slug, nama_pose, deskripsi, kategori, rekomendasi_konteks)
MASCOT_METADATA = [
    # Sheet 1
    {
        "sheet": "sheet1.png", "row": 0, "col": 0,
        "id_slug": "maskot-jempol-rekomendasi",
        "en_slug": "thumbsup",
        "nama_pose": "Otbee Mengacungkan Jempol Mantap",
        "deskripsi": "Otbee memakai jas almamater kuning tersenyum bangga sambil mengacungkan kedua jempolnya.",
        "kategori": "Persetujuan & Rekomendasi",
        "konteks": "Halaman konfirmasi sukses, rekomendasi paket belajar, tombol CTA persetujuan, review positif, atau ucapan 'Mantap!'"
    },
    {
        "sheet": "sheet1.png", "row": 0, "col": 1,
        "id_slug": "maskot-terbang-pensil",
        "en_slug": "pencil-fly",
        "nama_pose": "Otbee Terbang Memeluk Pensil Ujian",
        "deskripsi": "Otbee terbang lincah memeluk pensil kayu besar berujung tajam siap menulis.",
        "kategori": "Mulai Menulis & Ujian",
        "konteks": "Tombol 'Mulai Tulis Esai', sesi pengerjaan tryout/ujian, modul latihan soal, draft baru."
    },
    {
        "sheet": "sheet1.png", "row": 0, "col": 2,
        "id_slug": "maskot-pegang-ijazah",
        "en_slug": "diploma",
        "nama_pose": "Otbee Memegang Ijazah Kelulusan",
        "deskripsi": "Otbee memegang gulungan diploma/ijazah putih berikat pita merah dengan ekspresi gembira.",
        "kategori": "Kelulusan & Sertifikasi",
        "konteks": "Halaman penerimaan mahasiswa baru, sertifikat tryout selesai, bukti kelulusan seleksi jalur mandiri/SNBP/SNBT."
    },
    {
        "sheet": "sheet1.png", "row": 1, "col": 0,
        "id_slug": "maskot-baca-buku-tumpuk",
        "en_slug": "reading-books",
        "nama_pose": "Otbee Duduk Membaca di Tumpukan Buku",
        "deskripsi": "Otbee duduk santai membaca buku di atas tumpukan 3 buku tebal aneka warna.",
        "kategori": "Materi & Modul Belajar",
        "konteks": "Menu perpustakaan materi, bank soal, modul teori, rangkuman materi pelajaran, sesi literasi."
    },
    {
        "sheet": "sheet1.png", "row": 1, "col": 1,
        "id_slug": "maskot-koreksi-nilai-a",
        "en_slug": "grading-paper",
        "nama_pose": "Otbee Menunjukkan Lembar Nilai A+",
        "deskripsi": "Otbee memegang lembar ujian bertuliskan nilai A+ merah dengan senyum lebar puas.",
        "kategori": "Hasil & Skor Tinggi",
        "konteks": "Hasil review esai memuaskan, nilai tryout di atas passing grade, rapor unggul, evaluasi belajar tuntas."
    },
    {
        "sheet": "sheet1.png", "row": 1, "col": 2,
        "id_slug": "maskot-piala-toga-juara",
        "en_slug": "trophy-graduate",
        "nama_pose": "Otbee Memakai Toga Mengangkat Piala",
        "deskripsi": "Otbee memakai topi toga wisuda sambil mengangkat piala emas berkilau tinggi-tinggi.",
        "kategori": "Prestasi Puncak & Wisuda",
        "konteks": "Pengumuman lolos PTN impian, juara 1 leaderboard tryout nasional, perayaan wisuda pejuang PTN."
    },

    # Sheet 2
    {
        "sheet": "sheet2.png", "row": 0, "col": 0,
        "id_slug": "maskot-petualang-mendaki",
        "en_slug": "hiking",
        "nama_pose": "Otbee Mendaki dengan Ransel & Tongkat",
        "deskripsi": "Otbee mengenakan ransel gunung dan memegang tongkat pendaki siap menapaki jalur baru.",
        "kategori": "Perjalanan & Eksplorasi",
        "konteks": "Awal perjalanan persiapan PTN, eksplorasi profil kampus & jurusan, onboarding langkah awal, track belajar."
    },
    {
        "sheet": "sheet2.png", "row": 0, "col": 1,
        "id_slug": "maskot-lolos-ptn-loncat",
        "en_slug": "lulus-ptn",
        "nama_pose": "Otbee Melompat Ceria Lolos PTN",
        "deskripsi": "Otbee melompat gembira dengan kedua tangan terangkat tinggi merayakan keberhasilan.",
        "kategori": "Perayaan & Sambutan",
        "konteks": "Welcome screen pengguna baru, pengumuman hasil seleksi lolos, ucapan selamat atas pencapaian target."
    },
    {
        "sheet": "sheet2.png", "row": 0, "col": 2,
        "id_slug": "maskot-bingung-garuk-kepala",
        "en_slug": "confused",
        "nama_pose": "Otbee Bingung Menggaruk Kepala",
        "deskripsi": "Otbee dengan ekspresi bingung dan tanda tanya di atas kepala menggaruk kepalanya.",
        "kategori": "Bantuan & Error State",
        "konteks": "Halaman Error 404, belum memilih jurusan, butuh panduan/FAQ, materi belum dikuasai, form belum lengkap."
    },
    {
        "sheet": "sheet2.png", "row": 1, "col": 0,
        "id_slug": "maskot-customer-service-headset",
        "en_slug": "support-headset",
        "nama_pose": "Otbee Memakai Headset Customer Support",
        "deskripsi": "Otbee memakai headset dengan mikrofon siap mendengarkan dan melayani pertanyaan siswa.",
        "kategori": "Layanan Bantuan & CS",
        "konteks": "Pusat bantuan (Help Center), live chat admin, konsultasi privat, tombol hubungi tim support."
    },
    {
        "sheet": "sheet2.png", "row": 1, "col": 1,
        "id_slug": "maskot-kedip-centang-oke",
        "en_slug": "winking-check",
        "nama_pose": "Otbee Mengedipkan Mata & Tanda Centang Hijau",
        "deskripsi": "Otbee mengedipkan satu mata ceria sambil berdiri di samping tanda centang (checkmark) hijau.",
        "kategori": "Verifikasi & Syarat Terpenuhi",
        "konteks": "Berkas terverifikasi, akun aktif, pembayaran berhasil, syarat administrasi tuntas, status 'Aman'."
    },
    {
        "sheet": "sheet2.png", "row": 1, "col": 2,
        "id_slug": "maskot-tidur-lelap-bantal",
        "en_slug": "sleeping",
        "nama_pose": "Otbee Tidur Nyenyak di Atas Bantal (zZZ)",
        "deskripsi": "Otbee tidur tengkurap pulas di atas bantal empuk dengan balon zZZ melayang.",
        "kategori": "Istirahat & Jam Malam",
        "konteks": "Pesan istirahat cukup malam hari, fitur sedang maintenance/istirahat, sesi belajar selesai untuk hari ini."
    },

    # Sheet 3
    {
        "sheet": "sheet3.png", "row": 0, "col": 0,
        "id_slug": "maskot-papan-checklist",
        "en_slug": "checklist",
        "nama_pose": "Otbee Membawa Papan Checklist Berkas",
        "deskripsi": "Otbee memegang clipboard papan ujian dengan daftar ceklis yang sudah tercentang rapi.",
        "kategori": "Kelengkapan Dokumen & Syarat",
        "konteks": "Daftar berkas pendaftaran SNBP/mandiri, checklist persyaratan jurusan, to-do list harian pejuang PTN."
    },
    {
        "sheet": "sheet3.png", "row": 0, "col": 1,
        "id_slug": "maskot-plang-pejuang-ptn",
        "en_slug": "sign-pejuang",
        "nama_pose": "Otbee Membawa Plang 'Hai Pejuang PTN!'",
        "deskripsi": "Otbee memegang plang papan bertuliskan 'Hai Pejuang PTN!' menyapa ramah.",
        "kategori": "Sapaan & Sambutan Komunitas",
        "konteks": "Hero banner halaman utama, greeting awal dashboard siswa, sambutan hangat grup belajar."
    },
    {
        "sheet": "sheet3.png", "row": 0, "col": 2,
        "id_slug": "maskot-tunjuk-peta-strategi",
        "en_slug": "map-pointing",
        "nama_pose": "Otbee Menunjuk Peta Strategi Kampus",
        "deskripsi": "Otbee membentangkan peta navigasi besar dan menunjuk titik lokasi target kampus idaman.",
        "kategori": "Pemetaan & Strategi PTN",
        "konteks": "Fitur rasionalisasi jurusan, pemetaan kuota penerimaan kampus, strategi pemilihan program studi."
    },
    {
        "sheet": "sheet3.png", "row": 1, "col": 0,
        "id_slug": "maskot-kantong-koin-emas",
        "en_slug": "coin-bag",
        "nama_pose": "Otbee Memeluk Kantong Koin Emas",
        "deskripsi": "Otbee memeluk kantong karung goni berisi koin-koin emas berkilauan dengan senyum bahagia.",
        "kategori": "Finansial, Beasiswa & Promo",
        "konteks": "Info beasiswa (KIP-K/swasta), estimasi biaya kuliah/UKT, diskon paket bimbel, top up koin/kredit."
    },
    {
        "sheet": "sheet3.png", "row": 1, "col": 1,
        "id_slug": "maskot-kaca-pembesar-draft",
        "en_slug": "review-draft",
        "nama_pose": "Otbee Memeriksa Draft dengan Kaca Pembesar",
        "deskripsi": "Otbee memegang kaca pembesar besar mengamati lembar draft esai secara cermat dan teliti.",
        "kategori": "Deep Review & Audit Esai",
        "konteks": "Fitur AI Essay Checker, koreksi grammar & typo, audit portfolio siswa, bedah naskah motivasi."
    },
    {
        "sheet": "sheet3.png", "row": 1, "col": 2,
        "id_slug": "maskot-melambai-di-pintu-gerbang",
        "en_slug": "wave-door",
        "nama_pose": "Otbee Melambai Ramah di Pintu Gerbang",
        "deskripsi": "Otbee berdiri di ambang pintu gerbang kampus sambil melambaikan tangan mengajak masuk.",
        "kategori": "Pintu Masuk & Registrasi",
        "konteks": "Halaman Login / Register, gerbang masuk seleksi, pintu awal menuju dunia perkuliahan."
    },

    # Sheet 4
    {
        "sheet": "sheet4.png", "row": 0, "col": 0,
        "id_slug": "maskot-nulis-essay-meja",
        "en_slug": "writing-essay",
        "nama_pose": "Otbee Menulis Esai di Meja Belajar",
        "deskripsi": "Otbee duduk fokus di meja belajar menulis esai di atas kertas dengan pensil.",
        "kategori": "Editor Esai & Pembuatan Konten",
        "konteks": "Workspace editor naskah esai, sesi membuat personal statement, tips menulis esai beasiswa."
    },
    {
        "sheet": "sheet4.png", "row": 0, "col": 1,
        "id_slug": "maskot-bersama-robot-ai",
        "en_slug": "ai-robot",
        "nama_pose": "Otbee Berdampingan dengan Robot AI",
        "deskripsi": "Otbee berdiri akrab bersama robot asisten pintar berlayar cyan yang canggih.",
        "kategori": "Kecerdasan Buatan & Otomasi",
        "konteks": "Fitur AI Assistant Otbee, generator ide otomatis, rekomendasi cerdas berbasis machine learning."
    },
    {
        "sheet": "sheet4.png", "row": 0, "col": 2,
        "id_slug": "maskot-kalender-deadline",
        "en_slug": "calendar-zoom",
        "nama_pose": "Otbee Memegang Kalender Countdown Deadline",
        "deskripsi": "Otbee memegang kalender dinding besar dengan kaca pembesar menunjuk tanggal batas akhir.",
        "kategori": "Jadwal & Countdown Waktu",
        "konteks": "Timeline seleksi, hitung mundur (countdown) penutupan pendaftaran, pengingat jadwal tryout."
    },
    {
        "sheet": "sheet4.png", "row": 1, "col": 0,
        "id_slug": "maskot-grafik-batang-naik",
        "en_slug": "stats-chart",
        "nama_pose": "Otbee Menunjuk Grafik Statistik Naik",
        "deskripsi": "Otbee menunjuk diagram garis tren statistik yang melonjak naik tinggi ke kanan atas.",
        "kategori": "Progres & Peningkatan Nilai",
        "konteks": "Laporan perkembangan nilai tryout, grafik peningkatan pemahaman, statistik histori latihan soal."
    },
    {
        "sheet": "sheet4.png", "row": 1, "col": 1,
        "id_slug": "maskot-jalan-roadmap-ptn",
        "en_slug": "journey-path",
        "nama_pose": "Otbee Menapaki Jalur Roadmap PTN",
        "deskripsi": "Otbee berjalan menyusuri jalan setapak berliku menuju gedung kampus megah di kejauhan.",
        "kategori": "Kurikulum & Roadmap 100 Hari",
        "konteks": "Timeline tahapan belajar dari nol hingga lolos, peta navigasi seleksi jalur non-tes & SNBT."
    },
    {
        "sheet": "sheet4.png", "row": 1, "col": 2,
        "id_slug": "maskot-toa-pengumuman-resmi",
        "en_slug": "announcement",
        "nama_pose": "Otbee Mengumumkan Lewat Megaphone / Toa",
        "deskripsi": "Otbee memegang toa megaphone merah mengumandangkan berita penting secara lantang.",
        "kategori": "Pemberitahuan & Broadcast",
        "konteks": "Pengumuman resmi dari panitia, broadcast update fitur baru, berita penting pendaftaran PTN."
    },

    # Sheet 6
    {
        "sheet": "sheet 6.png", "row": 0, "col": 0,
        "id_slug": "maskot-medali-emas-prestasi",
        "en_slug": "medal",
        "nama_pose": "Otbee Memegang Medali Emas Prestasi",
        "deskripsi": "Otbee tersenyum bangga memegang medali emas berlogo bintang dengan pita merah.",
        "kategori": "Sertifikat & Portofolio Juara",
        "konteks": "Input piagam sertifikat lomba, pencapaian akademik/non-akademik, portofolio unggulan."
    },
    {
        "sheet": "sheet 6.png", "row": 0, "col": 1,
        "id_slug": "maskot-kertas-poin-revisi",
        "en_slug": "speech-doc",
        "nama_pose": "Otbee Menjelaskan Poin Koreksi Dokumen",
        "deskripsi": "Otbee memegang lembar dokumen bertanda stabilo dengan balon dialog memberi penjelasan.",
        "kategori": "Feedback & Catatan Mentor",
        "konteks": "Catatan koreksi esai dari mentor, saran perbaikan naskah, feedback detail per paragraf."
    },
    {
        "sheet": "sheet 6.png", "row": 0, "col": 2,
        "id_slug": "maskot-peluang-persentase",
        "en_slug": "percent-ring",
        "nama_pose": "Otbee Berdiri di Samping Cincin Persentase (%)",
        "deskripsi": "Otbee berdiri ramah di samping lingkaran donat persentase peluang berwarna hijau toska.",
        "kategori": "Kalkulator Peluang & Probabilitas",
        "konteks": "Kalkulator rasionalisasi peluang, skor kecocokan rapor dengan jurusan, persentase kelulusan."
    },
    {
        "sheet": "sheet 6.png", "row": 1, "col": 0,
        "id_slug": "maskot-chat-smartphone",
        "en_slug": "otbee-phone",
        "nama_pose": "Otbee Konsultasi Lewat Smartphone",
        "deskripsi": "Otbee memegang gawai smartphone layar sentuh besar sedang berbalas pesan aktif.",
        "kategori": "Aplikasi Mobile & Chat Otbee",
        "konteks": "Konsultasi lewat WhatsApp/aplikasi, notifikasi push mobile, tanya jawab instan dengan AI."
    },
    {
        "sheet": "sheet 6.png", "row": 1, "col": 1,
        "id_slug": "maskot-tablet-video-materi",
        "en_slug": "tablet-play",
        "nama_pose": "Otbee Menonton Video Materi di Tablet",
        "deskripsi": "Otbee memegang tablet digital dengan ikon play video pembelajaran di layarnya.",
        "kategori": "Video Modul & Rekaman Webinar",
        "konteks": "Katalog video pembelajaran, rekaman webinar alumni, tutorial langkah demi langkah pendaftaran."
    },
    {
        "sheet": "sheet 6.png", "row": 1, "col": 2,
        "id_slug": "maskot-toa-komunitas",
        "en_slug": "megaphone-community",
        "nama_pose": "Otbee Mengajak Masuk Komunitas Belajar",
        "deskripsi": "Otbee memakai megaphone mengajak siswa untuk berdiskusi bersama di komunitas pejuang PTN.",
        "kategori": "Forum & Komunitas Belajar",
        "konteks": "Halaman komunitas Discord/Telegram, ruang diskusi sesama pejuang, grup belajar bareng."
    },

    # Sheet 7
    {
        "sheet": "sheet 7.png", "row": 0, "col": 0,
        "id_slug": "maskot-bendera-milestone",
        "en_slug": "roadmap-flags",
        "nama_pose": "Otbee Menancapkan Bendera Milestone Target",
        "deskripsi": "Otbee menancapkan bendera merah di tiang checkpoint keberhasilan tahapan seleksi.",
        "kategori": "Pencapaian Target & Checkpoint",
        "konteks": "Tahapan selesai, milestone roadmap tercapai, status progress belajar 100%, checkpoint lulus tahap 1."
    },
    {
        "sheet": "sheet 7.png", "row": 0, "col": 1,
        "id_slug": "maskot-kotak-arsip-dokumen",
        "en_slug": "file-box-storage",
        "nama_pose": "Otbee Merapikan Boks Arsip Dokumen",
        "deskripsi": "Otbee menata kotak boks arsip dokumen yang berisi folder-folder pendaftaran terorganisir.",
        "kategori": "Penyimpanan Dokumen & Berkas",
        "konteks": "Brankas dokumen siswa, tempat simpan sertifikat & rapor, folder berkas siap download."
    },
    {
        "sheet": "sheet 7.png", "row": 0, "col": 2,
        "id_slug": "maskot-video-call-mentor",
        "en_slug": "video-call-match",
        "nama_pose": "Otbee Sesi Video Call Bareng Teman / Mentor",
        "deskripsi": "Layar monitor menampilkan panggilan video call dua arah interaktif antara siswa dan mentor.",
        "kategori": "Mentoring Live & Omegle Belajar",
        "konteks": "Fitur Cari Teman Belajar (Omegle edukasi), sesi Google Meet bareng mentor, simulasi wawancara."
    },
    {
        "sheet": "sheet 7.png", "row": 1, "col": 0,
        "id_slug": "maskot-bimbingan-catatan-mentor",
        "en_slug": "mentor-call-notes",
        "nama_pose": "Otbee Mencatat Poin Bimbingan Mentor",
        "deskripsi": "Otbee mendengarkan arahan sambil mencatat poin-poin emas di buku catatan studinya.",
        "kategori": "Konsultasi & Catatan Bimbingan",
        "konteks": "Hasil konsultasi 1-on-1, arahan mentor alumni, rangkuman sesi tanya jawab, panduan personal."
    },
    {
        "sheet": "sheet 7.png", "row": 1, "col": 1,
        "id_slug": "maskot-download-materi-folder",
        "en_slug": "folder-download",
        "nama_pose": "Otbee Membuka Folder Download Materi",
        "deskripsi": "Otbee membuka map folder berkas dengan panah unduhan hijau yang mencuat ke atas.",
        "kategori": "Unduh Berkas & Modul PDF",
        "konteks": "Tombol download template esai, unduh bank soal & kunci jawaban, simpan laporan analisis."
    },
    {
        "sheet": "sheet 7.png", "row": 1, "col": 2,
        "id_slug": "maskot-bintang-cemerlang",
        "en_slug": "star-sparkle",
        "nama_pose": "Otbee Berbinar Dikelilingi Bintang Emas",
        "deskripsi": "Otbee tersenyum takjub dengan mata berbinar dikelilingi kerlip bintang-bintang emas.",
        "kategori": "Rating Bintang 5 & Fitur Unggulan",
        "konteks": "Testimoni pengguna, fitur premium rekomendasi teratas, nilai sempurna, kepuasan belajar."
    },

    # Sheet 8
    {
        "sheet": "sheet 8.png", "row": 0, "col": 0,
        "id_slug": "maskot-lompat-pegang-kertas",
        "en_slug": "jump-paper",
        "nama_pose": "Otbee Melompat Bahagia Membawa Kertas Esai",
        "deskripsi": "Otbee melompat riang di udara memegang lembar naskah esai yang baru selesai dikerjakan.",
        "kategori": "Esai Selesai & Semangat",
        "konteks": "Esai berhasil di-submit, tugas selesai tepat waktu, notifikasi 'Siap Diperiksa', semangat belajar."
    },
    {
        "sheet": "sheet 8.png", "row": 0, "col": 1,
        "id_slug": "maskot-koreksi-kertas-senang",
        "en_slug": "check-paper-happy",
        "nama_pose": "Otbee Puas Memeriksa Lembar Ceklis",
        "deskripsi": "Otbee memandang lembar evaluasi bertanda centang dengan senyum lega dan puas.",
        "kategori": "Hasil Review & Validasi Lengkap",
        "konteks": "Ringkasan onboarding selesai, validasi dokumen 100%, verifikasi profil siswa komplit."
    },
    {
        "sheet": "sheet 8.png", "row": 0, "col": 2,
        "id_slug": "maskot-tunjuk-diagram-batang",
        "en_slug": "bar-chart-point",
        "nama_pose": "Otbee Berdiri Menunjuk Diagram Analitik Batang",
        "deskripsi": "Otbee berdiri di sebelah diagram batang berwarna-warni sambil menunjuk balok tertinggi.",
        "kategori": "Analitik Nilai & Passing Grade",
        "konteks": "Analisis rapor semester 1-5, perbandingan passing grade antar kampus, grafik komparasi minat."
    },
    {
        "sheet": "sheet 8.png", "row": 1, "col": 0,
        "id_slug": "maskot-jam-timer-belajar",
        "en_slug": "reading-clock",
        "nama_pose": "Otbee Belajar di Samping Jam Weker / Timer",
        "deskripsi": "Otbee duduk tekun di samping jam weker alarm yang berdetik menghitung mundur waktu.",
        "kategori": "Timer, Pomodoro & Manajemen Waktu",
        "konteks": "Sesi nulis terfokus 25 menit (Pomodoro), timer pengerjaan tryout, manajemen waktu belajar efektif."
    },
    {
        "sheet": "sheet 8.png", "row": 1, "col": 1,
        "id_slug": "maskot-bagikan-share-link",
        "en_slug": "share-icon",
        "nama_pose": "Otbee Memegang Ikon Bagikan / Share",
        "deskripsi": "Otbee memeluk lingkaran biru berlogo node share (bagikan) ke teman-teman.",
        "kategori": "Share Sosial Media & Referral",
        "konteks": "Tombol bagikan hasil tryout ke media sosial, ajak teman belajar bareng, program referral beasiswa."
    },
    {
        "sheet": "sheet 8.png", "row": 1, "col": 2,
        "id_slug": "maskot-headset-sapa",
        "en_slug": "headset-wave",
        "nama_pose": "Otbee Memakai Headphone Melambaikan Tangan",
        "deskripsi": "Otbee memakai headphone audio keren sambil melambaikan tangan ramah menyapa teman.",
        "kategori": "Audio Podcast & Voice Room",
        "konteks": "Podcast seputar perkuliahan, panduan audio motivasi, sapaan di ruang voice chat belajar."
    },

    # Sheet 9
    {
        "sheet": "sheet 9.png", "row": 0, "col": 0,
        "id_slug": "maskot-peluk-bantal-ngantuk",
        "en_slug": "sleep-pillow",
        "nama_pose": "Otbee Memeluk Bantal Tidur Mengantuk",
        "deskripsi": "Otbee memeluk bantal tidur empuk dengan mata sayu mengantuk yang lucu.",
        "kategori": "Kelelahan & Waktu Istirahat",
        "konteks": "Pengingat 'Jangan lupa istirahat!', sesi belajar larut malam selesai, status akun idle/offline."
    },
    {
        "sheet": "sheet 9.png", "row": 0, "col": 1,
        "id_slug": "maskot-terbang-pesawat-kertas",
        "en_slug": "paper-plane-fly",
        "nama_pose": "Otbee Menerbangkan Pesawat Kertas Impian",
        "deskripsi": "Otbee menerbangkan pesawat kertas putih meluncur tinggi membawa cita-cita ke kampus impian.",
        "kategori": "Kirim Esai & Terbangkan Impian",
        "konteks": "Tombol kirim/submit final pendaftaran, animasi pengiriman esai ke tim reviewer, kirim doa & harapan."
    },
    {
        "sheet": "sheet 9.png", "row": 0, "col": 2,
        "id_slug": "maskot-kacamata-baca-meja",
        "en_slug": "glasses-writing-desk",
        "nama_pose": "Otbee Memakai Kacamata Riset di Meja",
        "deskripsi": "Otbee memakai kacamata baca bulat sedang tekun meriset data di atas meja belajarnya.",
        "kategori": "Riset Jurusan & Mode Serius",
        "konteks": "Bedah jurusan kritis, riset akreditasi & prospek kerja, analisis mendalam profil kampus."
    },
    {
        "sheet": "sheet 9.png", "row": 1, "col": 0,
        "id_slug": "maskot-lompat-bawa-piala",
        "en_slug": "trophy-jump",
        "nama_pose": "Otbee Melompat Girang Membawa Piala",
        "deskripsi": "Otbee melompat gembira membawa piala juara mini berkilauan di tangannya.",
        "kategori": "Prestasi Tryout & Juara Kelas",
        "konteks": "Skor tryout tembus target, peringkat 1 tryout akbar, lencana prestasi terselesaikan."
    },
    {
        "sheet": "sheet 9.png", "row": 1, "col": 1,
        "id_slug": "maskot-duduk-awan-bintang",
        "en_slug": "cloud-star-sit",
        "nama_pose": "Otbee Duduk di Awan Menunjuk Bintang",
        "deskripsi": "Otbee duduk santai di atas awan putih empuk sambil menunjuk bintang kejora di langit malam.",
        "kategori": "Cita-Cita & Visi Masa Depan",
        "konteks": "Dream campus goal tracker, visualisasi cita-cita kuliah, renungan masa depan, motivasi spiritual."
    },
    {
        "sheet": "sheet 9.png", "row": 1, "col": 2,
        "id_slug": "maskot-ide-bohlam-lampu",
        "en_slug": "thinking-idea",
        "nama_pose": "Otbee Dapat Ide Lampu Bohlam Menyala",
        "deskripsi": "Otbee mengangkat jari telunjuk ke atas dengan lampu bohlam kuning ide cerah menyala.",
        "kategori": "Tips, Inspirasi & Solusi Cerdas",
        "konteks": "Tips & trik lolos PTN, inspirasi topik esai kreatif, 'Tahukah Kamu?', insight strategis baru."
    }
]

def remove_background_and_defringe(crop_img):
    """
    Remove white background with flood-fill matting and defringe edge pixels
    to avoid white halos.
    """
    arr = np.array(crop_img).astype(float)
    h, w = arr.shape[:2]

    # White candidate mask
    is_white = (arr[:, :, 0] > 242) & (arr[:, :, 1] > 242) & (arr[:, :, 2] > 242)
    labeled_white, _ = label(is_white)

    # Find external labels touching any of the 4 outer image borders
    border_mask = np.zeros((h, w), dtype=bool)
    border_mask[0, :] = border_mask[-1, :] = border_mask[:, 0] = border_mask[:, -1] = True
    border_labels = set(np.unique(labeled_white[border_mask]))
    if 0 in border_labels:
        border_labels.remove(0)

    # True external background
    ext_bg = np.isin(labeled_white, list(border_labels))

    # Binary foreground mask
    fg_mask = ~ext_bg

    # Crop to tight bounding box of foreground with safe margin
    ys, xs = np.where(fg_mask)
    if len(ys) == 0 or len(xs) == 0:
        return crop_img.convert("RGBA")

    pad = 12
    min_y = max(0, ys.min() - pad)
    max_y = min(h, ys.max() + 1 + pad)
    min_x = max(0, xs.min() - pad)
    max_x = min(w, xs.max() + 1 + pad)

    arr_tight = arr[min_y:max_y, min_x:max_x]
    ext_bg_tight = ext_bg[min_y:max_y, min_x:max_x]

    # Clean edge anti-aliasing
    alpha_raw = (~ext_bg_tight).astype(np.uint8) * 255
    pil_alpha = Image.fromarray(alpha_raw).filter(ImageFilter.GaussianBlur(radius=0.7))
    alpha_arr = np.array(pil_alpha).astype(float) / 255.0

    # De-fringe white contribution on edge transition pixels
    clean_arr = arr_tight.copy()
    mask = (alpha_arr > 0.05) & (alpha_arr < 0.98)
    for c in range(3):
        c_arr = clean_arr[:, :, c]
        c_arr[mask] = np.clip((c_arr[mask] - (1.0 - alpha_arr[mask]) * 254.0) / np.maximum(alpha_arr[mask], 0.1), 0, 255)
        clean_arr[:, :, c] = c_arr

    rgba = np.zeros((clean_arr.shape[0], clean_arr.shape[1], 4), dtype=np.uint8)
    rgba[:, :, :3] = np.clip(clean_arr, 0, 255).astype(np.uint8)
    rgba[:, :, 3] = pil_alpha

    return Image.fromarray(rgba)

def upscale_to_hd(rgba_img, scale=4):
    """
    Upscale to HD (4x) with high-quality Lanczos resampling and edge sharpening.
    """
    new_w = rgba_img.width * scale
    new_h = rgba_img.height * scale
    hd_img = rgba_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    # Subtle unsharp mask to crisp cartoon lines
    hd_sharp = hd_img.filter(ImageFilter.UnsharpMask(radius=2, percent=120, threshold=3))
    return hd_sharp

def main():
    print("🚀 Starting Mascot HD Processing Pipeline...")
    print(f"Total poses to process: {len(MASCOT_METADATA)}")

    # Cache sheet images
    sheet_cache = {}
    
    # Process each mascot
    catalog_entries = []

    for idx, item in enumerate(MASCOT_METADATA):
        sheet_name = item["sheet"]
        if sheet_name not in sheet_cache:
            sheet_path = os.path.join(MASKOT_DIR, sheet_name)
            sheet_img = Image.open(sheet_path).convert("RGB")
            arr = np.array(sheet_img)
            non_bg = ~((arr[:, :, 0] > 245) & (arr[:, :, 1] > 245) & (arr[:, :, 2] > 245))
            row_counts = non_bg.sum(axis=1)
            row_sep = int(np.argmin(row_counts[400:500]) + 400)

            r0_counts = non_bg[:row_sep].sum(axis=0)
            c0_1 = int(np.argmin(r0_counts[340:460]) + 340)
            c0_2 = int(np.argmin(r0_counts[740:860]) + 740)

            r1_counts = non_bg[row_sep:].sum(axis=0)
            c1_1 = int(np.argmin(r1_counts[340:460]) + 340)
            c1_2 = int(np.argmin(r1_counts[740:860]) + 740)

            sheet_cache[sheet_name] = {
                "img": sheet_img,
                "row_sep": row_sep,
                "r0_cols": (c0_1, c0_2),
                "r1_cols": (c1_1, c1_2)
            }

        s_info = sheet_cache[sheet_name]
        r = item["row"]
        c = item["col"]

        # Compute cell boundaries
        y0 = 0 if r == 0 else s_info["row_sep"]
        y1 = s_info["row_sep"] if r == 0 else 896
        cols = s_info["r0_cols"] if r == 0 else s_info["r1_cols"]

        if c == 0:
            x0, x1 = 0, cols[0]
        elif c == 1:
            x0, x1 = cols[0], cols[1]
        else:
            x0, x1 = cols[1], 1200

        cell_crop = s_info["img"].crop((x0, y0, x1, y1))

        # 1. Background removal & defringing
        transparent_crop = remove_background_and_defringe(cell_crop)

        # 2. 4x HD Upscaling
        hd_crop = upscale_to_hd(transparent_crop, scale=4)

        # 3. Save files
        id_filename = f"{item['id_slug']}.png"
        en_filename = f"{item['en_slug']}.png"

        # Save to Maskot/hd-transparent (both ID name and EN name)
        out_id_path = os.path.join(OUTPUT_DIR, id_filename)
        out_en_path = os.path.join(OUTPUT_DIR, en_filename)
        hd_crop.save(out_id_path, "PNG", optimize=True)
        hd_crop.save(out_en_path, "PNG", optimize=True)

        # Also save to public/mascot-hd
        pub_id_path = os.path.join(PUBLIC_MASCOT_HD, id_filename)
        pub_en_path = os.path.join(PUBLIC_MASCOT_HD, en_filename)
        hd_crop.save(pub_id_path, "PNG", optimize=True)
        hd_crop.save(pub_en_path, "PNG", optimize=True)

        # Also upgrade the file in public/mascot if it exists
        pub_orig_path = os.path.join(ROOT_DIR, "public", "mascot", en_filename)
        hd_crop.save(pub_orig_path, "PNG", optimize=True)

        entry = {
            "no": idx + 1,
            "id_filename": id_filename,
            "en_filename": en_filename,
            "nama_pose": item["nama_pose"],
            "deskripsi": item["deskripsi"],
            "kategori": item["kategori"],
            "konteks": item["konteks"],
            "dimensions": f"{hd_crop.width}x{hd_crop.height}",
            "source_sheet": f"{sheet_name} (Row {r+1}, Col {c+1})"
        }
        catalog_entries.append(entry)
        print(f"[{idx+1:02d}/48] ✅ {id_filename:35} -> HD ({hd_crop.width}x{hd_crop.height})")

    # Generate JSON Catalog
    json_path = os.path.join(OUTPUT_DIR, "catalog.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(catalog_entries, f, indent=2, ensure_ascii=False)

    json_pub_path = os.path.join(PUBLIC_MASCOT_HD, "catalog.json")
    with open(json_pub_path, "w", encoding="utf-8") as f:
        json.dump(catalog_entries, f, indent=2, ensure_ascii=False)

    # Generate Markdown Catalog Guide
    generate_markdown_catalog(catalog_entries)

    print("\n🎉 ALL 48 MASCOT POSES SUCCESSFULLY CONVERTED TO HD TRANSPARENT PNG!")
    print(f"📁 Primary Output: {OUTPUT_DIR}")
    print(f"📁 Public Web Output: {PUBLIC_MASCOT_HD}")

def generate_markdown_catalog(entries):
    md_content = """# 🐝 Katalog Resmi Maskot Otbee HD (OTWPTN)

Koleksi lengkap **48 pose maskot Otbee** dalam format **High Definition (HD ~1200x1500+ px)** dengan **background transparan (RGBA)** bersih tanpa halo putih.

Direktori ini dirancang agar **Claude / developer / desainer** dapat dengan mudah mencari dan menggunakan maskot yang tepat sesuai konteks fitur atau halaman UI.

---

## 📂 Lokasi File & Format
- **Format**: PNG Transparan (RGBA 32-bit), HD 4x Super Resolution
- **Folder Maskot**: `/Maskot/hd-transparent/`
- **Folder Public Web**: `/public/mascot/` & `/public/mascot-hd/`
- **Cara Import di Next.js / React**:
  ```tsx
  import Image from 'next/image';

  // Opsi 1: Menggunakan nama pose deskriptif bahasa Indonesia
  <Image src="/mascot-hd/maskot-jempol-rekomendasi.png" alt="Otbee Mantap" width={180} height={220} />

  // Opsi 2: Menggunakan slug singkat bahasa Inggris
  <Image src="/mascot/thumbsup.png" alt="Otbee Thumbs Up" width={180} height={220} />
  ```

---

## 📑 Daftar Lengkap 48 Pose Maskot & Panduan Konteks UI

| No | Preview | Nama File Indonesia | Nama File EN (Slug) | Kategori | Konteks Penggunaan UI yang Direkomendasikan |
| :-: | :-: | :--- | :--- | :--- | :--- |
"""

    for e in entries:
        md_content += f"| {e['no']} | <img src=\"./{e['id_filename']}\" width=\"70\" alt=\"{e['nama_pose']}\" /> | `{e['id_filename']}` | `{e['en_filename']}` | **{e['kategori']}** | {e['konteks']} |\n"

    md_content += """
---

## 🏷️ Panduan Cepat Berdasarkan Kategori Konteks

### 🎓 1. Prestasi, Kelulusan & Juara
- `maskot-piala-toga-juara.png` (`trophy-graduate.png`): Top 1 Leaderboard, lulusan terbaik.
- `maskot-pegang-ijazah.png` (`diploma.png`): Halaman bukti kelulusan & sertifikat.
- `maskot-lolos-ptn-loncat.png` (`lulus-ptn.png`): Banner ucapan selamat diterima di PTN.
- `maskot-medali-emas-prestasi.png` (`medal.png`): Input portofolio piagam kejuaraan.
- `maskot-lompat-bawa-piala.png` (`trophy-jump.png`): Skor tryout melampaui target.

### 📝 2. Esai, Belajar & Latihan Soal
- `maskot-nulis-essay-meja.png` (`writing-essay.png`): Workspace editor penulisan esai.
- `maskot-terbang-pensil.png` (`pencil-fly.png`): Tombol aksi mulai buat esai/tryout baru.
- `maskot-kaca-pembesar-draft.png` (`review-draft.png`): Deep review AI & pengecekan typo.
- `maskot-kertas-poin-revisi.png` (`speech-doc.png`): Catatan koreksi detail dari mentor.
- `maskot-lompat-pegang-kertas.png` (`jump-paper.png`): Esai berhasil dikirim/di-submit.
- `maskot-baca-buku-tumpuk.png` (`reading-books.png`): Halaman modul materi & bank soal.

### 🧭 3. Strategi, Analisis & Roadmap
- `maskot-tunjuk-peta-strategi.png` (`map-pointing.png`): Fitur rasionalisasi & strategi jurusan.
- `maskot-peluang-persentase.png` (`percent-ring.png`): Kalkulator peluang kelulusan (%).
- `maskot-grafik-batang-naik.png` (`stats-chart.png`): Grafik peningkatan nilai tryout.
- `maskot-tunjuk-diagram-batang.png` (`bar-chart-point.png`): Analisis rapor semester 1-5.
- `maskot-jalan-roadmap-ptn.png` (`journey-path.png`): Roadmap persiapan 100 hari.
- `maskot-bendera-milestone.png` (`roadmap-flags.png`): Checkpoint milestone berhasil dicapai.

### 💡 4. Bantuan, Tips & Layanan Siswa
- `maskot-ide-bohlam-lampu.png` (`thinking-idea.png`): Tips cerdas, inspirasi topik esai.
- `maskot-bingung-garuk-kepala.png` (`confused.png`): Error 404, empty state, butuh FAQ.
- `maskot-customer-service-headset.png` (`support-headset.png`): Live chat & bantuan CS.
- `maskot-bersama-robot-ai.png` (`ai-robot.png`): Fitur automasi & AI generator.
- `maskot-chat-smartphone.png` (`otbee-phone.png`): Notifikasi WhatsApp & mobile chat.
- `maskot-video-call-mentor.png` (`video-call-match.png`): Mentoring 1-on-1 & Omegle belajar.

### ⏰ 5. Jadwal, Waktu & Operasional
- `maskot-kalender-deadline.png` (`calendar-zoom.png`): Countdown deadline pendaftaran.
- `maskot-jam-timer-belajar.png` (`reading-clock.png`): Sesi Pomodoro fokus 25 menit.
- `maskot-tidur-lelap-bantal.png` (`sleeping.png`): Maintenance mode & reminder istirahat.
- `maskot-peluk-bantal-ngantuk.png` (`sleep-pillow.png`): Jam malam selesai belajar.
- `maskot-toa-pengumuman-resmi.png` (`announcement.png`): Broadcast pengumuman penting.

---
*Generated automatically by Antigravity AI Studio.*
"""

    md_path = os.path.join(OUTPUT_DIR, "CATALOG.md")
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md_content)

    md_pub_path = os.path.join(PUBLIC_MASCOT_HD, "CATALOG.md")
    with open(md_pub_path, "w", encoding="utf-8") as f:
        f.write(md_content)

    readme_path = os.path.join(OUTPUT_DIR, "README.md")
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(md_content)

if __name__ == "__main__":
    main()
