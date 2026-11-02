import os
import subprocess
from PIL import Image, ImageDraw

SCREENSHOTS_DIR = "midtrans-docs/screenshots"
ANNOTATED_DIR = "midtrans-docs/annotated"
OUT_HTML = "midtrans-docs/customer_journey.html"
OUT_PDF = "midtrans-docs/Customer_Journey_Midtrans_OTWPTN.pdf"
CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

os.makedirs(ANNOTATED_DIR, exist_ok=True)

# Define red box callouts for relevant steps [x1, y1, x2, y2]
CALLOUTS = {
    # Step 1: Homepage CTA button
    "step_01_homepage.png": [
        [(630, 725, 970, 785), 25, 6],
    ],
    # Step 2: Login form card
    "step_02_login.png": [
        [(650, 130, 1270, 1100), 32, 6],
    ],
    # Step 3: Category filter buttons
    "step_03_kategori.png": [
        [(580, 260, 1340, 340), 25, 6],
    ],
    # Step 4: Product list - "Lihat Detail Paket" on Paket Nectar
    "step_04_product_list.png": [
        [(670, 1020, 950, 1100), 25, 6],
    ],
    # Step 5: Product detail - variant selector and "Add to Shopping Cart" button
    "step_05_product_detail.png": [
        [(1130, 680, 1820, 800), 30, 6],
    ],
    # Step 6: Shopping cart modal - "Proceed To Checkout" button
    "step_06_cart.png": [
        [(650, 893, 1270, 984), 30, 6],
    ],
    # Step 7: Checkout billing information card
    "step_07_checkout_billing.png": [
        [(220, 230, 1180, 720), 30, 6],
    ],
    # Step 8: Payment methods card and submit order button
    "step_08_payment_method.png": [
        [(220, 720, 1180, 1380), 30, 6],
        [(1220, 850, 1700, 940), 30, 6],
    ],
    # Step 9: Midtrans Snap popup with Virtual Account number
    "step_09_midtrans_snap.png": [
        [(565, 215, 1355, 1105), 32, 6],
    ],
    # Step 10: Order summary confirmation and status Lunas
    "step_10_order_summary.png": [
        [(360, 210, 1560, 480), 30, 6],
    ],
}

def annotate_images():
    for filename in sorted(os.listdir(SCREENSHOTS_DIR)):
        if not filename.endswith(".png"):
            continue
        in_path = os.path.join(SCREENSHOTS_DIR, filename)
        out_path = os.path.join(ANNOTATED_DIR, filename)
        im = Image.open(in_path).convert("RGBA")
        
        if filename in CALLOUTS:
            draw = ImageDraw.Draw(im)
            for box, radius, width in CALLOUTS[filename]:
                # Red callout outline
                draw.rounded_rectangle(box, radius=radius, outline=(239, 68, 68, 255), width=width)
        
        im.convert("RGB").save(out_path, quality=95)
        print(f"Annotated: {out_path}")

