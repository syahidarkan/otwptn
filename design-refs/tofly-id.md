# tofly.id — Design Reference Notes

Source: https://tofly.id (scraped 2026-10-26)

---

## Overall Palette

- **Primary brand**: Orange-amber (#F59E0B or #EAA000) for CTAs
- **Secondary accent**: Blue (#1A6FE8 or #2563EB) for section highlights, active states, headings
- **Background**: White (#fff) — pure white base, no off-white pattern
- **Hero bg**: Light sky-blue (#E8F0FF or similar pastel)
- **Dark section**: Deep blue (#1A6FE8) for "tryout" progress section — NOT black
- **Text**: Dark navy (#0F172A) for headings
- **Cards**: White with subtle `shadow-sm` and `rounded-2xl`

---

## Navigation

- **Layout**: Full-width but the nav container has `rounded-xl` shape with `shadow-md` — looks like a floating card sitting on the page
- **Logo**: Penguin mascot + "tofly" in dark blue/navy, inline
- **Links**: Center-aligned text links — Coba soal, Fitur, Harga, Testimoni, FAQ
- **CTA**: "Daftar gratis" — orange rounded-full button (right side)
- **No sticky glass effect** — it simply stays at the top
- **Separation from content**: The nav card has its own white background and shadow, creating visual separation from hero without blur

**Pattern for otwptn**: Floating pill/card nav with shadow. No blur needed.

---

## Hero Section

- **Background**: Pastel sky-blue with scattered white cloud SVGs in corners and edges
- **Layout**: Centered text, mascot character on the right bottom corner
- **H1**: Very large bold (100px+), dark navy — multi-line: "Tryout TOEFL ITP pertamamu," then "gratis, hari ini." in blue accent
- **Floating UI chips**: Small rounded cards floating at the sides
  - Left: "Structure / The committee ____ the proposal." — quiz snippet
  - Right: "Listening" + audio bar visualization
  - These are decorative product preview elements — NOT screenshots
- **Mascot**: Penguin character with "tofly." flag, bottom-right
- **Two CTAs**: 
  - Primary: "Ambil 5 token gratis →" — orange rounded-full, solid fill
  - Secondary: "Coba 3 soal dulu" — white/ghost, same size, outlined

**Pattern for otwptn hero**: Colored (non-white) hero bg, floating UI snippet chips, two CTAs (primary solid + secondary ghost).

---

## Quiz Demo Section (scrolled into)

- **Background**: White
- **Split layout**: 50/50
  - **Left (1/2)**: Quiz card — rounded-2xl, white bg, shadow
    - Breadcrumb: "Structure · 1/3" pill tag + "Soal 1"
    - Question text in large readable font
    - 4 answer options as outlined rectangular cards (A, B, C, D)
    - Footer: "Soal N dari 20" + "Soal berikutnya →" button (blue pill)
  - **Right (1/2)**: AI Chat panel — rounded-2xl, white bg, shadow
    - Avatar (mascot) + "Tobi" name + "TUTOR AITOFLY" badge
    - Context breadcrumb: "Konteks: Structure · Soal 1"
    - Chat bubbles
    - Suggestion chips below chat
    - Input field at bottom with send button (blue icon)

**Pattern for otwptn essay/otbee**: Split card layout — editor/content on left, AI panel on right.

---

## "Tryout yang rasanya kayak ujian asli" Section

- **Background**: Full-width blue (#1A6FE8) — very prominent
- **Heading**: White, large bold
- **Subtext**: White, normal weight
- **Progress timeline**: Orange line/bar spanning full width with a draggable handle
- **Section tabs**: Three cards below the progress bar (Listening, Structure, Reading status)
  - Each tab: rounded-xl, dark blue bg with light text
  - Status labels: "Selesai" / "Berjalan" / "Terkunci"
  - Small icon per tab (headphones / pencil / book)

---

## Score Dashboard ("Rekap") Section

- **Background**: White
- **Layout**: Two-level grid
  - **Top row**: Large primary score card (1/3 width) + 3 subscore cards (2/3 width)
    - Primary card: Blue bg (#1A6FE8), large white score number ("557"), improvement badge
    - Subscore cards: white bg, icon (headphones/pencil/book), score number, "X benar" detail, progress bar
  - **Bottom row**: Two 50/50 cards
    - "Tren Skor Tryout": line chart with score progression over 4 tryouts
    - "Area Kelemahanmu": ranked list with topic + error count + chevron

**Pattern for otwptn dashboard**: Blue accent primary stat card + supporting white subcards. Progress trend chart.

---

## Features Tab Section ("Fitur")

- **Background**: White or very light gray
- **Layout**: 50/50 split
  - **Left (1/2)**: Vertical tab list
    - Each tab: rounded-xl card with icon (square) + title (bold) + description
    - Selected tab: Has blue left-border accent or elevated shadow
    - Tabs listed vertically — Review dengan Tobi, Simulasi Tryout, Latihan Reading, Latihan Structure
  - **Right (1/2)**: Large app screenshot
    - Blue rounded frame (`rounded-2xl`) containing the screenshot
    - Screenshot shows the actual app UI

**Pattern for otwptn feature section**: Vertical tab list on left, large screenshot/demo on right. Blue-framed screenshot.

---

## Pricing Panel

- **Background**: Light gray or off-white
- **Single pricing tier shown** (not multi-column)
- **Layout**: One wide card, split 50/50 inside:
  - **Left**: 
    - "Premium" label (blue, bold)
    - Large price: "Rp 109.000" + "/ 3 bulan" small
    - Sub-label: "Setara Rp 36.333 per bulan..."
    - CTA button: "Mulai Premium →" — orange pill
    - Free-tier reminder link: "atau coba gratis dulu dengan 5 token"
    - Trust micro-copy: two rows with icons — "Aktif langsung setelah bayar" + "Bayar lewat Midtrans" + "Tetap bisa pakai jalur gratis"
  - **Right**:
    - "Yang kamu dapat" heading
    - Checklist (✓ in blue circles): 5 feature bullets
    - Info box below: "Jalur gratis tetap ada" — bordered card with explanation
- **Container**: Rounded-2xl, subtle border, white bg

**Pattern for otwptn pricing**: For a tier card, split it 50/50 — price/CTA left, features right. Not stacked.

---

## Testimonials

- **Layout**: Horizontal scrolling row (like a marquee or overflow-auto strip)
- **Cards**: White, rounded-2xl, shadow-sm, ~280-320px wide
- **Contents**: Name + role (small text, like "Mahasiswa tingkat ak...") + long quote
- **No avatar images shown** — just text
- **Quote style**: Quoted text in normal weight with quotation marks, no big "blockquote" styling
- **Card height**: Tall — quote can be 2-4 lines

**Pattern for otwptn testimonials**: Horizontal scroll row of text-only quote cards. No star ratings, no photos.

---

## FAQ

- **Heading**: Large bold on left: "Yang sering ditanya sebelum mulai." with subtext below
- **Accordion list**: Right side (or full-width below heading)
- **Item style**: Numbered (01, 02, etc.) + question text + (+/✕) toggle button (rounded, outlined)
- **Divider**: Thin horizontal line between items
- **Open state**: Answer text expands below question

**Pattern for otwptn FAQ**: Numbered accordion with numbered index, question, and +/✕ toggle.

---

## Footer

- **Background**: White (NOT dark) — stark contrast to pintarly's dark footer
- **Logo**: Mascot + "tofly" wordmark
- **Tagline**: Short platform description (~2 lines)
- **3 columns**: Sitemap | Contact | Mascot illustration (decorative)
  - Sitemap: Panduan TOEFL, Tentang, Fitur, Harga Paket, FAQ
  - Contact: Twitter, Instagram (text links only)
- **Mascot**: Tobi illustration (decorative, top-right)
- **Bottom bar**: Thin separator, "© 2026 TOFLY — ALL RIGHTS RESERVED" + Privacy Policy + Terms of Service links (right-aligned)

**Pattern for otwptn footer**: otwptn spec calls for dark footer → reference pintarly's dark footer, NOT tofly's light one.

---

## Key Patterns to Steal for otwptn

1. **Split 50/50 layout** — quiz left + AI chat right; feature list left + screenshot right
2. **Floating UI snippet chips** on hero — small rounded cards showing product snippets
3. **Two CTAs on hero** — solid primary + ghost secondary, same size
4. **Vertical tab list + app screenshot** for feature showcase
5. **Numbered accordion FAQ** — numbered index, not just bullets
6. **Blue-framed screenshot** — `rounded-2xl bg-blue-600` container around app screenshot
7. **Horizontal scroll testimonials** — no photos, just names + quotes + roles
8. **Score dashboard layout** — large primary stat card + grid of sub-cards
