# aimasukptn.com — Design Reference Notes

Source: https://aimasukptn.com (scraped 2026-10-26, partial — site rate-limited after hero)

---

## Overall Palette

- **Brand**: Red/crimson (#E11D48 or similar) as primary accent — used on CTAs, heading accents, highlighted labels
- **Background**: White (#fff)
- **Dark/light toggle**: Site supports dark mode (has toggle in nav)
- **Mascot**: Pink fluffy owl/bird character — friendly, educational
- **Note**: This is NOT otwptn's aesthetic — too cartoon-heavy. Reference only for structural patterns.

---

## Navigation

- **Layout**: Full-width, white bg, top of page
- **Logo**: Small mascot icon + "aimasukptn" text
- **Links**: Latihan, Tryout, Belajar (dropdown), 👑 Premium
- **Right CTAs**: 
  - "Download" — red solid rounded button
  - ? (help icon)
  - Dark/light mode toggle (sun/moon icons)
  - "Masuk" — text link
  - "Daftar" — red solid rounded button
- **Separator**: Thin border-bottom below nav

---

## Hero Section

- **Background**: White with light decorative elements (math symbols: π, √, ×, etc.) scattered at low opacity
- **Layout**: Two-column, 50/50
  - **Left (1/2)**: 3D mascot illustration with floating educational elements
    - Floating items: pencil, magnifier, lightbulb, graduation cap, clock, abacus, books — scattered organically
    - Style: 3D-rendered or high-quality illustration
    - Small interactive label: "Mulai dari sini" with bookmark icon (top-left)
    - Also: floating speech bubbles with "Kak, kok jawabannya B?" and "✓ Jawaban benar!" — user interaction simulation
  - **Right (1/2)**:
    - Small red label: "TKA 2026 sedang berlangsung. Semangat!"
    - H1: "Siap Masuk PTN" (dark, bold) + "Dalam Hitungan Hari" (red, bold) — two-line heading, second line in accent color
    - Subtext: "Klik. Konsul. Paham. Otomatis." — short, punchy
    - CTA: "Mulai belajar →" — red solid pill button

**Pattern for otwptn**: Two-column hero with illustration left, text+CTA right. But use otwptn's color scheme (yellow accent instead of red). The split is valid — place a visual/illustration on one side.

---

## Category Strip (below hero)

- **Layout**: Horizontal row of icon+label chips below the fold
- **Items**: SNBT / UTBK, TKA, SIMAK UI, UM UGM, SNBP
- **Style**: Each chip has a small icon + text label, lightly outlined or pill shape
- **Purpose**: Quick navigation to each test type/jalur category

**Pattern for otwptn direktori section**: Use a similar jalur-type category strip. Chips/pills with jalur icon + name.

---

## What We Know About Inner Sections (from WebFetch metadata)

Based on the WebFetch structural analysis:

### Directory/List Panels
- Data displayed in grouped panels by category
- Each PTN has its own card/row with: name, description, filter metadata
- Filtering UI likely sidebar or top row with dropdowns/chips
- Link-list format: grouped by category (PTN type, jalur type, etc.)

### Feature Highlight Sections
- Alternating left/right content rows — a classic "feature" pattern
- Each row: illustration on one side, text+CTA on the other side
- Alternates every row (left-img-right-text → right-img-left-text)

### General Observations
- Heavier use of emoji and illustrations than pintarly/tofly
- More "educational app" feel — aimasukptn leans playful
- **Do NOT copy aimasukptn's visual style** — too cartoon-heavy for otwptn
- **DO copy**: the directory panel structure, alternating feature rows, category chips

---

## Key Patterns to Steal for otwptn

1. **Two-column hero** — illustration left, text+CTA right (already used by many sites, valid pattern)
2. **Category chip strip** — jalur type filters as horizontal pill chips below hero or at top of directory
3. **Alternating left-right feature rows** — for the "Kenapa otwptn" or feature section
4. **Directory grouped panels** — PTN list grouped by jalur type with filter sidebar

---

## Warning

aimasukptn uses a red-heavy, cartoon-mascot-heavy aesthetic that is **explicitly not** what otwptn is going for. Reference it only for:
- Layout structures
- Directory/filter UI patterns  
- Category chip navigation
- Alternating feature row pattern

Avoid: red color scheme, heavy cartoon illustrations, emoji-style icons, childlike playfulness.
