# Seri Poster Publikasi otwptn — Plan

## Keputusan
- **Platform & ukuran:** semua poster dibuat dalam 2 versi.
  - IG Feed 4:5: 1080×1350 px.
  - Story 9:16: 1080×1920 px.
  - Masing-masing diekspor juga dalam versi 2x (2160 px lebar).
- **Gaya:** bento ala tofly.
  - Kartu-kartu rounded di atas latar krem/kuning lembut.
  - Otbee besar sebagai hero.
  - Satu kartu headline dan beberapa kartu info.
  - Footer pill sosmed.
- **Identitas:**
  - Warna kuning otwptn #FFD400 / amber dengan ink gelap.
  - Logo wordmark asli.
  - Pose Otbee asli dari `public/mascot/`.
- **Data:** tanpa angka pengguna, rating, atau testimoni karangan. Hanya fakta yang sudah ada di web:
  - 5 fitur;
  - harga paket;
  - mentor alumni UI/ITB/UGM;
  - kuota eligible per akreditasi.
- **CTA:** otwptn.com, dengan footer @otwptn (IG, TikTok, X).
- **Output:** PNG plus source editable. Semua teks, harga, dan tanggal ada di satu file konten, jadi bisa diganti tanpa menyentuh desain.
- **Tanggal:** placeholder yang jelas, contoh `[TGL PENDAFTARAN]`, diisi setelah jadwal resmi SNPMB/kampus keluar.
- **Urutan:** brand intro dulu untuk approve gaya, baru seri lain.

## Daftar poster (14 konsep × 2 ukuran = 28 PNG)

| # | Poster | Isi utama | Pose Otbee |
|---|--------|-----------|------------|
| 1 | **Brand intro (bento)** | Headline "Masuk PTN tanpa tes, ada jalurnya"; 5 fitur (pill list); Gratis vs Premium Rp29rb/bulan; sneak peek mockup app; sosmed | map-pointing / wave |
| 2 | Fitur: Tracking Jalur | Pantau semua jalur & deadline berkas dalam satu dashboard; mockup HP | roadmap-flags |
| 3 | Fitur: Essay AI Review | Evaluasi 4 dimensi (hook, storytelling, relevansi prodi, bahasa), deteksi kalimat klise; mockup editor | writing-essay |
| 4 | Fitur: Kalkulator Peluang | Rapor sem 1–5, kuota sekolah per akreditasi, bobot mapel pendukung, prestasi; gauge peluang | percent-ring |
| 5 | Fitur: Otbee AI | Konsultan 24 jam; contoh chat | otbee-phone |
| 6 | Fitur: Mentor Alumni | Dibimbing alumni jalur non-tes UI/ITB/UGM; mockup video call | video-call-match |
| 7 | Harga & paket | Gratis vs Premium Rp29.000/bln (kartu besar); Nectar mulai 89rb, Honeycomb mulai 179rb (paling populer), Royal Jelly VIP mulai 349rb; catatan "harga mulai dari" | coin-bag |
| 8 | Momen: Pengumuman eligible SNBP | "Udah eligible? Sekarang yang nentuin: strategi pilih prodi" → Kalkulator Peluang + Mentor | lulus-ptn / check-paper-happy |
| 9 | Momen: Pendaftaran SNBP | Countdown `[TGL]`; checklist berkas & prestasi; Essay/Tracking | calendar-zoom |
| 10 | Momen: Pendaftaran PPKB / IUP / mandiri | `[TGL]` per jalur; angle esai + mentor | review-draft |
| 11 | Rekrut Mentor Alumni | Untuk alumni jalur non-tes; honor mentoring; jadwal fleksibel; link daftar mentor | mentor-team |
| 12 | Rekrut Ambassador | Untuk siswa/mahasiswa; komisi referral tiap pendaftaran paket bimbingan; link ambassador | megaphone-community |
| 13 | Edukasi: Peta jalur non-tes | SNBP, PPKB UI, IUP, jalur prestasi/mandiri lain — apa bedanya, kapan, butuh apa | map-pointing |
| 14 | Edukasi: Cara hitung peluang rapor | Kuota eligible (A 40% / B 25% / C 5%), rata-rata rapor, mapel pendukung, prestasi | bar-chart-point |

Untuk poster edukasi (13–14), detail aturan seleksi aku cek dulu ke sumber resmi SNPMB atau kampus sebelum ditulis. Semua klaim juga perlu kamu review sebelum posting.

## Tata letak bento
- **4:5:** grid 2 kolom.
  - Kartu hero (Otbee + headline) di kiri atas.
  - Kartu info di kanan.
  - Strip kartu bawah.
  - Footer pill sosmed.
- **9:16:** isi yang sama, disusun 1 kolom.
  - Hero di atas, info di tengah, CTA di bawah.
  - Ruang aman atas dan bawah sekitar 250 px, supaya tidak tertutup UI story.

## Teknis
- Desain dibuat sebagai komponen React. Pakai Remotion `<Still>` di sub-proyek yang sudah ada, dengan font dan aset brand yang sama.
- `posters/content.json` berisi semua teks, harga, tanggal, dan link. Ubah file ini lalu render ulang.
- Ekspor: satu perintah render semua PNG ke `posters/out/`.
