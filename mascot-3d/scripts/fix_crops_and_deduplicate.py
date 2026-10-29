import os
import glob
import json
import numpy as np
from PIL import Image, ImageFilter

BASE_DIR = "/Users/acan/pemrograman/otwptn"
MASKOT_DIR = os.path.join(BASE_DIR, "Maskot")
OUTPUT_DIR = os.path.join(MASKOT_DIR, "hd-transparent")
PUBLIC_MASCOT_HD = os.path.join(BASE_DIR, "public", "mascot-hd")
PUBLIC_FITUR = os.path.join(BASE_DIR, "public", "fitur")
PUBLIC_MASCOT = os.path.join(BASE_DIR, "public", "mascot")


def remove_white_background_matting(img_rgb, white_thresh=240, tolerance=25):
    if img_rgb.mode != "RGB":
        img_rgb = img_rgb.convert("RGB")
    arr = np.array(img_rgb, dtype=np.float32)
    h, w, _ = arr.shape
    is_near_white = np.all(arr > (white_thresh - tolerance), axis=2)
    
    from collections import deque
    is_outer_bg = np.zeros((h, w), dtype=bool)
    queue = deque()
    for x in range(w):
        if is_near_white[0, x]:
            is_outer_bg[0, x] = True
            queue.append((0, x))
        if is_near_white[h - 1, x]:
            is_outer_bg[h - 1, x] = True
            queue.append((h - 1, x))
    for y in range(h):
        if is_near_white[y, 0]:
            is_outer_bg[y, 0] = True
            queue.append((y, 0))
        if is_near_white[y, w - 1]:
            is_outer_bg[y, w - 1] = True
            queue.append((y, w - 1))
    while queue:
        cy, cx = queue.popleft()
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w:
                if not is_outer_bg[ny, nx] and is_near_white[ny, nx]:
                    is_outer_bg[ny, nx] = True
                    queue.append((ny, nx))
    alpha = np.where(is_outer_bg, 0, 255).astype(np.uint8)
    alpha_img = Image.fromarray(alpha, mode="L").filter(ImageFilter.GaussianBlur(radius=0.75))
    alpha_arr = np.array(alpha_img)
    rgb_arr = arr.astype(np.uint8)
    result_rgba = np.dstack((rgb_arr, alpha_arr))
    return Image.fromarray(result_rgba, mode="RGBA")


def upscale_hd(img_rgba, scale_factor=3, max_dim=2000):
    w, h = img_rgba.size
    target_w = int(w * scale_factor)
    target_h = int(h * scale_factor)
    if max(target_w, target_h) > max_dim:
        ratio = max_dim / max(target_w, target_h)
        target_w = int(target_w * ratio)
        target_h = int(target_h * ratio)
    hd = img_rgba.resize((target_w, target_h), Image.Resampling.LANCZOS)
    r, g, b, a = hd.split()
    rgb = Image.merge("RGB", (r, g, b))
    sharpened_rgb = rgb.filter(ImageFilter.UnsharpMask(radius=1.5, percent=120, threshold=3))
    sr, sg, sb = sharpened_rgb.split()
    return Image.merge("RGBA", (sr, sg, sb, a))


