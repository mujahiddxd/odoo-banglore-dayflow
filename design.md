# Design System: UXSG Home — Sketchy Creative Direction (V1)

**Project ID:** 5442190591633597420  
**Reference Screen:** UXSG Sketchy Creative Hero - V1 (`b5af5ba6f5674842ab3010012dfecfba`)

## 1. Visual Theme & Atmosphere

The Sketchy direction is a **warm, hand-drawn digital notebook** aesthetic. The page feels **bold and dense** with strong typography, thin rough black borders, and scattered doodles (arrows, wavy underlines, zigzags, scribbles) in black, yellow, and light blue. The overall mood is **creative and informal** while remaining professional—like a designer’s whiteboard brought to the web.

**Key characteristics:**

- Off-white paper-like background with subtle noise texture
- Hand-drawn SVG borders on buttons, cards, and inputs (wobbly, not perfect rectangles)
- Decorative arrows and underlines that guide the eye to CTAs
- Clear hierarchy: very large bold headings, regular body text, no rounded/cute fonts for UI
- Sticky-note and “taped” card treatments for emphasis

## 2. Color Palette & Roles

### Primary

- **Near-Black** (#090907) – Primary text, hand-drawn strokes, primary buttons (filled), borders. Strong contrast on light background.
- **Paper Background** (#faf9f6) – Main background with subtle noise. Warm off-white.

### Accents

- **Warm Yellow** (#FCDD2A) – Hero underline under “is Human.”, zigzags, arrows to CTAs, sticky notes, section underlines. Energetic accent.
- **Teal / Light Blue** (#61C4D8) – Secondary accent: arrows, sparkles, bullet icons, decorative strokes. Friendly and modern.

### Surfaces & UI

- **White** (#ffffff) – Card backgrounds, outline buttons, input backgrounds.
- **Light Blue Sticky** (#a8d4e6) – Sticky note backgrounds (with black text).
- **Yellow Sticky** (#FCDD2A) – Alternate sticky note (with black text).
- **Tape / Gray** (#5a5a5a at ~60% opacity) – “Tape” corners on cards.

### Borders & Dividers

- **Hand-drawn black** (#090907) – All sketchy borders (1.5–2px stroke).
- **Light gray** (#c8c8c8) – Thin borders on photo collages.

### CTA

- **Orange RSVP** (#e67e22) – Pill-shaped RSVP buttons with dark border.

## 3. Typography Rules

**Headline font:** Cabin Sketch (Bold)  
**Body font:** Sora  
**Sticky notes / handwritten accent:** Patrick Hand (or Architects Daughter) – used only for sticky note text, not for main UI.

### Hierarchy & Weights

- **Hero (H1):** Black (900), very large (6xl–8xl), tight leading (1.05), tight tracking. Single line or two lines (“The Future of UX” / “is Human.”).
- **Section titles (H2):** Black (900), 4xl–5xl, centered for “Two Ways to Grow” and “Upcoming Sessions”; left-aligned for “We Are Not a Lecture Hall.”
- **Card titles (H3):** Black (900), 3xl.
- **Body:** Regular (400), Sora, base or lg size, relaxed line-height (snug). Black with slight opacity (e.g. 80–90%) for hierarchy.
- **Small / meta:** xs–sm, regular weight, for dates and labels.
- **Buttons / CTAs:** Bold or regular Sora; labels in Cabin Sketch for emphasis where needed.

### Decorative type

- Section titles use a **black wavy underline** (not yellow) under the phrase. “Two Ways to Grow” and “Upcoming Sessions” use **horizontal lines with small vertical tick marks** on both sides (perforated/ruler look).

## 4. Component Stylings

### Buttons

- **Shape:** Hand-drawn rectangle (SVG path), not rounded. Slight wobble.
- **Primary (filled):** Background #090907, white text, hand-drawn white border.
- **Secondary (outline):** White background, #090907 text, hand-drawn black border.
- **RSVP (pill):** Rounded-full, orange (#e67e22) fill, dark border, “RSVP +” label.

### Cards

- **Container:** Hand-drawn tall rectangle (SVG), white or black fill, black stroke.
- **Tape:** Small rotated rectangles (gray, roughen filter) at top-left and bottom-right (or opposite corners).
- **Pills:** “Open to all” (black pill) / “Members only” (white pill) with hand-drawn border.

### Section titles

- Centered when used as section divider (“Two Ways to Grow,” “Upcoming Sessions”).
- **Ticked lines:** Short horizontal black lines with small vertical ticks above/below on both sides of the title.
- **Wavy underline:** Black, hand-drawn wavy path directly under the title text.

### Inputs / Footer

- Hand-drawn border on email input and submit button (sketchy rectangle).
- Submit may be a simple control (e.g. “B” or arrow) with sketchy border.

### Sticky notes

- Rectangles with light blue (#a8d4e6) or yellow (#FCDD2A) fill, thin border, slight rotation. Text in Patrick Hand (or similar), black.

## 5. Layout Principles

### Grid & structure

- **Max content width:** ~5xl–6xl (e.g. 1024px–1152px) for hero and sections.
- **Sections:** Generous vertical padding (py-12–py-20); consistent horizontal padding (px-4).

### Hero

- **Heading:** Full width, left-aligned. Two lines; “is Human.” has black wavy underline.
- **Row below:** Sub-heading (body) on the left (max-w-xl); CTAs on the right, same row (flex, items-end). On small screens stack (heading → body → CTAs).
- **Arrows:** Blue arrow from near body text toward “Browse Events”; yellow arrow from slightly below toward “Join Accelerator.” Arrows in background (z-index below content).

### Two columns

- “Two Ways to Grow”: two equal cards (Sandbox, Accelerator) with gap-6.
- “We Are Not a Lecture Hall”: text left, photo collage + sticky notes right.

### Alignment

- Headings and body left-aligned unless section is centered (then title + ticked lines + wavy underline centered).
- CTAs horizontally aligned with each other; vertically aligned with end of body row in hero.

## 6. Design System Notes for Stitch / Implementation

### Reference implementation

- **IndexV7** and **UpcomingEvents** (variant="sketchy") are the canonical implementation of this design.

### Language to use

- **Atmosphere:** “Hand-drawn sketchy notebook; bold typography and doodles on paper background.”
- **Borders:** “Hand-drawn wobbly black stroke” (SVG paths, not CSS border-radius).
- **Underlines:** “Black wavy underline under the phrase” or “yellow wavy underline” only where specified (e.g. “9,000+ designers”).
- **Section titles:** “Centered title with horizontal ticked lines on both sides and black wavy underline below.”

### Color references

- Primary text/borders: “Near-Black (#090907)”
- Background: “Paper (#faf9f6)” with noise
- Accent: “Warm Yellow (#FCDD2A)” and “Teal (#61C4D8)”
- Cards: “White (#ffffff)” or “Near-Black (#090907)” for dark card

### Fonts

- Headings: Cabin Sketch (Bold/700 for hero and section titles).
- Body: Sora (Regular 400).
- Handwritten accent: Patrick Hand only for sticky notes.

## 7. Application Across the Site

- **Design system:** Implemented globally via `src/index.css` (CSS variables and utility classes) and `tailwind.config.ts` (uxsg colors, font-headline, font-body). All pages are wrapped in **SketchyLayout**, which provides the shared sketchy header, paper background, and sketchy footer site-wide.
- **Home page (/):** Renders the Sketchy design via `IndexV7` content (hero, Two Ways to Grow, We Are Not a Lecture Hall, Upcoming Sessions). Header and footer come from SketchyLayout.
- **/index-v7:** Same as home; kept for direct access and comparison.
- **Other pages** (About, Membership, Summit, Sponsor, Partner, Media Kit, Summit 2026, Privacy, Terms, Code of Conduct, Index V1–V6, NotFound): Export only their main content (e.g. `<main>...</main>`). They use the same SketchyLayout, so they automatically get the sketchy header/footer and paper background. Page-level styling uses DESIGN.md tokens: `font-headline`, `text-uxsg-ink`, `paper-bg`, and uxsg color tokens for consistency.
- **Global CSS** (`src/index.css`): Defines `:root` uxsg variables, `.paper-bg`, and sketchy utility classes. DESIGN.md is the source of truth for when and how to use them.
