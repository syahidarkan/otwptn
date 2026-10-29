# otwptn Season 2 — Design Synthesis

Compiled 2026-10-26. Maps each homepage section to a specific reference pattern.

---

## Section → Reference Mapping

### 1. Notice Bar
**Reference**: pintarly.id top strip
**Pattern**: Full-width dark/accent strip (~40px), centered text with icon + CTA link, ✕ close button
**otwptn adaptation**: Use `--dark` (#1a1a1a) or `--accent` (#ffd400) bg. If yellow: dark text. If dark: white text. Text: latest batch announcement or deadline reminder.

### 2. Header / Nav
**Reference**: pintarly.id + tofly.id hybrid
**Pattern**: 
- Default: full-width white nav, logo left, links center (max 4-5), CTAs right
- On scroll: shrinks to a floating pill (`rounded-2xl`, `shadow-md`, `bg-white`) containing logo + "Masuk" (text) + "Daftar" (yellow pill button)
- NO glass blur on nav — pure white background
- Logo: "otwptn" wordmark (bold, dark) — no mascot needed
**otwptn adaptation**: Links = Jalur, Fitur, Harga, Komunitas. CTAs = "Masuk" (ghost) + "Daftar" (yellow pill).

### 3. Hero
**Reference**: pintarly.id hero (primary) + tofly.id (floating chips idea)
**Pattern**:
- Centered, full-viewport
- Background: soft gradient blob — yellow (#ffd400 at 20-30% opacity) radiating from top-right, fading to white
- H1: Very large (≥72px, weight 800), black — headline that punches the problem/solution
- Animated word cycle: pill with glass blur cycling through jalur types
- Subtext: ~16px, centered, muted
- TWO CTAs: "Mulai Sekarang" (yellow pill primary) + "Lihat Jalur" (ghost secondary)
- Floating chips: 2-3 small rounded cards showing product snippets (e.g., essay score, kalkulator result, community message preview)
- Three.js: subtle particle or geometric mesh behind the gradient, responds to cursor

**otwptn adaptation**: Headline = "Lolos PTN Non-Tes, Bukan Keberuntungan." or similar. Cycle = "PPKB UI", "SJB UGM", "SNBP Unpad".

### 4. Kenapa otwptn
**Reference**: pintarly.id "Kenapa Belajarmu Masih Gitu-gitu Aja?" section
**Pattern**:
- Centered H2 with **yellow wavy underline** on key phrase (CSS/SVG)
- 3-column pain-point cards: off-white bg (#f5f5f0), rounded-2xl, no border
- Card: illustration/icon top, bold title, 2-3 line description
- Do NOT use emoji icons — use SVG illustrations or Lucide icons in a styled container
- Each card addresses a specific student pain point (e.g., "Ga Tau Harus Mulai Dari Mana", "Essay-ku Ga Ada Yang Review", "Bingung Milih Jalur")

### 5. Direktori Jalur Preview
**Reference**: aimasukptn.com category chips + pintarly.id card grid
**Pattern**:
- H2 section heading
- Category chips row (jalur type filters): PPKB, Jalur Prestasi, Jalur Essay, Jalur Hybrid — pill chips with color coding (yellow/green/purple from brand tokens)
- Below: a preview list of 4-6 PTN entries per selected jalur
- Each entry: PTN name, jalur name, jalur type tag (color-coded), keketatan level, "Lihat Detail →" link
- CTA at bottom: "Lihat Semua Jalur →" button

### 6. Fitur Platform
**Reference**: tofly.id "Fitur" section (vertical tab list + screenshot)
**Pattern**:
- H2 centered heading
- 50/50 split:
  - Left: Vertical list of 4-5 feature tabs (icon + title + short desc)
  - Selected tab: blue left-border accent
  - Right: Large app screenshot in `--accent` (#ffd400) colored frame/container
- Features: AI Essay Reviewer, Opportunity Kalkulator, Otbee AI, PTN Direktori, Komunitas

### 7. Otbee AI Showcase
**Reference**: tofly.id quiz+chat split layout
**Pattern**:
- This is a SECTION on the homepage, NOT a floating widget
- H2: "Otbee — AI Konsultan PTN-mu"
- Background: `--bg-alt` (#f5f5f0)
- 50/50 split card:
  - Left: Example user question card + Otbee's answer preview
  - Right: List of 3-4 example prompts as pill chips ("Jurusanku cocok buat PPKB UI?", "Review sertifikatku dong", etc.)
- CTA: "Coba Otbee Gratis →" (yellow pill)

### 8. Komunitas Preview
**Reference**: pintarly.id komunitas + tofly.id testimonials (horizontal scroll)
**Pattern**:
- Show the community as an active, real place
- Background: white
- H2 heading
- Two side-by-side previews: Chat channel list (left) + Recent posts (right)
- OR: Horizontal scroll of real/example posts from community
- CTA: "Bergabung ke Komunitas" (ghost button)

### 9. Pricing
**Reference**: tofly.id pricing panel (50/50 split inside a card)
**Pattern**:
- Light gray section background
- 4 tier cards in a row (or 2x2 on mobile)
- Each card: tier name, price, CTA button, feature list
- Popular tier: slightly elevated, yellow border, "TERPOPULER" badge
- Card structure inside each: tier name (top), price large, CTA button, then features list
- NOT 3-column stat grid — use actual feature bullets with ✓ checkmarks

### 10. Testimonials
**Reference**: tofly.id horizontal scroll testimonials + pintarly.id tweet-style cards
**Pattern**:
- Horizontal scrolling row
- White cards, rounded-2xl, shadow-sm, ~300px wide
- Contents: Name, role/school label, short quote text
- NO stock-photo avatars. Use first initial in a colored circle OR leave it out.
- 6-8 cards minimum

### 11. Tim Mentor
**Reference**: tofly.id's clean card layout (adapted)
**Pattern** (design independently from reference):
- H2: "Tim Mentor otwptn"
- Simple 3-column grid of mentor "cards"
- Each card: initials avatar (colored circle), name, background/specialization (1 line), university alumni label
- No profile photos — consistent initials-only avatars
- Off-white bg cards
- Do NOT use 3D illustrations or mascots

### 12. FAQ
**Reference**: tofly.id numbered accordion
**Pattern**:
- H2 heading on left: "Yang sering ditanyakan"
- Numbered accordion on right or full-width
- Numbered index (01, 02, 03...) + question + +/✕ toggle
- Thin horizontal dividers between items
- No box cards — just lines

### 13. Footer
**Reference**: pintarly.id dark multi-column footer
**Pattern**:
- Dark background (`--dark` = #1a1a1a)
- Multi-column: Logo+tagline | Links col 1 | Links col 2 | Links col 3 | Social
- Logo: "otwptn" wordmark in white
- Tagline: short description
- Columns: Platform, Jalur, Dukungan, Ikuti Kami
- Social: Instagram, TikTok, YouTube links
- Bottom bar: © 2026 otwptn · Syarat & Ketentuan · Kebijakan Privasi

---

## Anti-Patterns (Explicitly Banned)

These patterns were checked against all three references and confirmed as AI-slop:

- ❌ Floating gradient orbs/blobs as decoration
- ❌ Stats bar: "500+ mentee | 87% lolos | 3 bulan | 20 mentor" in columns
- ❌ Generic 3-icon "How It Works" rows with numbered circles
- ❌ Bento grid with shallow cards
- ❌ Hero with laptop mockup or fake browser chrome
- ❌ Trust badge strip with partner logos (pintarly does this but it's a large product — skip for otwptn)
- ❌ Dark mode toggle (otwptn is light-only)
- ❌ Emoji as icons anywhere

---

## GSAP Animation Notes

Based on reference site patterns:

- **Nav hide/show**: GSAP-powered on scroll direction — hide on scroll down, show on scroll up
- **Section entrance**: `gsap.from()` with `y: 40, opacity: 0` and ScrollTrigger `start: "top 80%"`
- **Staggered card lists**: `gsap.from(cards, { stagger: 0.1, y: 30, opacity: 0 })`
- **Pricing card hover**: `gsap.to(card, { y: -4, boxShadow: "..." })` on mouseenter
- **Hero text**: SplitText or word-by-word stagger for heading entrance

## Three.js Notes

- Use in hero ONLY
- Pattern: subtle particle field or abstract mesh, very low opacity
- Responds to mouse cursor (gentle parallax, not aggressive)
- Falls back gracefully on mobile (disable or reduce particle count)
- Color: `#ffd400` particles at 20-30% opacity against white/gradient bg
- Library: Three.js r158+, loaded as dynamic import client-side

## Remotion Notes

- Use for ONE section: either hero animated background OR a product explainer section
- If product explainer: show the flow (user types essay → AI reviews → score appears)
- Output as `<video autoplay loop muted playsInline>` with `.webm` format
- Keep under 5 seconds, 30fps, no audio
