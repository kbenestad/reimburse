# kBenestad — app UI brief

**Drop this into a project's `CLAUDE.md` (or paste it to Claude Code) whenever you build or
restyle a kBenestad web app.** It is the shared visual contract: follow it and any new
screen — invoice, timesheet, reimburse, a dashboard, a settings page — will look like it
belongs to the same family.

This brief tells you *how things should look and behave*. It does **not** redefine what an
app does. Keep each app's existing purpose, data model, and screens intact — only the
surface (layout, type, colour, components, copy) is governed here.

---

## 0. The one-paragraph version

Nordic-minimal, light-first, calm. A cool off-white page, pure-white cards held by 1px
hairline borders, near-black cool ink, and **one** blue accent (`#2f6fed`). Schibsted
Grotesk for everything; JetBrains Mono only for numbers, code, and identifiers. 4px
spacing grid, small deliberate radii (8px workhorse), soft shadows used sparingly. No
gradients, no emoji, no bounce. Sentence case. Borders do the structural work; shadow only
when something genuinely floats. Categorical data is coloured with a muted, config-driven
palette (chip + left border + optional row tint), never neon.

If you only remember five rules:
1. **One accent.** Blue is the only brand colour. Semantic hues are muted and earn their place.
2. **Borders first, shadow last.** Most surfaces have no shadow.
3. **Forms are row-major** (see §6). Never lay a form out as side-by-side column stacks.
4. **Sentence case, no emoji, mono for numbers.**
5. **Colour-code categories** with the chip / border / tint system in §8 — muted, from data.

---

## 1. Setup — wire in the design system

All tokens are CSS custom properties. Pull them in once, then reference `var(--token)`
everywhere. The canonical source is the kBenestad design system's `styles.css` closure
(`tokens/colors.css`, `typography.css`, `spacing.css`, `elevation.css`, `fonts.css`,
`base.css`). Copy those into the app and `@import` them from a single stylesheet, or copy
the token blocks inline.

**Fonts** — Schibsted Grotesk (400–800) + JetBrains Mono (400–600). Load from a webfont host
with a `local()` first and a full system fallback stack so the app still renders offline:

```css
--font-sans: 'Schibsted Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
```

**Dark mode** — support both. Honour the OS by default and allow a manual override:
`@media (prefers-color-scheme: dark)` *and* `:root[data-theme="dark"]` both flip the same
tokens. Never hardcode a hex that won't invert — always go through a semantic token.

**For form-driven apps specifically:** `mockups/kbenestad-forms.css` is a finished,
proven component layer (the `.kb-*` classes used below) built on exactly these tokens. Lift
it wholesale rather than rebuilding inputs/cards/buttons from scratch.

---

## 2. Colour tokens

Reference the **semantic aliases**, not the raw ramps. The raw ramps exist so the aliases
have something to point at; your code should almost never name a `--blue-500` directly.

**Surfaces** — `--surface-page` (cool off-white ground), `--surface-card` (pure white),
`--surface-sunken`, `--surface-raised`, `--surface-hover`, `--surface-active`,
`--surface-inverse`.

**Borders** — `--border-subtle` (hairline, default for cards), `--border-default`
(dividers), `--border-strong` (emphasis), `--border-focus`.

**Text** — `--text-strong` (headings/primary ink), `--text-body`, `--text-muted`,
`--text-subtle`, `--text-inverse`, `--text-accent`, `--text-link`.

**Accent / interactive** — `--accent` (`#2f6fed`), `--accent-hover`, `--accent-active`,
`--accent-soft` (pale blue fill), `--accent-soft-text`, `--accent-fg` (text on accent).

**Semantic feedback (muted, never neon)** — `--success` / `--success-soft`,
`--warning` / `--warning-soft`, `--danger` / `--danger-soft` / `--danger-fg`. Use the soft
variants as fills, the solid as border/text.

**Focus** — `--focus-ring` (a 3px soft-blue ring). Always visible via `:focus-visible`.

**Terminal** (CLI / gitxt only) — `--term-bg`, `--term-fg`, `--term-dim`, `--term-accent`,
`--term-green`, `--term-amber`. Don't use these in normal app UI.

> Light values you'll see most: page `#f8f9fb`, card `#ffffff`, hairline `#e7eaef`, ink
> `#14181e`, accent `#2f6fed` / hover `#1f57cf`. Dark inverts onto `#0d1117` page /
> `#161b22` card with a lighter accent for contrast.

---

## 3. Typography