def clean_fitur_sheet():
    print("🧹 Cleaning and re-cropping fitur.png with 100% zero-text bleed...")
    im = Image.open(os.path.join(MASKOT_DIR, "fitur.png")).convert("RGB")
    arr = np.array(im)
    
    # Precise text erasing:
    # Row 0
    arr[80:138, 50:300] = 255    # Mentor Alumni
    arr[80:138, 480:800] = 255   # Essay AI Review (including 'Review')
    arr[80:138, 930:1280] = 255  # Kalkulator Peluang
    # Row 1
    arr[310:365, 50:380] = 255   # Otbee AI
    arr[310:365, 480:760] = 255  # Modul & Video (including 'Video')
    arr[310:365, 930:1210] = 255 # Komunitas
    # Row 2
    arr[550:605, 50:290] = 255   # Tracking Jalur
    arr[550:605, 480:860] = 255  # Penyimpanan Dokumen
    arr[550:605, 930:1290] = 255 # Cari Teman Belajar
    
    im_clean = Image.fromarray(arr)
    
    items = [
        ("maskot-fitur-mentor-alumni.png", "mentor-alumni.png", 230, 445, 86, 280),
        ("maskot-fitur-essay-ai-review.png", "essay-ai-review.png", 640, 890, 138, 280),
        ("maskot-fitur-kalkulator-peluang.png", "kalkulator-peluang.png", 1110, 1340, 138, 280),
        ("maskot-fitur-otbee-ai.png", "otbee-ai.png", 230, 450, 310, 520),
        ("maskot-fitur-modul-video.png", "modul-video.png", 660, 905, 320, 520),
        ("maskot-fitur-komunitas.png", "komunitas.png", 1110, 1350, 320, 520),
        ("maskot-fitur-tracking-jalur.png", "tracking-jalur.png", 250, 445, 560, 755),
        ("maskot-fitur-penyimpanan-dokumen.png", "penyimpanan-dokumen.png", 670, 905, 560, 755),
        ("maskot-fitur-cari-teman-belajar.png", "cari-teman-belajar.png", 1120, 1350, 560, 755),
    ]
    
    for indo_name, en_name, x1, x2, y1, y2 in items:
        sub = arr[y1:y2, x1:x2]
        is_char = np.any(sub < 240, axis=2)
        ys, xs = np.where(is_char)
        bx1 = x1 + xs.min()
        bx2 = x1 + xs.max() + 1
        by1 = y1 + ys.min()
        by2 = y1 + ys.max() + 1
        
        crop = im_clean.crop((bx1, by1, bx2, by2))
        matted = remove_white_background_matting(crop, white_thresh=242)
        hd = upscale_hd(matted, scale_factor=4, max_dim=1600)
        
        # Save to hd-transparent (Indonesian only)
        hd.save(os.path.join(OUTPUT_DIR, indo_name), "PNG", optimize=True)
        # Save to public/mascot-hd
        hd.save(os.path.join(PUBLIC_MASCOT_HD, indo_name), "PNG", optimize=True)
        hd.save(os.path.join(PUBLIC_MASCOT_HD, en_name), "PNG", optimize=True)
        # Save to public/fitur
        hd.save(os.path.join(PUBLIC_FITUR, en_name), "PNG", optimize=True)
        hd.save(os.path.join(PUBLIC_FITUR, indo_name), "PNG", optimize=True)
        print(f"  ✨ Cleaned {indo_name} -> {hd.width}x{hd.height}")


def clean_2d_pov_sheet():
    print("🧹 Cleaning and re-cropping 2d all pov.png with 100% zero-label bleed...")
    im = Image.open(os.path.join(MASKOT_DIR, "2d all pov.png")).convert("RGB")
    arr = np.array(im)
    
    # Erase labels:
    # Row 1 labels: y in [420, 480] outside 3/4 front antenna (which is only x in [669, 765])
    arr[420:480, :665] = 255
    arr[420:480, 770:] = 255
    # Row 2 labels: y in [725, 768]
    arr[725:, :] = 255
    im_clean = Image.fromarray(arr)
    
    povs = [
        ("maskot-pov-depan-front.png", "pov-front.png", 40, 360, 50, 415),
        ("maskot-pov-samping-kanan-right.png", "pov-right.png", 380, 680, 50, 415),
        ("maskot-pov-samping-kiri-left.png", "pov-left.png", 720, 1020, 50, 415),
        ("maskot-pov-belakang-back.png", "pov-back.png", 1030, 1340, 50, 415),
        ("maskot-pov-atas-top.png", "pov-top.png", 80, 480, 480, 720),
        ("maskot-pov-tiga-perempat-3-4.png", "pov-three-quarter.png", 575, 820, 460, 720),
        ("maskot-pov-bawah-bottom.png", "pov-bottom.png", 980, 1340, 480, 720),
    ]
    
    for indo_name, en_name, x1, x2, y1, y2 in povs:
        sub = arr[y1:y2, x1:x2]
        is_char = ~((sub[:, :, 0] > 225) & (sub[:, :, 1] > 225) & (sub[:, :, 2] > 225))
        ys, xs = np.where(is_char)
        bx1 = x1 + xs.min()
        bx2 = x1 + xs.max() + 1
        by1 = y1 + ys.min()
        by2 = y1 + ys.max() + 1
        
        crop = im_clean.crop((bx1, by1, bx2, by2))
        matted = remove_white_background_matting(crop, white_thresh=235)
        hd = upscale_hd(matted, scale_factor=4, max_dim=1600)
        
        hd.save(os.path.join(OUTPUT_DIR, indo_name), "PNG", optimize=True)
        hd.save(os.path.join(PUBLIC_MASCOT_HD, indo_name), "PNG", optimize=True)
        hd.save(os.path.join(PUBLIC_MASCOT_HD, en_name), "PNG", optimize=True)
        print(f"  ✨ Cleaned {indo_name} -> {hd.width}x{hd.height}")


