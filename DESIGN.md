---
name: Foundry Model Regions
description: A trustworthy matrix for choosing the right Azure AI Foundry deployment region
colors:
  paper: "#f7f8fa"
  panel: "#ffffff"
  ink: "#161a1d"
  ink-soft: "#5a6470"
  ink-faint: "#666e7a"
  line: "#e2e6eb"
  line-strong: "#cdd3da"
  surface-sticky: "#eef1f4"
  surface-muted: "#e7ebef"
  accent: "#0b6bcb"
  accent-soft: "#e8f1fc"
  mark-red: "#e0483d"
  mark-green: "#28a745"
  mark-blue: "#0b6bcb"
  mark-yellow: "#f5b400"
  available: "#1a7d3e"
  available-bg: "#e4f6ec"
  amber: "#9a5f00"
  amber-bg: "#fdf3da"
  danger: "#c0392b"
  danger-bg: "#fbe6e3"
  geo-americas: "#eaf2fb"
  geo-europe: "#eaf6ee"
  geo-asia-pacific: "#f6efe6"
  geo-middle-east: "#f3ecf7"
  geo-africa: "#fbeeea"
typography:
  display:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "1.85rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  body:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "0.88rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  data:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "normal"
  label:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "0.64rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.16em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "22px"
components:
  control:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "7px 12px"
  control-hover:
    backgroundColor: "{colors.accent-soft}"
  control-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.panel}"
    rounded: "{rounded.md}"
    padding: "7px 12px"
  control-primary-hover:
    backgroundColor: "#0a5cb0"
    textColor: "{colors.panel}"
  panel-card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "12px"
  chip-group:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "999px"
    padding: "4px 10px"
  chip-group-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.panel}"
---

# Design System: Foundry Model Regions

## 1. Overview

**Creative North Star: "The Availability Ledger"**

This is an honest, auditable record of facts, rendered as an instrument rather than a
product page. Every surface decision serves one goal: let an internal advisor read a
model × region availability matrix at a glance, trust it, and defend the resulting
region recommendation to a customer. The aesthetic is that of a well-built ledger — a
near-white paper field with a faint dotted grid, crisp hairline rules, and data that
sits in clean cells. The chrome is quiet so the data can be loud.

The palette is **Restrained**: a single confident blue carries actions, selection, and
focus; a small semantic set (green/amber/red) carries availability lifecycle; and a band
of low-saturation geo tints groups regions by continent. Type pairs a compact display
grotesque (Bricolage) for headings against a humanist sans (IBM Plex Sans) for body and
data, with IBM Plex Mono for labels, dates, and codes — the monospace signals "this is a
record, machine-verified." Density is a virtue here: cells run at 0.78rem and tables are
allowed to be wide, because matching a spreadsheet's scannability is the whole point.

This system explicitly rejects flashy SaaS gloss — no hero choreography, no gradient
drama, no marketing polish that makes the data *less* scannable than a spreadsheet. It
also rejects color-as-only-signal: every availability state and geo group carries a
non-color cue alongside its tint.

**Key Characteristics:**
- Paper-and-hairlines instrument feel; data is the hero, chrome recedes
- Restrained single-accent palette + semantic lifecycle states + geo tint band
- Compact display grotesque over humanist sans, mono for labels and provenance
- Honest density: dense cells, wide tables, at-a-glance comparison
- Provenance-forward: dates, sources, and freshness stay legible

## 2. Colors

A near-white paper field carrying ink-dark text, one trustworthy blue accent, a
three-step availability semantic, and a low-saturation geo tint band.

### Primary
- **Foundry Blue** (`#0b6bcb`): The single accent. Primary actions, current selection,
  focus rings, links, and the active filter-group chip. Used on actions and state only,
  never as decoration. Its soft tint **Accent Soft** (`#e8f1fc`) backs hover and selected
  states.

