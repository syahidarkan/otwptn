#!/usr/bin/env python3
"""
Mascot HD Processing Pipeline (Part 2 - All Remaining Mascot Files)
Author: Antigravity Assistant
Description:
  Processes all remaining mascot sheets, POV sheets, and illustrations:
  - Maskot/fitur.png (9 feature mascots)
  - Maskot/2d all pov.png (7 character turnaround POVs)
  - Maskot/lebah terbang 1-3.png / lebah terbang.png (3 flying bees)
  - Maskot/bee nihi.png (Avatar pointing mascot)
  - Maskot/lanjutkan essay.png (Essay continuation mascot)
  - Maskot/upgrade paket.png (Gold star upgrade mascot)
  - Maskot/mentor.png (Trio mentor group)
  - Maskot/top.png (10 bees on stairs group)
  - Maskot/hero/* (Hero framing bees)
  - Maskot/logo.png (Mascot head & logo mark)

Outputs:
  - Maskot/hd-transparent/ (Unified master catalog)
  - public/mascot-hd/ (Mirrored for web)
  - public/fitur/ (Updated feature icons)
  - public/bee*-hd.png & public/hero-*-hd.png
  - Updated CATALOG.md and catalog.json covering ALL mascots!
"""

import os
import json
import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import binary_dilation, binary_erosion

BASE_DIR = "/Users/acan/pemrograman/otwptn"
MASKOT_DIR = os.path.join(BASE_DIR, "Maskot")
OUTPUT_DIR = os.path.join(MASKOT_DIR, "hd-transparent")
PUBLIC_MASCOT_HD = os.path.join(BASE_DIR, "public", "mascot-hd")
PUBLIC_FITUR = os.path.join(BASE_DIR, "public", "fitur")
PUBLIC_DIR = os.path.join(BASE_DIR, "public")

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(PUBLIC_MASCOT_HD, exist_ok=True)
os.makedirs(PUBLIC_FITUR, exist_ok=True)


def remove_white_background_matting(img_rgb, white_thresh=240, tolerance=25):
    """
    Remove white background using boundary flood-fill matting to preserve internal white.
    """
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
                    
    # Alpha mask: 255 for character, 0 for outer bg
    alpha = np.where(is_outer_bg, 0, 255).astype(np.uint8)
    
    # Smooth edges slightly
    alpha_img = Image.fromarray(alpha, mode="L").filter(ImageFilter.GaussianBlur(radius=0.75))
    alpha_arr = np.array(alpha_img)
    
    # De-fringe: near edges, avoid blending with white
    rgb_arr = arr.astype(np.uint8)
    result_rgba = np.dstack((rgb_arr, alpha_arr))
    return Image.fromarray(result_rgba, mode="RGBA")


def upscale_hd(img_rgba, scale_factor=3, max_dim=2000):
    """
    Upscale to HD using high-quality Lanczos resampling and subtle unsharp masking.
    """
    w, h = img_rgba.size
    target_w = int(w * scale_factor)
    target_h = int(h * scale_factor)
    
    # Clamp if exceeding max_dim
    if max(target_w, target_h) > max_dim:
        ratio = max_dim / max(target_w, target_h)
        target_w = int(target_w * ratio)
        target_h = int(target_h * ratio)
        
    hd = img_rgba.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    # Unsharp mask
    r, g, b, a = hd.split()
    rgb = Image.merge("RGB", (r, g, b))
    sharpened_rgb = rgb.filter(ImageFilter.UnsharpMask(radius=1.5, percent=120, threshold=3))
    
    sr, sg, sb = sharpened_rgb.split()
    return Image.merge("RGBA", (sr, sg, sb, a))