def deduplicate_master_folder():
    print("🗑️ Removing duplicate English aliases from Maskot/hd-transparent/...")
    # In Maskot/hd-transparent/, keep ONLY files that start with 'maskot-' or 'logo-'
    all_files = glob.glob(os.path.join(OUTPUT_DIR, "*.png"))
    removed_count = 0
    for f in all_files:
        basename = os.path.basename(f)
        if not (basename.startswith("maskot-") or basename.startswith("logo-")):
            os.remove(f)
            removed_count += 1
            
    print(f"  ✅ Removed {removed_count} duplicate files from Maskot/hd-transparent/!")
    remaining = glob.glob(os.path.join(OUTPUT_DIR, "*.png"))
    print(f"  📁 Remaining clean unique mascot files: {len(remaining)}")


def update_clean_catalog():
    print("📖 Updating catalog.json and CATALOG.md with clean unique files...")
    catalog_path = os.path.join(OUTPUT_DIR, "catalog.json")
    with open(catalog_path, "r", encoding="utf-8") as f:
        items = json.load(f)
        
    # Filter to only unique files present in OUTPUT_DIR
    clean_items = []
    seen = set()
    for it in items:
        fname = it.get("id_filename")
        if fname and fname not in seen and os.path.exists(os.path.join(OUTPUT_DIR, fname)):
            seen.add(fname)
            clean_items.append(it)
            
    # Re-number 1 to N
    for idx, it in enumerate(clean_items, start=1):
        it["no"] = idx
        
    with open(catalog_path, "w", encoding="utf-8") as f:
        json.dump(clean_items, f, indent=2, ensure_ascii=False)
    with open(os.path.join(PUBLIC_MASCOT_HD, "catalog.json"), "w", encoding="utf-8") as f:
        json.dump(clean_items, f, indent=2, ensure_ascii=False)
        
    md_content = f"""# 🐝 Katalog Resmi Maskot Otbee HD (OTWPTN)

Koleksi lengkap **{len(clean_items)} pose unik maskot Otbee** dalam format **High Definition (HD)** dengan **background transparan (RGBA)** bersih murni tanpa teks dan tanpa sisa halo putih.

Direktori ini dirancang agar **Claude / developer / desainer** dapat dengan mudah mencari dan menggunakan maskot yang tepat sesuai konteks fitur atau halaman UI.

---

## 📂 Lokasi File & Format
- **Format**: PNG Transparan (RGBA 32-bit), HD Super Resolution
- **Folder Master Maskot**: `/Maskot/hd-transparent/` (Setiap pose memiliki 1 file unik tanpa duplikat)
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

## 📑 Daftar Lengkap {len(clean_items)} Pose Maskot Unik & Panduan Konteks UI

| No | Preview | Nama File Maskot | Slug EN | Kategori | Konteks Penggunaan UI yang Direkomendasikan |
| :-: | :-: | :--- | :--- | :--- | :--- |
"""
    for item in clean_items:
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
    print(f"✅ CATALOG.md updated cleanly with {len(clean_items)} unique poses!")


if __name__ == "__main__":
    clean_fitur_sheet()
    clean_2d_pov_sheet()
    deduplicate_master_folder()
    update_clean_catalog()
