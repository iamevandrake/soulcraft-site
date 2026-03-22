# Soulcraft Style Guide

Extracted from the homepage at soulcraftagency.com. This is the canonical reference for visual design, typography, color, layout, and component patterns across the site.

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--black` | `#0a0a0a` | Page background |
| `--dark` | `#111111` | Section backgrounds (capabilities, pricing) |
| `--card` | `#161616` | Card surfaces, modals, inputs |
| `--border` | `#222222` | Borders, dividers, score bars |
| `--muted` | `#555555` | Secondary text, nav links, attributions |
| `--text` | `#d0d0d0` | Body text |
| `--white` | `#f0f0f0` | Headings, emphasis, high-contrast text |
| `--accent` | `#c8a97e` | Gold accent -- CTAs, labels, highlights, logo accent, hover states |
| `--accent-dim` | `rgba(200,169,126,0.12)` | Accent tint for insight boxes, subtle backgrounds |
| `--accent-glow` | `rgba(200,169,126,0.25)` | Radial glow behind hero tool |

The palette is dark-first. Nearly black backgrounds with warm gold as the single accent color. No secondary accent. No gradients on surfaces -- only on fade overlays (e.g. hero bottom fade to black).

---

## Typography

### Fonts

Two font families, loaded from Google Fonts:

- **Playfair Display** (serif): Headlines, logos, tier names, blockquotes, domain input, report titles. Weights: 400, 600, 700. Italic used for emphasis and tier names.
- **Inter** (sans-serif): Body text, buttons, labels, nav, detail text. Weights: 300, 400, 500, 600, 700, 800, 900.

### Type Scale

| Element | Family | Size | Weight | Color | Notes |
|---------|--------|------|--------|-------|-------|
| Hero h1/h2 | Playfair Display | `clamp(44px, 6vw, 72px)` | 400 | `--white` | `em` children get italic + 700 + accent color |
| Section h2 | Playfair Display | `clamp(28px-32px, 3.5-4vw, 44px-48px)` | 400 | `--white` | |
| Card h3 | Playfair Display | 28px | 400 | `--white` | |
| Manifesto blockquote | Playfair Display | `clamp(24px, 3.5vw, 40px)` | 400 italic | `--white` | |
| Body paragraph | Inter | 17px | 400 | `--muted` | `line-height: 1.8` |
| Hero subtitle | Inter | 20px | 300 | `--muted` | `line-height: 1.8` |
| Nav links | Inter | 13px | 500 | `--muted`, hover `--white` | |
| Chapter labels | Inter | 11px | 700 | `--accent` | `uppercase`, `letter-spacing: 4px`, `opacity: 0.7` |
| Capability labels | Inter | 11px | 700 | `--accent` | `uppercase`, `letter-spacing: 3px` |
| Detail items | Inter | 13px | 400 | `--text` | Gold dot prefix |
| Tier price | Playfair Display | 44px | 700 | `--white` | |
| Tier name | Playfair Display | 20px | 400 italic | `--accent` | |
| Footer tagline | Playfair Display | 14px | 400 italic | `#333` | |

### Line Heights

- Body text: 1.8
- Headings: 1.1 to 1.2
- Blockquote: 1.5
- General: 1.6

---

## Layout

### Container

- Max width: `1100px`
- Centered with `margin: 0 auto`
- Base padding: `0 24px`
- Content sections get extra breathing room: `padding-left: 48px; padding-right: 48px`

### Section Spacing

| Section | Padding |
|---------|---------|
| Opening (hero) | `min-height: 100vh`, `padding-top: 100px` |
| Manifesto | `120px 0` |
| Narrative | `100px 0` |
| Capabilities | `100px 0` |
| Investment | `100px 0` |
| Closing CTA | `160px 0` |
| Footer | `48px 0` |

### Narrative Blocks

- Max width: `680px`, centered
- Margin between blocks: `100px`
- Paragraphs: `margin-bottom: 20px`

### Grids

- Capability cards and pricing tiers: `grid-template-columns: repeat(3, 1fr)`, `gap: 20px`
- Collapses to single column at `768px`

---

## Components

### Navigation

- Fixed to top, `z-index: 100`
- Background: `rgba(10,10,10,0.85)` with `backdrop-filter: blur(24px)`
- Height: `64px`
- Logo: Playfair Display 20px, "Soul" in `--white`, "craft" in `--accent`
- Heartmark SVG: 28x28, stroke `#c8a97e`, no fill
- CTA button: gold background, black text, `border-radius: 6px`, `padding: 8px 20px`, 13px 600 weight