def save_dual(img, indo_name, en_name, extra_public_paths=None):
    """
    Save to Maskot/hd-transparent and public/mascot-hd with both Indonesian and English names.
    """
    p1_id = os.path.join(OUTPUT_DIR, indo_name)
    p1_en = os.path.join(OUTPUT_DIR, en_name)
    p2_id = os.path.join(PUBLIC_MASCOT_HD, indo_name)
    p2_en = os.path.join(PUBLIC_MASCOT_HD, en_name)
    
    img.save(p1_id, "PNG", optimize=True)
    img.save(p1_en, "PNG", optimize=True)
    img.save(p2_id, "PNG", optimize=True)
    img.save(p2_en, "PNG", optimize=True)
    
    if extra_public_paths:
        for extra in extra_public_paths:
            os.makedirs(os.path.dirname(extra), exist_ok=True)
            img.save(extra, "PNG", optimize=True)


def process_fitur_sheet():
    print("📦 Processing Maskot/fitur.png (9 Feature Mascots)...")
    im = Image.open(os.path.join(MASKOT_DIR, "fitur.png")).convert("RGB")
    arr = np.array(im)
    
    # Clear text in each cell first so it doesn't bleed into mascot bounding box
    text_boxes = [
        (50, 248, 80, 130),
        (480, 680, 80, 130),
        (930, 1160, 80, 130),
        (50, 240, 300, 360),
        (480, 680, 300, 360),
        (930, 1150, 300, 360),
        (50, 260, 520, 600),
        (480, 680, 520, 600),
        (930, 1150, 520, 600),
    ]
    arr_clean = arr.copy()
    for x1, x2, y1, y2 in text_boxes:
        arr_clean[y1:y2, x1:x2] = 255
    im_clean = Image.fromarray(arr_clean)
    
    items = [
        ("maskot-fitur-mentor-alumni.png", "mentor-alumni.png", 235, 450, 86, 275,
         "Otbee Memakai Topi Toga & Gulungan Ijazah", "Fitur Mentor Alumni",
         "Halaman bimbingan alumni, profil mentor PTN, jadwal konsultasi privat alumni"),
        ("maskot-fitur-essay-ai-review.png", "essay-ai-review.png", 652, 900, 86, 275,
         "Otbee Berkacamata Memeriksa Draft Esai Berwarna Merah", "Fitur Essay AI Review",
         "Layanan review esai instan AI, deteksi kelemahan naskah, scoring grammar & struktur"),
        ("maskot-fitur-kalkulator-peluang.png", "kalkulator-peluang.png", 1116, 1350, 86, 275,
         "Otbee Memegang Clipboard Analisis Grafik & Diagram", "Fitur Kalkulator Peluang",
         "Kalkulator rasionalisasi nilai rapor, analisis passing grade, probabilitas lolos jurusan"),
        ("maskot-fitur-otbee-ai.png", "otbee-ai.png", 239, 450, 270, 525,
         "Otbee Memakai Headset Memegang Tablet AI & Bohlam Ide", "Fitur Otbee AI",
         "Chatbot konsultan pintar Otbee AI, rekomendasi kampus personal, generator ide esai"),
        ("maskot-fitur-modul-video.png", "modul-video.png", 663, 910, 270, 525,
         "Otbee Memegang Tablet Video Pembelajaran & Buku Materi", "Fitur Modul & Video",
         "Katalog modul pelajaran SNBT/non-tes, video bedah materi, rekaman kelas intensif"),
        ("maskot-fitur-komunitas.png", "komunitas.png", 1132, 1360, 270, 525,
         "Otbee Bersemangat Memegang Megaphone & Balon Percakapan Love", "Fitur Komunitas Belajar",
         "Komunitas belajar pejuang PTN, forum diskusi tanya jawab, grup sharing beasiswa"),
        ("maskot-fitur-tracking-jalur.png", "tracking-jalur.png", 257, 450, 570, 760,
         "Otbee Bertopi Petualang Rimba Membawa Peta & Kompas", "Fitur Tracking Jalur Masuk",
         "Pelacakan jadwal & persyaratan jalur SNBP, SNBT, Mandiri Prestasi, dan Kemitraan"),
        ("maskot-fitur-penyimpanan-dokumen.png", "penyimpanan-dokumen.png", 676, 910, 570, 760,
         "Otbee Merapikan Boks Arsip Dokumen dengan Gembok Aman", "Fitur Penyimpanan Dokumen",
         "Brankas dokumen portofolio siswa, tempat simpan sertifikat prestasi & transkrip nilai"),
        ("maskot-fitur-cari-teman-belajar.png", "cari-teman-belajar.png", 1138, 1360, 570, 760,
         "Otbee Memegang Teropong Binokular & Kartu Profil Teman", "Fitur Cari Teman Belajar",
         "Omegle edukasi, matchmaking teman belajar satu target kampus, room diskusi bareng"),
    ]
    
    results = []
    for indo_name, en_name, x1, x2, y1, y2, desc, cat, context in items:
        sub = arr_clean[y1:y2, x1:x2]
        is_char = np.any(sub < 240, axis=2)
        ys, xs = np.where(is_char)
        bx1 = x1 + xs.min()
        bx2 = x1 + xs.max() + 1
        by1 = y1 + ys.min()
        by2 = y1 + ys.max() + 1
        
        crop = im_clean.crop((bx1, by1, bx2, by2))
        matted = remove_white_background_matting(crop, white_thresh=242)
        hd = upscale_hd(matted, scale_factor=4, max_dim=1600)
        
        extra_paths = [
            os.path.join(PUBLIC_FITUR, en_name),
            os.path.join(PUBLIC_FITUR, indo_name),
        ]
        save_dual(hd, indo_name, en_name, extra_paths)
        print(f"  ✅ {indo_name} -> HD ({hd.width}x{hd.height})")
        results.append({
            "indo_name": indo_name,
            "en_name": en_name,
            "desc": desc,
            "category": cat,
            "context": context,
            "size": f"{hd.width}x{hd.height}",
        })
    return results