- **Families:** `--font-sans` everywhere; `--font-mono` **only** for numbers, code, paths,
  package/identifier names, and tabular figures. When showing money, durations, counts,
  versions, IDs — mono + `font-variant-numeric: tabular-nums`.
- **Scale:** `--text-display` 52px (splash only), `--text-h1` 36, `--text-h2` 28,
  `--text-h3` 22, `--text-h4` 18, `--text-body-lg` 17, `--text-body` 15 (UI default),
  `--text-body-sm` 13, `--text-caption` 12, `--text-mono` 14.
- **Weights:** 400 body, 500 medium, 600 semibold (labels/buttons), 700 headings, 800
  reserved for the wordmark/splash.
- **Leading:** `--leading-normal` 1.5 for body; `--leading-tight` 1.1 for big display.
- **Tracking:** `--tracking-tight` (−0.02em) on display/headings; `--tracking-caps`
  (+0.08em) on uppercase eyebrow/overline labels.
- **Eyebrow labels** (field labels, table headers, section kickers): 12px, uppercase,
  `--tracking-caps`, `--text-muted`, weight 600. This is the recurring small-label motif.

---

## 4. Spacing, shape, elevation, motion

- **Spacing:** 4px base grid via `--space-1`…`--space-16` (4, 8, 12, 16, 24, 32, 40, 48, 64,
  96, 128). Card padding ~24px (`--space-5`). Comfortable, not airy.
- **Radii:** `--radius-xs` 3, `--radius-sm` 5 (small controls), `--radius-md` 8 (the
  workhorse), `--radius-lg` 12 / `--radius-xl` 16 (cards), `--radius-full` (pills/badges
  only). **Not bubbly** — never round a card more than 16px.
- **Borders:** `--border-thin` 1px (default hairline), `--border-medium` 1.5px (emphasis /
  selection). Borders carry the structure.
- **Elevation:** most surfaces have **no** shadow. `--shadow-md` for menus and hover-lift,
  `--shadow-lg` / `--shadow-xl` for dialogs and popovers. Shadows are soft, cool-tinted,
  low-opacity. Never use shadow as decoration.
- **Containers:** cap content at `--container-lg` 1080px (forms/docs) to `--container-xl`
  1280px (dashboards). Left-aligned, single-column-leaning.
- **Motion:** 120–280ms (`--duration-fast/base/slow`), `--ease-out`
  `cubic-bezier(.22,.61,.36,1)`. Fades and ≤2px translations only. **No bounce, no spring.**
  Honour `prefers-reduced-motion`.
- **Hover/press:** filled elements step one shade darker (`--accent-hover`); ghost/secondary
  get a faint surface tint. Press adds a 0.5px downward nudge. Disabled ≈ 45% opacity, no
  pointer events.

---

## 5. Voice & copy

The voice is understated, precise, practical. These are working tools, not marketing pages.

- **Sentence case everywhere** — buttons, headings, menu items ("View source", "Add row",
  not Title Case). UPPERCASE only for small tracked-out eyebrow labels.
- **Calm and direct.** Short sentences. Say what a thing does, then stop. No hype
  ("seamless", "blazing-fast"), no exclamation marks.
- **Imperative, concrete verbs** for actions: *Add line*, *Generate*, *Validate*, *Export*,
  *Remove*, *Publish*.
- **Numbers & identifiers are exact and mono:** `v2.4.0`, `12 kB`, `8.0 h`, `3 items`.
- **No emoji, ever.** Status is a coloured dot, a Lucide icon, or a tinted chip.
- **Errors & empty states are honest and helpful** — what happened, then the next step:
  "Time out must be after time in." / "No expenses yet — add your first line to begin."
- **Speak to the user as "you"**; the maker is "I/me". Avoid corporate "we".

---

## 6. Form-driven UIs (invoice, timesheet, reimburse, settings, anything with inputs)

These apps are the core of the family. The rules below are what make them feel unified.

### 6.1 Page shell
A centred column (`--container-lg` or narrower), `--surface-page` ground, content in
`--surface-card` cards with `--border-subtle` and at most `--shadow-sm`. Optional top
**utility bar** (language toggle, text-size A−/A/A+, About) as small segmented controls;
then a **document header** where the *customer's* identity leads (logo tile + org name on
the left, document title + period on the right). kBenestad is the quiet signature in the
footer, never the headline.

### 6.2 Forms are ROW-MAJOR — this is the load-bearing rule
Group fields into **rows**; never build a form as two independent side-by-side column
stacks. Each row is a **top-aligned CSS grid**. When one field grows — a hint appears, a
validation message shows, an explanation expands — **the whole row grows and the rows below
push down**, while the field beside it stays aligned to the top. This keeps labels and
controls in register no matter what expands.

