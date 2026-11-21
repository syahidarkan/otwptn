# Poster publikasi otwptn

Hasil siap upload ada di `out/`. Ada 21 poster, masing-masing dalam dua ukuran:

- `-feed`: 1080×1350
- `-story`: 1080×1920

Setiap file juga punya versi `@2x`.

## Pertama kali (sekali saja)

```bash
cd posters && npm install
```

## Cara edit 1 per 1

### 1. Buka studio (preview live)

```bash
cd posters && npm run studio
```

Browser akan terbuka. Di kiri ada daftar semua poster, urut nomor (`01-brand-intro-feed`, `07-harga-story`, dst). Klik satu poster untuk melihatnya. Setiap kali kamu menyimpan file, preview langsung ter-update.

### 2. Ganti teks, harga, tanggal, link → `content.json`

Semua tulisan ada di sini, dikelompokkan per poster. Contoh:

| Poster | Bagian di `content.json` |
|---|---|
| 01 Brand intro | `brandIntro` |
| 02–06 Fitur | `fitur.tracking`, `fitur.essay`, `fitur.kalkulator`, `fitur.otbee`, `fitur.mentor` |
| 07 Harga | `harga` |
| 08–10 Momen | `momen.eligible`, `momen.snbp` (tanggal `[TANGGAL]`, `H-[XX]`), `momen.mandiri` |
| 11–12 Rekrut | `rekrut.mentor`, `rekrut.ambassador` |
| 13 Peta jalur | `edukasi.peta` |
| 14–21 | `v2.nilai`, `v2.platform1`, `v2.essayGratis`, `v2.mandiriList`, `v2.pricelist`, `v2.creator`, `v2.otbeeTV`, `v2.games` |

Sosmed dan link ada di paling atas: `handle`, `site`, `socials`.

### 3. Ganti foto / gambar → `public/posters/`

Timpa file dengan nama yang sama, misalnya `public/posters/photo/creator.jpg`. Isi foldernya:

- `photo/`: foto
- `shot/`: screenshot otwptn.com
- `ptn/`: logo kampus
- File `*.png` lain: pose Otbee

### 4. Ubah desain (posisi, ukuran, warna) → `src/posters/`

Satu file untuk setiap poster:

| File | Poster |
|---|---|
| `BrandIntro.tsx` | 01 |
| `fitur/Tracking.tsx`, `Essay.tsx`, `Kalkulator.tsx`, `OtbeeAI.tsx`, `Mentor.tsx` | 02–06 |
| `Harga.tsx` | 07 |
| `more/Eligible.tsx`, `SnbpDaftar.tsx`, `Mandiri.tsx`, `RekrutMentor.tsx`, `Ambassador.tsx`, `PetaJalur.tsx` | 08–13 |
| `v2/NilaiSnbp.tsx`, `Platform1.tsx`, `EssayGratis.tsx`, `MandiriList.tsx`, `Pricelist.tsx`, `Creator.tsx`, `OtbeeTV.tsx`, `Games.tsx` | 14–21 |

Warna dasar, logo, ikon, dan footer sosmed ada di `src/posters/kit.tsx`.

### 5. Simpan jadi PNG

Satu poster saja (feed + story, 1x + 2x). Cukup tulis sebagian namanya:

```bash
./render.sh 18-pricelist
```

Semua poster:

```bash
./render.sh
```

Bisa juga langsung dari studio: buka poster, lalu klik tombol **Render** di kanan atas.

Kredit foto ada di `credits/README.md`.