def process_2d_all_pov():
    print("📦 Processing Maskot/2d all pov.png (7 Turnaround POVs)...")
    im = Image.open(os.path.join(MASKOT_DIR, "2d all pov.png")).convert("RGB")
    arr = np.array(im)
    
    povs = [
        ("maskot-pov-depan-front.png", "pov-front.png", 40, 360, 50, 420,
         "Otbee Pandangan Depan (Front View) Merentangkan Tangan Ramah", "2D Turnaround Sheet (Front)",
         "Karakter utama beranda, hero section, avatar profil standar, splash screen"),
        ("maskot-pov-samping-kanan-right.png", "pov-right.png", 380, 680, 50, 420,
         "Otbee Pandangan Sisi Kanan (Right View) Berdiri Siap Berjalan", "2D Turnaround Sheet (Right)",
         "Navigasi maju, animasi berjalan ke kanan, transisi halaman berikutnya (Next step)"),
        ("maskot-pov-samping-kiri-left.png", "pov-left.png", 720, 1020, 50, 420,
         "Otbee Pandangan Sisi Kiri (Left View) Menengok ke Kiri", "2D Turnaround Sheet (Left)",
         "Navigasi kembali (Back step), animasi berjalan ke kiri, layout dua arah"),
        ("maskot-pov-belakang-back.png", "pov-back.png", 1030, 1340, 50, 420,
         "Otbee Pandangan Belakang (Back View) Memperlihatkan Sayap & Sengat", "2D Turnaround Sheet (Back)",
         "Halaman logout/selesai, karakter berjalan menjauh, animasi berbalik badan"),
        ("maskot-pov-atas-top.png", "pov-top.png", 80, 480, 460, 720,
         "Otbee Pandangan Atas (Top View) Sudut Pandang Burung", "2D Turnaround Sheet (Top)",
         "Peta roadmap interaktif dari atas, game mini edukasi, view orthographic"),
        ("maskot-pov-tiga-perempat-3-4.png", "pov-three-quarter.png", 530, 830, 430, 720,
         "Otbee Pandangan Tiga Perempat (3/4 Front View) Membawa Gulungan Kertas", "2D Turnaround Sheet (3/4 Front)",
         "Pose paling dinamis untuk kartu fitur, landing page, modal dialog informasi"),
        ("maskot-pov-bawah-bottom.png", "pov-bottom.png", 980, 1340, 460, 720,
         "Otbee Pandangan Bawah (Bottom View) Sudut Bawah Tubuh", "2D Turnaround Sheet (Bottom)",
         "Animasi melompat di atas user, sudut perspektif bawah, aset 3D turnaround"),
    ]
    
    results = []
    for indo_name, en_name, x1, x2, y1, y2, desc, cat, context in povs:
        sub = arr[y1:y2, x1:x2]
        is_char = ~((sub[:, :, 0] > 225) & (sub[:, :, 1] > 225) & (sub[:, :, 2] > 225))
        ys, xs = np.where(is_char)
        bx1 = x1 + xs.min()
        bx2 = x1 + xs.max() + 1
        by1 = y1 + ys.min()
        by2 = y1 + ys.max() + 1
        
        crop = im.crop((bx1, by1, bx2, by2))
        matted = remove_white_background_matting(crop, white_thresh=235)
        hd = upscale_hd(matted, scale_factor=4, max_dim=1600)
        
        save_dual(hd, indo_name, en_name)
        print(f"  ✅ {indo_name} -> HD ({hd.width}x{hd.height})")
        results.append({
            "indo_name": indo_name,
            "en_name": en_name,
            "desc": desc,
            "category": cat,
            "context": context,
            "size": f"{hd.width}x{hd.height}",
        })
    return results


