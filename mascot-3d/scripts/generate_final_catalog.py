import os
import json

BASE_DIR = "/Users/acan/pemrograman/otwptn"
OUTPUT_DIR = os.path.join(BASE_DIR, "Maskot", "hd-transparent")
PUBLIC_MASCOT_HD = os.path.join(BASE_DIR, "public", "mascot-hd")

catalog_path = os.path.join(OUTPUT_DIR, "catalog.json")
with open(catalog_path, "r", encoding="utf-8") as f:
    items = json.load(f)

# Deduplicate by id_filename if any duplicates exist
seen = set()
unique_items = []
for it in items:
    fname = it.get("id_filename")
    if fname and fname not in seen:
        seen.add(fname)
        unique_items.append(it)

# Re-number 1 to N
for idx, it in enumerate(unique_items, start=1):
    it["no"] = idx

with open(catalog_path, "w", encoding="utf-8") as f:
    json.dump(unique_items, f, indent=2, ensure_ascii=False)
with open(os.path.join(PUBLIC_MASCOT_HD, "catalog.json"), "w", encoding="utf-8") as f:
    json.dump(unique_items, f, indent=2, ensure_ascii=False)

md_content = f"""# 🐝 Katalog Resmi Lengkap Maskot Otbee HD (OTWPTN)

Koleksi lengkap **{len(unique_items)} pose, sudut pandang, dan komposisi maskot Otbee** dalam format **High Definition (HD)** dengan **background transparan (RGBA)** bersih tanpa sisa halo putih.

Direktori ini dirancang agar **Claude / developer / desainer** dapat dengan mudah mencari dan menggunakan maskot yang tepat sesuai konteks fitur atau halaman UI.

---

## 📂 Lokasi File & Format
- **Format**: PNG Transparan (RGBA 32-bit), HD Super Resolution
- **Folder Master Maskot**: `/Maskot/hd-transparent/`
- **Folder Public Web (Next.js)**: `/public/mascot-hd/`, `/public/mascot/`, `/public/fitur/`
- **Cara Import di Next.js / React**:
  ```tsx
  import Image from 'next/image';

  // Opsi 1: Menggunakan nama pose deskriptif bahasa Indonesia
  <Image src="/mascot-hd/maskot-bersama-robot-ai.png" alt="Otbee AI" width={220} height={240} />

  // Opsi 2: Menggunakan slug singkat bahasa Inggris
  <Image src="/mascot/ai-robot.png" alt="Otbee AI" width={220} height={240} />

  // Opsi 3: Ikon fitur khusus di dashboard
  <Image src="/fitur/otbee-ai.png" alt="Fitur Otbee AI" width={180} height={180} />
  ```

---

## 📑 Daftar Lengkap {len(unique_items)} Aset Maskot & Panduan Konteks UI

| No | Preview | Nama File Indonesia | Nama File EN (Slug) | Kategori | Konteks Penggunaan UI yang Direkomendasikan |
| :-: | :-: | :--- | :--- | :--- | :--- |
"""

for item in unique_items:
    no = item["no"]
    indo = item["id_filename"]
    en = item["en_filename"]
    desc = item["nama_pose"]
    cat = item["kategori"]
    ctx = item["konteks"]
    md_content += f'| {no} | <img src="./{indo}" width="70" alt="{desc}" /> | `{indo}` | `{en}` | **{cat}** | {ctx} |\n'

md_content += """
---

## 🏷️ Pengelompokan Berdasarkan Kategori & Halaman

### 🚀 1. Fitur Utama Platform (`/public/fitur/`)
- `maskot-fitur-mentor-alumni.png`: Modul bimbingan alumni & konsultasi privat
- `maskot-fitur-essay-ai-review.png`: Evaluasi esai instan oleh AI
- `maskot-fitur-kalkulator-peluang.png`: Kalkulator rasionalisasi nilai & passing grade
- `maskot-fitur-otbee-ai.png`: AI Copilot asisten belajar siswa
- `maskot-fitur-modul-video.png`: Modul pelajaran & video rekaman
- `maskot-fitur-komunitas.png`: Ruang obrolan pejuang PTN se-Indonesia
- `maskot-fitur-tracking-jalur.png`: Roadmap & tracking pendaftaran semua jalur
- `maskot-fitur-penyimpanan-dokumen.png`: Brankas berkas rapor & piagam aman
- `maskot-fitur-cari-teman-belajar.png`: Omegle teman belajar satu minat kampus

### 🔄 2. Karakter Turnaround 360° / 2D POVs
- `maskot-pov-depan-front.png`: Tampilan depan simetris untuk splash screen / hero
- `maskot-pov-samping-kanan-right.png`: Animasi melangkah maju / next step
- `maskot-pov-samping-kiri-left.png`: Navigasi kembali / back step
- `maskot-pov-belakang-back.png`: Logout / selesai aktivitas
- `maskot-pov-atas-top.png`: Peta interaktif / gamifikasi
- `maskot-pov-tiga-perempat-3-4.png`: Kartu fitur dinamis / modal popup info
- `maskot-pov-bawah-bottom.png`: Sudut pandang bawah / aksi melompat

### 🐝 3. Lebah Terbang Jas Almamater (Selebrasi)
- `maskot-terbang-almet-kuning-ui.png` (`bee1-hd.png`): Lolos UI, selebrasi onboarding
- `maskot-terbang-almet-krem-ugm.png` (`bee2-hd.png`): Lolos UGM, selebrasi penerimaan
- `maskot-terbang-almet-toska-itb.png` (`bee3-hd.png`): Lolos ITB, selebrasi kelulusan

### 🌟 4. Aksi Spesifik Dashboard & Monetisasi
- `maskot-lanjutkan-draft-essay.png`: Card melanjutkan penulisan draft esai
- `maskot-upgrade-bintang-emas.png`: Penawaran upgrade paket membership premium
- `maskot-avatar-tunjuk-kanan.png`: Pemandu langkah form biodata siswa
- `maskot-kepala-logo-avatar.png`: Favicon & foto profil default pengguna
- `maskot-brand-logo-otwptn.png`: Logo resmi OTWPTN resolusi tinggi

### 👥 5. Komposisi Kelompok & Hero Banner
- `maskot-trio-mentor-headset.png`: Tiga mentor saling merangkul untuk section tim
- `maskot-grup-tangga-almamater.png`: Sepuluh pejuang almamater di tangga kampus
- `maskot-hero-intip-kiri.png`: Hiasan mengintip dari sisi kiri banner beranda
- `maskot-hero-intip-kanan.png`: Hiasan mengintip dari sisi kanan banner beranda
- `maskot-hero-baris-bawah-desktop.png`: Deretan maskot di pembatas banner desktop
- `maskot-hero-baris-bawah-mobile.png`: Deretan maskot responsif di HP

---
*Dihasilkan secara otomatis oleh Antigravity Pipeline untuk ekosistem OTWPTN.*
"""

with open(os.path.join(OUTPUT_DIR, "CATALOG.md"), "w", encoding="utf-8") as f:
    f.write(md_content)
with open(os.path.join(OUTPUT_DIR, "README.md"), "w", encoding="utf-8") as f:
    f.write(md_content)
with open(os.path.join(PUBLIC_MASCOT_HD, "CATALOG.md"), "w", encoding="utf-8") as f:
    f.write(md_content)

print(f"🎉 Successfully generated CATALOG.md with {len(unique_items)} unique items!")
