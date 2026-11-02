import os
import subprocess
import time

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT_DIR = "midtrans-docs/screenshots"

STEPS = [
    {
        "id": "step_01_homepage",
        "url": "http://localhost:3000/",
        "window_size": "1280,820",
    },
    {
        "id": "step_02_login",
        "url": "http://localhost:3000/login",
        "window_size": "1280,820",
    },
    {
        "id": "step_03_kategori",
        "url": "http://localhost:3000/katalog",
        "window_size": "1280,820",
    },
    {
        "id": "step_04_product_list",
        "url": "http://localhost:3000/katalog",
        "window_size": "1280,950",
    },
    {
        "id": "step_05_product_detail",
        "url": "http://localhost:3000/paket/nectar",
        "window_size": "1280,880",
    },
    {
        "id": "step_06_cart",
        "url": "http://localhost:3000/paket/nectar?cart=1",
        "window_size": "1280,900",
    },
    {
        "id": "step_07_checkout_billing",
        "url": "http://localhost:3000/checkout?tier=nectar",
        "window_size": "1280,880",
    },
    {
        "id": "step_08_payment_method",
        "url": "http://localhost:3000/checkout?tier=nectar",
        "window_size": "1280,950",
    },
    {
        "id": "step_09_midtrans_snap",
        "url": "http://localhost:3000/checkout?tier=nectar&snap=1",
        "window_size": "1280,880",
    },
    {
        "id": "step_10_order_summary",
        "url": "http://localhost:3000/checkout/summary?order_id=OTW-2026-88192&tier=nectar&name=Arvel%20Valerian&payment_method=bca_va&amount=99000",
        "window_size": "1280,900",
    },
]

def capture_all():
    os.makedirs(OUT_DIR, exist_ok=True)
    for s in STEPS:
        out_file = os.path.join(OUT_DIR, f"{s['id']}.png")
        print(f"Capturing {s['id']} from {s['url']}...")
        cmd = [
            CHROME_BIN,
            "--headless=new",
            f"--screenshot={out_file}",
            f"--window-size={s['window_size']}",
            "--hide-scrollbars",
            "--force-device-scale-factor=1.5",
            "--run-all-compositor-stages-before-draw",
            s['url'],
        ]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if os.path.exists(out_file):
            size_kb = os.path.getsize(out_file) / 1024
            print(f"  -> Saved {out_file} ({size_kb:.1f} KB)")
        else:
            print(f"  -> Failed to capture {s['id']}: {res.stderr.decode()}")
        time.sleep(0.5)

if __name__ == "__main__":
    capture_all()