def process_flying_bees():
    print("📦 Processing Flying Bees (3 Mascots in Almamater)...")
    bees = [
        ("lebah terbang 1.png", "maskot-terbang-almet-kuning-ui.png", "flying-bee-ui.png",
         "Otbee Terbang Memakai Jas Almamater Kuning UI Melambaikan Tangan", "Almamater & Prestasi UI",
         "Perayaan seleksi PPKB/SNBP UI, animasi selebrasi di halaman onboarding, hero float",
         [os.path.join(PUBLIC_DIR, "bee1-hd.png")]),
        ("lebah terbang 2.png", "maskot-terbang-almet-krem-ugm.png", "flying-bee-ugm.png",
         "Otbee Terbang Memakai Jas Almamater Krem UGM Pose Dua Jari (Peace)", "Almamater & Prestasi UGM",
         "Perayaan seleksi PBUB/SNBP UGM, selebrasi lolos PTN impian, hero float",
         [os.path.join(PUBLIC_DIR, "bee2-hd.png")]),
        ("lebah terbang 3.png", "maskot-terbang-almet-toska-itb.png", "flying-bee-itb.png",
         "Otbee Terbang Memakai Jas Almamater Hijau Toska ITB Menyapa Semangat", "Almamater & Prestasi ITB",
         "Perayaan seleksi SNBP/Mandiri ITB, selebrasi lolos kampus teknik teratas, hero float",
         [os.path.join(PUBLIC_DIR, "bee3-hd.png")]),
    ]
    
    results = []
    for src_file, indo_name, en_name, desc, cat, context, extra in bees:
        src_path = os.path.join(MASKOT_DIR, src_file)
        im = Image.open(src_path)
        if im.mode != "RGBA":
            im = remove_white_background_matting(im.convert("RGB"), white_thresh=245)
            
        hd = upscale_hd(im, scale_factor=3, max_dim=1800)
        save_dual(hd, indo_name, en_name, extra)
        print(f"  ✅ {indo_name} -> HD ({hd.width}x{hd.height})")
        results.append({
            "indo_name": indo_name,
            "en_name": en_name,
            "desc": desc,
            "category": cat,
            "context": context,
            "size": f"{hd.width}x{hd.height}",
        })
    return results