### Secondary
The availability lifecycle semantics — each paired with a tinted "dot" background so a
cell reads at a glance:
- **Available Green** (`#1a7d3e` on `#e4f6ec`): A model is generally available in a region.
- **Preview Amber** (`#9a5f00` on `#fdf3da`): Available in preview / not yet GA.
- **Deprecating Red** (`#c0392b` on `#fbe6e3`): Available but on a deprecation path.

### Tertiary
Capability badge tones (audio, vision, search, reasoning, chat, embeddings) and the
**geo tint band** for the region column — Americas blue, Europe green, Asia-Pacific sand,
Middle East violet, Africa coral. These are *grouping* tints at low saturation, never
foreground colors.

### Neutral
- **Ink** (`#161a1d`): Primary text and data values.
- **Ink Soft** (`#5a6470`): Secondary text, captions, helper copy.
- **Ink Faint** (`#666e7a`): Tertiary labels, dates, empty-cell dots. Verified ≥4.5:1 on
  panel, paper, and the `surface-sticky` sticky-header surface.
- **Paper** (`#f7f8fa`): Body background, carrying a faint dotted radial grid.
- **Panel** (`#ffffff`): Cards, controls bar, matrix surface.
- **Surface Sticky** (`#eef1f4`): Raised neutral one step above panel; backs the sticky
  matrix header row and sticky region column so they read as fixed chrome while scrolling.
- **Surface Muted** (`#e7ebef`): Quiet neutral fill for inline chips/badges (capability
  badges) that need to sit back from panel without a border.
- **Line** (`#e2e6eb`) / **Line Strong** (`#cdd3da`): Hairline cell rules and stronger
  dividers / control borders.

### Brand Mark
The four-tile logo mark uses its own dedicated identity tokens — **Mark Red** (`#e0483d`),
**Mark Green** (`#28a745`), **Mark Blue** (`#0b6bcb`, aliasing Foundry Blue), and **Mark
Yellow** (`#f5b400`). These are decorative identity colors scoped to the `.brand-mark` only;
they are deliberately separate from the semantic availability states (green/amber/red) so
the logo can never be mistaken for data. Do not reuse them as foreground or state colors.

### Named Rules
**The One Voice Rule.** Foundry Blue is the only accent. It marks actions, selection, and
focus — nothing decorative. If blue is carrying mood instead of meaning, remove it.

**The No-Color-Alone Rule.** Availability states and geo groups must always pair their tint
with a non-color signal (glyph, label, or text). Color is reinforcement, never the sole
carrier of meaning.

## 3. Typography

**Display Font:** Bricolage Grotesque (sans-serif fallback)
**Body Font:** IBM Plex Sans (with system-ui, sans-serif)
**Label/Mono Font:** IBM Plex Mono

**Character:** A compact, slightly characterful display grotesque against a calm, highly
legible humanist sans — contrast on the geometric/humanist axis, not two similar sans.
Mono is reserved for anything that reads as a *record*: dates, codes, column corners, and
filter-clear affordances.

### Hierarchy
- **Display** (Bricolage 700, 1.85rem, line-height 1.05, letter-spacing -0.02em): The app
  title only.
- **Title** (Bricolage 700, ~1.05rem): Panel headings (Data Info, section titles).
- **Body** (IBM Plex Sans 400, 0.88rem, line-height 1.55): Prose, helper text, info panel
  copy. Cap prose at 65–75ch.
- **Data** (IBM Plex Sans 500, 0.78rem): Matrix cells and row/column heads — dense by design.
- **Label** (IBM Plex Mono 600, ~0.64rem, letter-spacing 0.16em, uppercase): Column corner,
  clear-buttons, dates, codes.

### Named Rules
**The Mono-Means-Record Rule.** Monospace is not decorative. It appears only on machine-
verifiable or record-like values: dates, codes, the matrix corner, provenance. Don't set
human prose in mono.

## 4. Elevation

Predominantly **flat with tonal layering**: depth comes from the paper → panel value step
and hairline borders, not from shadows. Two restrained shadows exist, both functional:
the matrix scroll container carries a whisper-thin ambient shadow to separate it from the
page, and floating menus (MultiSelect dropdown) lift clearly above the dense grid.