- Use a `.kb-form` / row container with span helpers (`kb-col-2`, `kb-col-3`, `kb-col-full`)
  to control how many columns a field occupies within its row.
- Label above field. Label = eyebrow style (12px, uppercase, tracked, `--text-muted`, 600).
- One thought per row; don't cram unrelated fields together to save vertical space.

### 6.3 Inputs
1px `--border-strong` border, `--radius-sm`, ~9–11px padding, 15px text. Focus =
`--accent` border + `--focus-ring`. Disabled/readonly = `--surface-sunken` fill, muted
text, `not-allowed`. Numeric inputs: mono, right-aligned, tabular-nums. Selects get a custom
chevron. Error state = `--danger` border; warning = `--warning` border (optional soft fill).

### 6.4 Buttons
- **Primary:** filled `--accent`, `--accent-fg` text → hover `--accent-hover`.
- **Ghost/secondary:** white surface, `--border-strong` → hover accent border + accent text.
- **Soft:** `--accent-soft` fill, accent text.
- **Dashed:** transparent + dashed accent border — the "add another" affordance.
- **Round add/remove:** 24px circle, `+` (accent) / `−` (danger) — for line-item rows.
- Disabled ≈ 50% opacity. Icons (Lucide, 16px) sit left of the label with a small gap.

### 6.5 Line items / repeating rows
A header row of eyebrow labels, then data rows on a matching grid. Row hover gets a faint
`--surface-hover`. A left-border slot (`border-left: 3px solid transparent`) is reserved so
rows can be colour-coded (see §8). Trailing add/remove circle buttons. Subtotals and the
running total use mono tabular figures.

### 6.6 Totals panel
Right-aligned, ~380px. Rows of `label … value` (value mono, tabular). A `grand` row on top
of a `--border-strong` rule, bold, with the figure in `--accent` at ~20px. Notes/derived
explanations below in muted small text.

### 6.7 Validation & feedback (notes / banners)
A tinted note block: icon + text, `--*-soft` background with matching `--*-border` and text
colour. Four kinds: error (`--danger`), warning (`--warning`), success (`--success`), info
(`--accent`/info). Blocking errors disable the primary action; warnings don't. Mirror
issues inline: tint the offending field's border and show the message next to its row. Keep
messages specific ("Description is required for OTH rows").

### 6.8 Config-driven & white-label
Wherever an app has a `config.yml` (org name, logo, accent colour, codes, categories,
holidays, UI strings, language), **drive the UI from it** — don't hardcode. The accent is a
single recolourable token so a customer brand can replace the kBenestad blue without
touching anything else. Strings come from the config's i18n map; support the configured
languages.

---

## 7. Dashboards & data-dense screens

Dashboards use the same DNA, just wider (`--container-xl` 1280px) and grid-arranged.

- **Metric / stat cards:** white card, hairline border, no shadow. A small uppercase
  eyebrow label, then the figure **large in mono tabular** (`--text-h2`/`h3`), then an
  optional delta line. Show change with a small coloured chip or arrow in `--success` /
  `--danger` — **muted, not neon**, never a red/green gradient.
- **Card grid:** lay metric cards on a responsive grid with `--space-4`/`--space-5` gaps.
  Group related cards under a section header (eyebrow label + thin accent tick).
- **Tables:** the workhorse of dashboards. Eyebrow-label header row, hairline row dividers
  (or zebra via `--surface-sunken` at low contrast), generous row height, mono tabular for
  any numeric column, right-align numbers. Status/category cells use the chip system (§8).
  Sticky header for long tables. Row hover = `--surface-hover`.
- **Charts:** flat fills, no 3D, no drop shadows, no gradients-as-decoration. Use the blue
  accent as the primary series; pull additional series from the muted categorical palette
  (§8) so chart colours match the chips/legends elsewhere. Thin gridlines in
  `--border-subtle`, axis labels in `--text-muted`. A legend reuses the same chip styling.
- **Density:** comfortable, not cramped. Don't add stats, sparklines, or icons that aren't
  answering a real question — less is more. No "data slop."
- **Filters / toolbars:** segmented controls and ghost buttons in a row above the content,
  separated from it by a hairline. Active segment = `--accent-soft` fill + accent text.
- **Empty & loading states:** a calm centred message in `--text-muted` with one clear
  action — never a spinner alone with no context.

---

## 8. Colour-coding categorical data (the timesheet pattern — use it everywhere it fits)