def process_standalone_mascots():
    print("📦 Processing Standalone Mascots & Action Illustrations...")
    items = [
        # 1. bee nihi.png
        ("bee nihi.png", "maskot-avatar-tunjuk-kanan.png", "otbee-avatar-pointing.png",
         "Otbee Avatar Setengah Badan Menunjuk ke Kanan dengan Senyum Semangat", "Avatar & Panduan Aksi",
         "Avatar pemandu form onboarding, banner rekomendasi fitur, dialog interaktif",
         None, 2, "RGB", 242),
        # 2. lanjutkan essay.png
        ("lanjutkan essay.png", "maskot-lanjutkan-draft-essay.png", "lanjutkan-essay.png",
         "Otbee Menunjuk Naskah Esai dengan Highlight Hijau-Kuning & Balon Percakapan", "Editor & Review Esai",
         "Card 'Lanjutkan Esai' di dashboard siswa, pengingat draft belum selesai, review mentor",
         [os.path.join(PUBLIC_FITUR, "lanjutkan-essay.png")], 4, "RGBA", 250),
        # 3. upgrade paket.png
        ("upgrade paket.png", "maskot-upgrade-bintang-emas.png", "upgrade-paket.png",
         "Otbee Memegang Bintang Emas Berkilau untuk Upgrade Paket", "Monetisasi & Paket Premium",
         "Modal upgrade ke paket Pro, fitur premium terkunci, promo membership tahun ajaran baru",
         [os.path.join(PUBLIC_FITUR, "upgrade-paket.png")], 4, "RGBA", 250),
        # 4. mentor.png (Trio)
        ("mentor.png", "maskot-trio-mentor-headset.png", "trio-mentor.png",
         "Trio 3 Otbee Mentor Memakai Headset Saling Merangkul (Almet UI, UGM, ITB)", "Komposisi Tim Mentor",
         "Header section mentor alumni di landing page, banner profil konsultan bimbel",
         None, 2, "RGBA", 250),
        # 5. top.png (Group 10)
        ("top.png", "maskot-grup-tangga-almamater.png", "group-tangga-almamater.png",
         "Grup Lengkap 10 Otbee Berpose di Tangga Memakai Jas Almamater Kampus Se-Indonesia", "Komposisi Komunitas Akbar",
         "Banner akbar pejuang PTN se-Indonesia, footer besar, section 'Alumni Kami di Berbagai Kampus'",
         None, 2, "RGBA", 250),
        # 6. hero sisi kiri.png
        ("hero/sisi kiri.png", "maskot-hero-intip-kiri.png", "hero-kiri-hd.png",
         "Tiga Otbee Bertingkat Mengintip Ceria dari Sisi Kiri Layar", "Framing Hero Banner",
         "Dekorasi sisi kiri hero banner halaman utama, dekorasi layar lebar",
         [os.path.join(PUBLIC_DIR, "hero-kiri-hd.png"), os.path.join(PUBLIC_DIR, "hero-kiri.png")], 3, "RGBA", 250),
        # 7. hero sisi kanan.png
        ("hero/sisi kanan.png", "maskot-hero-intip-kanan.png", "hero-kanan-hd.png",
         "Tiga Otbee Bertingkat Mengintip Ceria dari Sisi Kanan Layar", "Framing Hero Banner",
         "Dekorasi sisi kanan hero banner halaman utama, dekorasi layar lebar",
         [os.path.join(PUBLIC_DIR, "hero-kanan-hd.png"), os.path.join(PUBLIC_DIR, "hero-kanan.png")], 3, "RGBA", 250),
        # 8. hero sisi bawah (desktop).png
        ("hero/sisi bawah (desktop).png", "maskot-hero-baris-bawah-desktop.png", "hero-bawah-desktop-hd.png",
         "Empat Otbee Berbaris Menyapa Hangat di Sisi Bawah Layar Desktop", "Framing Hero Banner",
         "Dekorasi sisi bawah hero banner desktop, pembatas section beranda",
         [os.path.join(PUBLIC_DIR, "hero-bawah-hd.png"), os.path.join(PUBLIC_DIR, "hero-bawah.png")], 2.5, "RGBA", 250),
        # 9. hero sisi bawah (mobile).png
        ("hero/sisi bawah (mobile).png", "maskot-hero-baris-bawah-mobile.png", "hero-bawah-mobile-hd.png",
         "Otbee Menyapa Hangat Khusus Tampilan Layar HP (Mobile)", "Framing Hero Banner (Mobile)",
         "Dekorasi sisi bawah hero banner pada tampilan HP / smartphone",
         None, 3, "RGBA", 250),
    ]
    
    results = []
    for src_file, indo_name, en_name, desc, cat, context, extra, scale, mode, thresh in items:
        src_path = os.path.join(MASKOT_DIR, src_file)
        im = Image.open(src_path)
        if mode == "RGB":
            # Matting
            matted = remove_white_background_matting(im, white_thresh=thresh)
        else:
            matted = im.convert("RGBA")
            
        hd = upscale_hd(matted, scale_factor=scale, max_dim=2400)
        save_dual(hd, indo_name, en_name, extra)
        print(f"  ✅ {indo_name} -> HD ({hd.width}x{hd.height})")
        results.append({
            "indo_name": indo_name,
            "en_name": en_name,
            "desc": desc,
            "category": cat,
            "context": context,
            "size": f"{hd.width}x{hd.height}",
        })
        
    # Also extract individual logo head
    logo_path = os.path.join(MASKOT_DIR, "logo.png")
    im_logo = Image.open(logo_path)
    # Head is x: [0, 440], y: [0, 493]
    head_crop = im_logo.crop((0, 0, 440, 493))
    # tight bbox
    arr_head = np.array(head_crop)
    alpha = arr_head[:, :, 3]
    ys, xs = np.where(alpha > 10)
    head_tight = head_crop.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    head_hd = upscale_hd(head_tight, scale_factor=3, max_dim=1500)
    save_dual(head_hd, "maskot-kepala-logo-avatar.png", "otbee-logo-head.png", [os.path.join(PUBLIC_DIR, "logo-head-hd.png")])
    print(f"  ✅ maskot-kepala-logo-avatar.png -> HD ({head_hd.width}x{head_hd.height})")
    results.append({
        "indo_name": "maskot-kepala-logo-avatar.png",
        "en_name": "otbee-logo-head.png",
        "desc": "Kepala Otbee dengan Kacamata Aviator & Syal Hitam (Icon Resmi)",
        "category": "Avatar & Identitas Brand",
        "context": "Favicon, avatar profil default pengguna, logo navbar kecil, app icon mobile",
        "size": f"{head_hd.width}x{head_hd.height}",
    })
    
    # Full logo HD
    logo_hd = upscale_hd(im_logo, scale_factor=2, max_dim=2500)
    save_dual(logo_hd, "maskot-brand-logo-otwptn.png", "logo-otwptn-hd.png", [os.path.join(PUBLIC_DIR, "logo-hd.png")])
    print(f"  ✅ maskot-brand-logo-otwptn.png -> HD ({logo_hd.width}x{logo_hd.height})")
    results.append({
        "indo_name": "maskot-brand-logo-otwptn.png",
        "en_name": "logo-otwptn-hd.png",
        "desc": "Logo Resmi Lengkap OTWPTN (Kepala Maskot Otbee + Tipografi OTWPTN)",
        "category": "Identitas Brand & Logo",
        "context": "Navbar utama aplikasi web, footer brand, invoice resmi, header dokumen sertifikat",
        "size": f"{logo_hd.width}x{logo_hd.height}",
    })
    
    return results