### Shadow Vocabulary
- **Surface whisper** (`box-shadow: 0 1px 2px rgba(22, 26, 29, 0.04)`): The matrix scroll
  container at rest. Just enough to detach the data surface from paper.
- **Floating menu** (`box-shadow: 0 16px 38px rgba(22, 26, 29, 0.16)`): Dropdown menus that
  must clearly escape the grid's stacking context.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest; depth is tonal (paper vs. panel)
plus hairlines. Shadows appear only to lift a true overlay (a dropdown) or to seat the
scrollable data surface — never as decoration on cards or controls.

## 5. Components

### Buttons (Controls)
- **Shape:** Softly rounded (`8px`, `--rounded-md`).
- **Default:** White panel background, ink text, `line-strong` border, 7px 12px padding,
  0.82rem 500-weight label.
- **Hover / Focus:** Border shifts to Foundry Blue with an `accent-soft` fill; focus-visible
  adds a 3px blue glow ring (`rgba(11,107,203,0.18)`). Transitions ~150ms.
- **Primary:** Solid Foundry Blue, white text; hover deepens to `#0a5cb0`.

### Chips (Filter Groups)
- **Style:** Pill (`999px`), hairline `line-strong` border, transparent fill, ink text.
- **State:** Hover tints to `accent-soft`; active/selected fills solid Foundry Blue with
  white text. Used for quick model/region group presets inside MultiSelect.

### Cards / Containers (Panels)
- **Corner Style:** `10–12px` (`--rounded-lg` for the controls bar and matrix).
- **Background:** Panel white on paper.
- **Shadow Strategy:** Flat by default (see Elevation); the matrix scroll surface gets the
  Surface whisper only.
- **Border:** `1px solid var(--line)` hairline.
- **Internal Padding:** 12–16px. **Never nest cards.**

### Inputs / Fields
- **Style:** White background, `line-strong` 1px stroke, `7–8px` radius, 0.82rem.
- **Focus:** Border shifts to Foundry Blue (filter inputs add the 3px blue glow ring).

### Navigation / Controls Bar
- A single horizontal controls bar (filters, multiselects, toggles, export actions) wraps
  responsively. Toggles use the accent as `accent-color`. No top/side nav — the matrix is
  the whole surface.

### The Matrix (Signature Component)
The product. A sticky-header, sticky-region-column data grid. Region rows carry a 4px geo
tint left edge + tinted background for continent grouping; cells render availability as a
centered radial "dot" in the lifecycle color, with empty cells showing a faint `·`. Column
heads hold the model name, a mono release date, and capability badges. Row hover paints a
faint blue wash across the row. Density and at-a-glance scanning override all decoration here.

## 6. Do's and Don'ts

### Do
- **Do** keep the data the hero: every chrome element must make the matrix faster to read or
  be removed.
- **Do** pair every availability state and geo tint with a non-color signal — honor the
  No-Color-Alone Rule.
- **Do** reserve Foundry Blue for actions, selection, and focus only (One Voice Rule).
- **Do** use IBM Plex Mono for records — dates, codes, the matrix corner, provenance.
- **Do** keep surfaces flat; convey depth with the paper→panel step and hairlines.
- **Do** keep prose at 65–75ch, but let data tables run dense and wide.
- **Do** verify body/data text hits 4.5:1 — `ink-faint` (`#666e7a`) now clears AA on panel,
  paper, and the sticky-header surface; re-check any new tint before shipping at body size.

### Don't
- **Don't** add flashy SaaS gloss: no hero choreography, gradient drama, or marketing
  polish that makes the data less scannable than a spreadsheet.
- **Don't** prettify the data into something less scannable than a spreadsheet — honest
  density wins.
- **Don't** let color be the only signal for an availability state or geo group.
- **Don't** use gradient text or `background-clip: text` anywhere.
- **Don't** nest cards, or add decorative side-stripe borders (the 4px geo edge on region
  rows is a deliberate grouping signal, not decoration — don't extend the pattern elsewhere).
- **Don't** introduce a second accent hue or set human prose in monospace.