### Cards (Capabilities)

- Background: `--card`
- Border: `1px solid --border`, `border-radius: 16px`
- Padding: `48px 32px`
- Hover: border turns accent, `translateY(-4px)`, top 3px accent bar scales in via `::before`
- Icon: inline SVG encoded in `src`, 48x48, stroke accent, no fill, `opacity: 0.7`

### Pricing Tiers

- Same card base as capabilities
- Featured tier: accent border + "Recommended" pill (`position: absolute`, `top: -11px`, gold bg, black text, 11px uppercase)
- Standard button: transparent bg, border, white text; hover turns accent
- Featured button: gold bg, black text; hover turns white

### Buttons

| Variant | Background | Text | Border | Radius | Hover |
|---------|-----------|------|--------|--------|-------|
| Primary (CTA) | `--accent` | `--black` | none | 10-12px | bg becomes `--white` |
| Nav CTA | `--accent` | `--black` | none | 6px | -- |
| Tier (standard) | transparent | `--white` | `1px solid --border` | 8px | border + text turn accent |
| Tier (featured) | `--accent` | `--black` | accent | 8px | bg becomes `--white` |

### Inputs

- Background: `--card`
- Border: `1px solid --border`, `border-radius: 10-12px`
- Text: `--white`, 15-17px
- Placeholder: `#333`, italic (hero input only)
- Focus: border turns accent, optional `box-shadow` with `--accent-dim`
- Hero domain input: Playfair Display, centered text, `letter-spacing: 0.5px`

### Modals

- Overlay: `rgba(0,0,0,0.85)`, `z-index: 200`
- Card: `--card` bg, `--border` border, `border-radius: 16px`, `padding: 48px`, `max-width: 440px`
- Close button: top right, `#333` text, 20px

### Chapter Labels

- 11px, 700 weight, uppercase, `letter-spacing: 4px`, accent color, `opacity: 0.7`
- Used as section markers above narrative headings

---

## Interactions and Motion

- Card hover: `translateY(-4px)`, `transition: all 0.4s`
- Top accent bar on cards: `transform: scaleX(0)` to `scaleX(1)`, `transition: 0.4s`
- Soul score bars: `transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1)`
- Report reveal: `@keyframes revealUp` -- fade in + `translateY(40px)` to 0, `0.8s ease`
- Scroll hint: `@keyframes pulse` -- opacity oscillates 0.3 to 0.8, `2s infinite`
- Link/button hover: `transition: color 0.2s` or `transition: all 0.2s-0.3s`
- Button press: `translateY(-1px)` on hover (hero CTA)
- Smooth scroll: `html { scroll-behavior: smooth; }`

---

## Responsive Breakpoints

Single breakpoint at `768px`:

- Nav: hide all links except CTA button
- Grids: collapse from 3-column to 1-column
- Closing form: stack vertically
- Hero domain input + button: stack vertically, button goes full width
- Footer: center-align, stack vertically, `gap: 20px`
- Opening: `padding-top: 120px`
- Tooltips: reposition left-aligned with narrower width (220px)

---

## Iconography

- SVG-based, inline or data-URI encoded
- Stroke only, no fills (except accent-colored dots/circles)
- Stroke color: `#c8a97e` (accent)
- Stroke width: 2-3.2px
- Rounded caps and joins (`stroke-linecap: round`, `stroke-linejoin: round`)
- Displayed at reduced opacity (`0.7`) in capability cards

### Heartmark (Logo Icon)

- 200x200 viewBox, displayed at 28x28
- Square border with `rx="4"`, heart path inside, center dot
- All strokes accent gold, center dot filled accent

---

## Decorative Patterns

- **Hero fade**: `linear-gradient(transparent, --black)` at bottom of opening, 200px tall
- **Closing vertical line**: 1px wide, 80px tall, `linear-gradient(--border, transparent)` above closing section
- **Hero glow**: 500x500 radial gradient using `--accent-glow`, centered behind soul tool, `opacity: 0.3`
- **Section dividers**: `1px solid --border` on `border-bottom` or `border-top`
- **Detail dots**: 4x4 accent-colored circles before list items (`::before` pseudo-element)

---

## Accessibility

- Screen-reader-only class (`.sr-only`) used for hidden headings
- `aria-label` on interactive elements (inputs, logo link, close button)
- `aria-hidden="true"` on decorative SVGs
- `aria-live="polite"` on dynamic status regions
- Semantic HTML: `nav`, `main`, `section`, `footer`
- All images have `alt` attributes
- Keyboard-accessible form elements