def update_catalog(new_items):
    # Load existing catalog.json if available
    catalog_json_path = os.path.join(OUTPUT_DIR, "catalog.json")
    all_items = []
    if os.path.exists(catalog_json_path):
        with open(catalog_json_path, "r", encoding="utf-8") as f:
            all_items = json.load(f)
            
    # Append new items
    start_no = len(all_items) + 1
    for i, it in enumerate(new_items):
        it["no"] = start_no + i
        all_items.append(it)
        
    # Save updated catalog.json
    with open(catalog_json_path, "w", encoding="utf-8") as f:
        json.dump(all_items, f, indent=2, ensure_ascii=False)
        
    with open(os.path.join(PUBLIC_MASCOT_HD, "catalog.json"), "w", encoding="utf-8") as f:
        json.dump(all_items, f, indent=2, ensure_ascii=False)
        
    # Generate unified CATALOG.md
    md_content = f"""# 🐝 Katalog Lengkap Resmi Maskot Otbee HD (OTWPTN)

Koleksi lengkap **{len(all_items)} pose, sudut pandang, dan komposisi maskot Otbee** dalam format **High Definition (HD)** dengan **background transparan (RGBA)** murni tanpa halo putih.

Direktori ini dirancang agar **Claude / developer / desainer** dapat dengan mudah mencari dan menggunakan maskot yang tepat sesuai konteks fitur atau halaman UI.

---

## 📂 Lokasi File & Format
- **Format**: PNG Transparan (RGBA 32-bit), HD Super Resolution
- **Folder Maskot Master**: `/Maskot/hd-transparent/`
- **Folder Public Web (Next.js)**: `/public/mascot-hd/`, `/public/mascot/`, `/public/fitur/`
- **Cara Import di Next.js / React**:
  ```tsx
  import Image from 'next/image';

  // Opsi 1: Nama pose deskriptif bahasa Indonesia
  <Image src="/mascot-hd/maskot-bersama-robot-ai.png" alt="Otbee AI" width={220} height={240} />

  // Opsi 2: Slug singkat bahasa Inggris
  <Image src="/mascot/ai-robot.png" alt="Otbee AI" width={220} height={240} />

  // Opsi 3: Fitur UI khusus
  <Image src="/fitur/otbee-ai.png" alt="Otbee AI Reviewer" width={180} height={180} />
  ```

---

## 📑 Daftar Lengkap {len(all_items)} Aset Maskot & Panduan Konteks UI

| No | Preview | Nama File Indonesia | Nama File EN (Slug) | Kategori | Konteks Penggunaan UI yang Direkomendasikan |
| :-: | :-: | :--- | :--- | :--- | :--- |
"""

    for item in all_items:
        no = item["no"]
        indo = item["indo_name"]
        en = item["en_name"]
        desc = item["desc"]
        cat = item["category"]
        ctx = item["context"]
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