def build_html():
    html_content = """<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Customer Journey - OtwPTN (PT. Lembaga Sains Nasional)</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 14mm 10mm 14mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      background: #ffffff;
      line-height: 1.4;
      font-size: 10.5pt;
    }
    .page {
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      height: 100%;
      min-height: 270mm;
      padding-bottom: 2mm;
    }
    .page:last-child {
      page-break-after: avoid;
    }
    .main-title {
      font-size: 13pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.01em;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 2.5mm;
      margin-bottom: 3.5mm;
      text-transform: uppercase;
    }
    .step-block {
      margin-bottom: 4mm;
      display: flex;
      flex-direction: column;
    }
    .step-desc {
      font-size: 9.5pt;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 2mm;
      line-height: 1.35;
    }
    .step-desc b {
      color: #000;
    }
    .img-container {
      width: 100%;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      overflow: hidden;
      background: #f9fafb;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .step-img {
      width: 100%;
      height: auto;
      max-height: 105mm;
      object-fit: contain;
      display: block;
    }
    .footer-note {
      margin-top: auto;
      text-align: center;
      font-size: 7.5pt;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
      padding-top: 2mm;
    }
  </style>
</head>
<body>

  <!-- PAGE 1: Steps 1 & 2 -->
  <div class="page">
    <div class="main-title">CUSTOMER JOURNEY - OTWPTN (PT. LEMBAGA SAINS NASIONAL)</div>

    <div class="step-block">
      <div class="step-desc">
        <b>1. Customer mengakses homepage</b> website OtwPTN (https://otwptn.com) untuk mempelajari ekosistem persiapan seleksi PTN non-tes dan katalog layanan.
      </div>
      <div class="img-container">
        <img class="step-img" src="annotated/step_01_homepage.png" alt="Homepage OtwPTN" />
      </div>
    </div>

    <div class="step-block">
      <div class="step-desc">
        <b>2. Customer melakukan login</b> dengan mengakses halaman login, memasukkan alamat email dan password terdaftar, lalu mengklik tombol <b>Masuk Akun</b>.
      </div>
      <div class="img-container">
        <img class="step-img" src="annotated/step_02_login.png" alt="Halaman Login Siswa" />
      </div>
    </div>

    <div class="footer-note">Halaman 1 dari 5 &bull; Alur Pendaftaran & Pembayaran Midtrans &bull; PT. Lembaga Sains Nasional</div>
  </div>

  <!-- PAGE 2: Steps 3 & 4 -->
  <div class="page">
    <div class="main-title">CUSTOMER JOURNEY - OTWPTN (PT. LEMBAGA SAINS NASIONAL)</div>

    <div class="step-block">
      <div class="step-desc">
        <b>3. Customer memilih kategori produk yang ingin dibeli</b> yang dapat diakses pada navigasi katalog website (Semua Program, Bimbingan Mentor Alumni, atau Platform AI).
      </div>
      <div class="img-container">
        <img class="step-img" src="annotated/step_03_kategori.png" alt="Katalog Kategori Produk" />
      </div>
    </div>

    <div class="step-block">
      <div class="step-desc">
        <b>4. Pada halaman Product List, Customer memilih produk yang dibeli</b>, dengan mengklik tombol <b>Lihat Detail Paket</b> (contoh: Paket Nectar Rp 99.000).
      </div>
      <div class="img-container">
        <img class="step-img" src="annotated/step_04_product_list.png" alt="Daftar Paket & Tombol Detail" />
      </div>
    </div>

    <div class="footer-note">Halaman 2 dari 5 &bull; Alur Pendaftaran & Pembayaran Midtrans &bull; PT. Lembaga Sains Nasional</div>
  </div>

  <!-- PAGE 3: Steps 5 & 6 -->
  <div class="page">
    <div class="main-title">CUSTOMER JOURNEY - OTWPTN (PT. LEMBAGA SAINS NASIONAL)</div>

    <div class="step-block">
      <div class="step-desc">
        <b>5. Pada halaman Product Detail, Customer memilih varian jalur target</b> serta jumlah paket yang ingin dibeli. Klik tombol <b>Add to Shopping Cart</b> untuk menambahkan produk ke keranjang.
      </div>
      <div class="img-container">
        <img class="step-img" src="annotated/step_05_product_detail.png" alt="Product Detail & Add to Cart" />
      </div>
    </div>

    <div class="step-block">
      <div class="step-desc">
        <b>6. Cart akan muncul ketika Customer menambahkan produk ke dalam Cart</b>. Klik tombol <b>Proceed to Checkout</b> untuk melanjutkan transaksi pemesanan.
      </div>
      <div class="img-container">
        <img class="step-img" src="annotated/step_06_cart.png" alt="Shopping Cart Modal Drawer" />
      </div>
    </div>

    <div class="footer-note">Halaman 3 dari 5 &bull; Alur Pendaftaran & Pembayaran Midtrans &bull; PT. Lembaga Sains Nasional</div>
  </div>

  <!-- PAGE 4: Steps 7 & 8 -->
  <div class="page">
    <div class="main-title">CUSTOMER JOURNEY - OTWPTN (PT. LEMBAGA SAINS NASIONAL)</div>

    <div class="step-block">
      <div class="step-desc">
        <b>7. Pada halaman checkout, Customer dapat me-review produk yang ingin dibeli</b>, beserta melengkapi informasi identitas siswa (Billing Information & Shipping Address).
      </div>
      <div class="img-container">
        <img class="step-img" src="annotated/step_07_checkout_billing.png" alt="Form Billing Information Checkout" />
      </div>
    </div>

    <div class="step-block">
      <div class="step-desc">
        <b>8. Di halaman yang sama, Customer memilih metode pembayaran</b> yang diproses melalui Midtrans (BCA VA, Mandiri VA, BNI VA, BRI VA, Permata VA, QRIS, atau Kartu Kredit).
      </div>
      <div class="img-container">
        <img class="step-img" src="annotated/step_08_payment_method.png" alt="Pilihan Metode Pembayaran Midtrans" />
      </div>
    </div>

    <div class="footer-note">Halaman 4 dari 5 &bull; Alur Pendaftaran & Pembayaran Midtrans &bull; PT. Lembaga Sains Nasional</div>
  </div>

  <!-- PAGE 5: Steps 9 & 10 -->
  <div class="page">
    <div class="main-title">CUSTOMER JOURNEY - OTWPTN (PT. LEMBAGA SAINS NASIONAL)</div>

    <div class="step-block">
      <div class="step-desc">
        <b>9. Klik Submit Order untuk melanjutkan pembayaran. Muncul interface pop-up Midtrans Snap</b> yang menampilkan nomor Virtual Account bank / QRIS untuk pembayaran secara real-time.
      </div>
      <div class="img-container">
        <img class="step-img" src="annotated/step_09_midtrans_snap.png" alt="Pop-up Antarmuka Midtrans Snap" />
      </div>
    </div>

    <div class="step-block">
      <div class="step-desc">
        <b>10. Apabila transaksi sudah selesai, akan tampil halaman Thank You / Order Summary</b> yang memuat nomor invoice resmi, status lunas, rincian produk, dan tombol akses ke dashboard belajar.
      </div>
      <div class="img-container">
        <img class="step-img" src="annotated/step_10_order_summary.png" alt="Halaman Konfirmasi Thank You & Order Summary" />
      </div>
    </div>

    <div class="footer-note">Halaman 5 dari 5 &bull; Alur Pendaftaran & Pembayaran Midtrans &bull; PT. Lembaga Sains Nasional</div>
  </div>

</body>
</html>
"""
    with open(OUT_HTML, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Generated HTML template: {OUT_HTML}")

def convert_html_to_pdf():
    abs_html = os.path.abspath(OUT_HTML)
    abs_pdf = os.path.abspath(OUT_PDF)
    print(f"Generating PDF via Google Chrome headless...")
    cmd = [
        CHROME_BIN,
        "--headless",
        f"--print-to-pdf={abs_pdf}",
        "--no-pdf-header-footer",
        "--print-to-pdf-no-header",
        f"file://{abs_html}",
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if os.path.exists(abs_pdf):
        size_kb = os.path.getsize(abs_pdf) / 1024
        print(f"SUCCESS! Created PDF document at:\n  {abs_pdf} ({size_kb:.1f} KB)")
    else:
        print(f"Failed to generate PDF: {res.stderr.decode()}")

if __name__ == "__main__":
    annotate_images()
    build_html()
    convert_html_to_pdf()
