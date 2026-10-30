# pintarly.id - Design Reference Notes

Source: https://pintarly.id (scraped 2026-10-26)

---

## Overall Palette

- **Background**: White (#fff) base; hero uses a soft yellow-to-lime-green radial gradient blob
- **Accent**: Warm yellow (#FFD400-ish) - used on the primary CTA button, section underlines, comparison-table highlights
- **Dark**: Near-black (#111 / #1a1a1a) - used for dark CTA section and footer
- **Text**: Very dark (near-black), body is normal weight
- **Cards**: Off-white (#f5f5f0 or #f7f7f7) - no border, just background fill
- **Muted text**: Gray ~#737373

---

## Announcement Bar (top strip)

- Dark teal/emerald gradient strip: `from-teal-700 to-green-500` or similar
- White text: "Gabung Channel WhatsApp Pintarly →"
- WhatsApp icon on left
- ✕ close button on right
- Height: ~40px, full-width

---

## Navigation

- **Layout**: Full-width white bar, logo left, links center, CTAs right
- **Logo**: Mascot illustration + "Pintarly" wordmark (bold, dark)
- **Links**: Plain text (no underlines), horizontal row - Produk (with chevron dropdown), Hiring, Download, Business
- **Right CTAs**: "Masuk" (ghost text link) + "Daftar" (yellow rounded-full pill button, dark text, ~px-5 py-2)
- **Sticky behavior**: Appears to float as a pill on scroll - the nav shrinks and shows only logo + Masuk + Daftar in a rounded-2xl white card with shadow. This is the key pattern: **floating pill nav on scroll**.
- **No glass/blur on nav** - pure white when floating.

---

## Hero Section

- **Background**: Soft gradient blob - yellow at top-right, lime-green at bottom-left - on white. NOT a standard white bg.
- **Layout**: Centered, single column, full viewport height
- **H1**: Extremely large (≥72px), black, heavy weight (700–800) - "Ubah Materi Belajarmu Jadi" followed by an animated word-cycle pill below
- **Animated word pill**: Rounded pill with blurred/frosted glass look showing cycling words - subtle glass morphism HERE is acceptable
- **Subtext**: Normal weight, smaller, centered, ~16px
- **CTA**: Single yellow pill button "⚡ Mulai Belajar Sekarang" - centered, full-rounded, yellow bg, dark text, with icon

**Pattern for otwptn**: Bold centered heading, one CTA, gradient background blob (soft, not aggressive).

---

## Audience Cards Section ("Kamu lagi belajar untuk apa?")

- 3-column grid (or 2-row 3-col = 6 cards)
- Each card: off-white rounded-2xl, mascot illustration top, category label (caps, small), bold title, short description, "Mulai belajar →" link
- Clean, generous padding, no border
- Below: 3 smaller tile pills for sub-categories

**Pattern for otwptn**: Grid of cards for jalur types or feature areas. Off-white bg cards, mascot/icon top, title, desc, link.

---

## "Kenapa" Section (Pain Points)

- **Section heading**: Centered, H2-sized, bold - "Kenapa Belajarmu Masih Gitu-gitu Aja?" - last word/phrase underlined with a wavy yellow underline drawn via CSS/SVG
- **Layout**: 3-column card row
- **Cards**: Off-white bg (#f5f5f0), rounded-2xl, no border, generous padding (~p-8)
- **Card contents**: GIF/animated illustration top, H3 title (bold), short paragraph body text
- **No icons from icon libraries** - uses custom illustrations/GIFs

**Pattern for otwptn "Kenapa otwptn"**: Centered heading with yellow accent underline, 3-column pain-point cards with illustration + title + body.

---

## Feature Tabs Section ("Catatan pintar, otomatis")

- **Tabs**: Small circular icon tabs in a horizontal row (like mode switcher: Catatan, Kuis, Flashcards, Podcast, Video, Game)
- **Selected tab**: highlighted circle, small dot pagination below tabs
- **Left col**: H3 heading + description + "Lihat selengkapnya →" link
- **Right col**: Large product screenshot/mockup in a floating card with subtle shadow
- **Background**: Light off-white

**Pattern for otwptn "Fitur Platform"**: Horizontal icon tab switcher, left text, right screenshot.

---

## Comparison Table ("Masih Mau Belajar Cara Lama?")

- **Heading**: "Masih Mau Belajar" plain text + "Cara Lama?" wrapped in a **yellow highlighted rectangle** (like a highlighter pen)
- **Table structure**: Contained in a rounded-2xl card with subtle border
- **3 columns**: Fitur | Cara Lama | Dengan Pintarly
- **Cara Lama**: ✗ (red X icon) + gray italic text
- **Dengan Pintarly**: ✓ (green check icon) + dark text
- Rows separated by light horizontal dividers

**Pattern for otwptn comparison**: Use highlighted/marker rectangle on headings. Table with ✗/✓ comparison.

---

## Testimonials

- **Card style**: White card, rounded-xl, shadow-sm
- **Contents**: Circular avatar (top-left), display name (bold), @handle (gray), tweet text, X logo icon (top-right, links to original tweet)
- **Layout**: Horizontal scrolling row or 3-column grid
- **No star ratings** - just raw tweet-style quotes

---

## Dark CTA Section ("Mereka Udah Mulai. Kamu Kapan?")

- **Background**: Near-black (#111 or #0f0f0f)
- **Heading**: White "Mereka Udah Mulai." + accent yellow "Kamu Kapan?" on same or next line
- **Stats**: Two very large numbers (1,000,000+ and 92%) side by side, white, bold
- **Below stats**: small label text in muted gray

**Pattern for otwptn**: Dark section with white + yellow headline, large stat numbers.

---

## FAQ

- **Heading**: H2, centered or left-aligned
- **Items**: Full-width rows, each with question text + chevron/plus icon (right-aligned)
- **Open state**: Chevron rotates, answer text expands below
- **Separated by**: thin horizontal `<hr>` lines, no box/card styling

---

## Link Chips Section

- Between FAQ and footer: 3 pill-shaped links
- Style: Outlined/ghost border pill (`border border-border rounded-full px-4 py-2`) with dark text
- Horizontal row, centered

---

## Footer

- **Background**: Dark (#111 or #1a1a1a)
- **Layout**: Multi-column grid
  - Col 1: Logo + "Membantu pelajar Indonesia belajar lebih cerdas." + app download badges (App Store / Google Play / Web App)
  - Col 2: Belajar (links)
  - Col 3: Komunitas & Tryout (links)
  - Col 4: Tools Gratis (links)
  - Col 5: Perusahaan (links)
  - Col 6: Kontak (WhatsApp + email) + Ikuti Kami (social icons: Instagram, TikTok, YouTube, X, LinkedIn, Facebook)
  - Col 7: Lainnya dari kami (cross-product links)
- **Bottom bar**: Light divider line, then company legal info + copyright
- **Link style**: Small, light gray text, hover → white. No bullets.

---

## Key Patterns to Steal for otwptn

1. **Floating pill nav on scroll** - shrinks to logo + 2 buttons in a rounded container
2. **Yellow underline on section headings** - wavy or solid, SVG-drawn
3. **Yellow marker rectangle highlight on headings** - "Cara Lama?" wrapped in yellow bg
4. **Off-white card bg** (#f5f5f0) - not white, not gray - for card sections
5. **Dark (#111) section** for dramatic CTA with stats
6. **Tweet-style testimonials** with real user handles
7. **Multi-column dark footer** - 6-7 columns, small text, app badges
8. **Gradient blob on hero** - soft, not aggressive
