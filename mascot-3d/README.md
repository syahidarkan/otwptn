# 🐝 OTWPTN 3D Mascot Studio & Pipeline

Folder khusus ini dibuat terpisah agar **tidak mengubah file apapun** di codebase utama OTWPTN.

Di sini kamu memiliki ekosistem lengkap untuk mengubah karakter maskot lebah 2D menjadi **Fully 3D Object** yang identik dengan gambar aslinya.

---

## 🚀 1. Interactive 3D Mascot Studio (Three.js)

Studio Web 3D interaktif sudah dibuat dan sedang aktif berjalan di komputer kamu:
👉 **Akses di Browser:** [http://localhost:8089](http://localhost:8089)

### Fitur Studio:
- **3D Model Maskot**: Model 3D lebah lengkap dengan kacamata reticle goggle, bandana leher, tas selempang, sayap bergetar, mata kawaii, dan garis belang lebah.
- **Preset Sudut Pandang Turnaround**: Klik satu tombol untuk melihat dari sudut **Front, 3/4 Front, Right, Left, Back, Top**.
- **Komparasi 2D Reference**: Panel samping menampilkan gambar referensi 2D asli (HD Front, 3/4 View, Front, Right, Back, Top, Bottom) untuk mencocokkan kemiripan secara langsung.
- **Export .GLB**: Tombol satu klik untuk mengekspor model 3D menjadi file `.glb` standar (siap dipakai di web, Unity, Unreal Engine, Blender, dll).
- **Drag & Drop Model Inspector**: Kamu bisa men-drag file `.glb` atau `.gltf` apa pun (misalnya hasil AI dari Tripo/Meshy atau export dari Blender) ke browser dan model langsung di-render secara interaktif dengan pencahayaan studio.

---

## 🎨 2. Cara Menghasilkan Model 3D yang 100% Sama Persis (AI 3D Pipeline)

Karena kamu sudah memiliki turnaround sheet lengkap di `references/2d all pov.png`, kamu bisa menghasilkan mesh 3D yang sangat mulus dalam 30–60 detik menggunakan AI Image-to-3D terbaik:

### Pilihan Terbaik (Gratis / Instant):
1. **[Tripo3D](https://www.tripo3d.ai)** ⭐ *(Direkomendasikan)*
   - Buka `https://www.tripo3d.ai`.
   - Upload file `mascot-3d/references/bee_hd_front.png` atau `three_quarter.png`.
   - AI akan langsung membuat mesh 3D lengkap dengan tekstur PBR.
   - Ada fitur **Auto-Rig & Animation** (bisa bikin lebah berjalan, terbang, melambai).
   - Download sebagai `.glb`, lalu drag ke Studio [http://localhost:8089](http://localhost:8089).

2. **[Meshy.ai](https://www.meshy.ai)** *(Mendukung Multi-View)*
   - Buka `https://www.meshy.ai`.
   - Pilih mode **Text/Image to 3D**. Meshy mendukung input multi-view: kamu bisa memasukkan sekaligus `front.png`, `back.png`, dan `right.png` yang sudah kami siapkan di folder `mascot-3d/references/`.
   - Download sebagai `.glb`.

3. **[Rodin (Hyper3D)](https://hyper3d.ai)**
   - Khusus untuk karakter kartun / maskot game-ready dengan kualitas topologi yang sangat rapi.

### Open-Source GitHub Repositories:
Jika ingin menjalankan model AI 3D secara lokal (membutuhkan GPU / Python):
- **TRELLIS (Microsoft)**: [https://github.com/microsoft/TRELLIS](https://github.com/microsoft/TRELLIS) - Model AI 3D state-of-the-art dari Microsoft dengan detail geometri dan PBR tinggi.
- **Hunyuan3D-2 (Tencent)**: [https://github.com/Tencent/Hunyuan3D-2](https://github.com/Tencent/Hunyuan3D-2) - Generator 3D generasi terbaru untuk karakter/objek beresolusi tinggi.
- **TripoSR**: [https://github.com/VAST-AI-Research/TripoSR](https://github.com/VAST-AI-Research/TripoSR) - Fast feedforward 3D reconstruction model dari Stability AI & Tripo.

---

## 🛠️ 3. Blender Automation Pipeline

Jika kamu ingin memoles atau memahat (sculpting) secara manual di Blender:

1. Kami sudah menyiapkan script otomatisasi: `mascot-3d/scripts/build_mascot_blender.py`.
2. Cara pakai:
   - Buka **Blender**.
   - Masuk ke tab **Scripting** -> Buka file `mascot-3d/scripts/build_mascot_blender.py` -> Klik **Run Script**.
   - Script ini otomatis:
     - Mengimpor gambar referensi turnaround orthographic (Front, Right, Back, Top) tepat pada koordinat 3D.
     - Menyusun blockout geometri dasar karakter (Head, Body, Goggles, Bandana, Wings, Stinger).
     - Menyiapkan material kartun siap render.
   - Setelah selesai diedit di Blender, export ke `File -> Export -> glTF 2.0 (.glb)`.
   - Drag file hasil export ke [http://localhost:8089](http://localhost:8089) untuk langsung dilihat di web.

---

## 📁 4. Struktur Folder `mascot-3d/`

```
mascot-3d/
├── index.html                  # Web Studio Three.js (Viewer, Turnaround Presets, Drag & Drop, GLB Exporter)
├── src/
│   └── mascot-model.js         # Procedural 3D Mascot class (Three.js geometry, materials, animation)
├── references/                 # Gambar referensi yang sudah dipotong per sudut
│   ├── bee_hd_front.png        # Tampak depan resolusi tinggi
│   ├── front.png               # Orthographic Front
│   ├── right.png               # Orthographic Right
│   ├── left.png                # Orthographic Left
│   ├── back.png                # Orthographic Back
│   ├── top.png                 # Orthographic Top
│   ├── bottom.png              # Orthographic Bottom
│   └── three_quarter.png       # 3/4 Front Angle
├── scripts/
│   └── build_mascot_blender.py # Script otomasi setup scene & referensi untuk Blender
└── README.md                   # Dokumentasi panduan ini
```