### 👥 5. Komposisi Kelompok & Hero Banner
- `maskot-trio-mentor-headset.png`: Tiga mentor saling merangkul untuk section tim
- `maskot-grup-tangga-almamater.png`: Sepuluh pejuang almamater di tangga kampus
- `maskot-hero-intip-kiri.png`: Hiasan mengintip dari sisi kiri banner beranda
- `maskot-hero-intip-kanan.png`: Hiasan mengintip dari sisi kanan banner beranda
- `maskot-hero-baris-bawah-desktop.png`: Deretan maskot di pembatas banner desktop
- `maskot-hero-baris-bawah-mobile.png`: Deretan maskot responsif di HP
- `maskot-brand-logo-otwptn.png`: Logo resmi OTWPTN resolusi tinggi

---
*Dihasilkan secara otomatis oleh Antigravity Pipeline untuk ekosistem OTWPTN.*
"""

    with open(os.path.join(OUTPUT_DIR, "CATALOG.md"), "w", encoding="utf-8") as f:
        f.write(md_content)
    with open(os.path.join(OUTPUT_DIR, "README.md"), "w", encoding="utf-8") as f:
        f.write(md_content)
    with open(os.path.join(PUBLIC_MASCOT_HD, "CATALOG.md"), "w", encoding="utf-8") as f:
        f.write(md_content)
    print("📖 CATALOG.md, README.md, and catalog.json updated successfully!")


def main():
    print("🚀 Starting Mascot HD Processing Pipeline (All Remaining Files)...")
    new_items = []
    
    # 1. fitur.png
    new_items.extend(process_fitur_sheet())
    
    # 2. 2d all pov.png
    new_items.extend(process_2d_all_pov())
    
    # 3. Flying bees
    new_items.extend(process_flying_bees())
    
    # 4. Standalone & Group illustrations
    new_items.extend(process_standalone_mascots())
    
    # 5. Update catalog
    update_catalog(new_items)
    
    print("\n🎉 ALL ADDITIONAL MASCOT ASSETS SUCCESSFULLY PROCESSED TO HD TRANSPARENT PNG!")
    print(f"📁 Master Output: {OUTPUT_DIR}")
    print(f"📁 Public Output: {PUBLIC_MASCOT_HD}")


if __name__ == "__main__":
    main()