This is the pattern from the timesheet that works well: any time data falls into **named
categories** — work codes, expense categories, invoice statuses (draft/sent/paid/overdue),
project tags, leave types, priority levels — give each category a **stable, muted colour
identity** and surface it consistently. It turns a wall of rows into something scannable.

### 8.1 The colour identity
Each category owns a trio, ideally defined in **config/data, not hardcoded**, exposed as CSS
custom properties so they stay configurable:

```
--chip-border : a saturated-but-muted hue   (the category's "true" colour)
--chip-bg     : a soft pale tint of that hue (fills behind text — must keep AA contrast)
--chip-text   : a darker shade of the hue    (readable label colour)
```

You can specify all three for control, or specify just `--chip-border` and derive the tint
with `color-mix(in srgb, var(--chip-border) 16%, var(--surface))`. **Muted, never neon** —
think `#0078d7` blue, `#8cbd18` olive, `#ed616f` coral, `#393939` slate, not pure primaries.

### 8.2 Three ways to surface it (use together)
1. **Chip / pill** — a `--radius-full` pill with a leading filled **dot** in the category
   colour, the code + short name. This is the primary, always-legible token. Used in cells,
   filters, and legends.
2. **Left border on the row** — `border-left: 3–4px solid var(--chip-border)`. A quiet,
   always-on stripe that lets you scan a long table by category at a glance.
3. **Optional muted row tint** — fill the whole row with `--chip-bg` (or a 45% `color-mix`
   of it). Make this **toggleable** (the timesheet's `muted-background` option): some users
   want the calm border-only view, others want the colour wash. Default to the quieter one.

### 8.3 Legend
Whenever colour carries meaning, show a **legend** of chips mapping each colour to its label.
Colour is never the *only* signal — the code/name text is always present, so the system
works for colour-blind users and in print/PDF.

### 8.4 Full-day vs partial, and state variants
A category can carry more than one colour for sub-states (the timesheet's PPT uses a
red full-day vs amber partial-day pair). Model these as variant classes/props
(`c-PPT` vs `c-PPTp`) rather than inventing ad-hoc colours at the call site.

### 8.5 Dark mode
Tints are too dark to read directly inverted. Either define dark-mode `--chip-bg`/`--chip-text`
in the dark scope, or in dark mode show the chip as the border colour on a transparent fill
(`color-mix` the hue into the surface) and brighten slightly. Always re-check contrast.

### 8.6 Reuse across the family
The *same* category palette should drive chips, row borders, row tints, **and** chart
series — so a "Travel" expense is the same colour in the table, the legend, and the pie
chart. Define the palette once per app and pull from it everywhere.

---

## 9. Iconography

- **System:** Lucide — 2px-stroke outline icons. Size `1em`–18px, round caps/joins,
  `currentColor` so they inherit text colour. Bump stroke to 2.2–2.4 at very small sizes.
- **Status** is a small filled dot or a Lucide glyph + colour. **Never emoji.**
- Don't draw bespoke illustrations in SVG; prefer clean icons, real screenshots, or
  diagrams. No stock photos, no grain, no duotone.

---

## 10. Dark mode checklist

- Every colour goes through a semantic token; nothing hardcoded that can't invert.
- Page `#0d1117`, card `#161b22`, raised `#1c232c`; borders lighten, text lightens, accent
  shifts lighter (`--blue-400`-ish) for contrast on dark.
- Shadows get heavier/darker (already handled by the dark elevation tokens).
- Re-derive category tints (§8.5). Re-check chip and note contrast.
- Support both auto (`prefers-color-scheme`) and a manual `data-theme` override, persisted.

---

## 11. Do / Don't

**Do**
- Use one blue accent; let borders and whitespace do the work.
- Keep forms row-major; keep numbers in mono tabular.
- Colour-code categories with the muted chip/border/tint system, with a legend.
- Sentence case, exact numbers, honest empty/error states.
- Cap width, left-align, single-column-lean; comfortable 4px-grid spacing.
- Support light + dark through tokens.

**Don't**
- No gradients, photographic washes, textures, or glassmorphism.
- No emoji, no exclamation marks, no hype words, no Title Case.
- No neon semantic colours; no red/green gradient deltas.
- No bubbly radii (>16px on cards), no bouncy/springy motion.
- No shadow as decoration — only for things that truly float.
- Don't hardcode colours, strings, or the accent when a config can drive them.
- Don't redefine what the app *is* — restyle the surface, keep the behaviour.

---

*This brief governs surface only. When a real codebase or brand guide exists, reconcile
these tokens against it rather than overriding the product.*
