# kBenestad theme for Forgejo

The kBenestad design language as a Forgejo theme — Nordic-minimal, light-first,
one calm blue accent. Ships in **light**, **dark**, and **auto** (follows the
visitor's OS preference).

| File | Theme name | Notes |
|------|------------|-------|
| `theme-kbenestad-light.css` | `kbenestad-light` | cool paper ground, slate ink |
| `theme-kbenestad-dark.css`  | `kbenestad-dark`  | deep slate, brightened blue |
| `theme-kbenestad-auto.css`  | `kbenestad-auto`  | light by day, dark by night |

## How it works

Each theme defines a **complete, self-contained** kBenestad variable set — every
`--color-*`, the type stack, and the corner radii — then layers a small set of
**structural overrides** that carry the identity the colors alone can't: Schibsted
Grotesk / JetBrains Mono type, accent-soft topic pills, flat primary buttons, and
hairline 8px cards. It also `@import`s Forgejo's matching shipped theme as a
harmless safety net (it fills any future upstream variables if present, and is
silently ignored if absent), so the theme keeps working across upgrades.

## Matching the kBenestad mark

The brand direction is **Stack**. Final SVGs live in the design system under
`assets/logo/`. To dress Forgejo:

| Forgejo path | Use this file |
|---|---|
| `custom/public/img/logo.svg`    | `mark-stack-color.svg` (or `app-icon.svg` for a tiled mark) |
| `custom/public/img/favicon.svg` | `favicon.svg` |

No restart needed — hard refresh. For the reversed navbar on the dark theme the
mark already inherits `currentColor` where possible; if you want a fixed reverse,
use `mark-stack-white.svg`.

## Install

1. Copy the `.css` files into your custom assets CSS directory:

   ```
   <FORGEJO_CUSTOM>/public/assets/css/
   ```

   On most installs `FORGEJO_CUSTOM` is `/data/gitea` (Docker) or the `custom/`
   folder beside your `app.ini`. The files must sit next to the shipped
   `theme-forgejo-*.css` so the relative `@import`s resolve.

2. Register the themes in `app.ini` under `[ui]`:

   ```ini
   [ui]
   THEMES = forgejo-auto,forgejo-light,forgejo-dark,kbenestad-auto,kbenestad-light,kbenestad-dark
   DEFAULT_THEME = kbenestad-auto
   ```

   Or via environment variables (Docker):

   ```
   FORGEJO__ui__THEMES=forgejo-auto,forgejo-light,forgejo-dark,kbenestad-auto,kbenestad-light,kbenestad-dark
   FORGEJO__ui__DEFAULT_THEME=kbenestad-auto
   ```

3. A hard refresh is enough — no restart needed for CSS changes. Users can also
   pick the theme per-account under **Settings → Appearance**.

## Fonts

The themes load **Schibsted Grotesk** and **JetBrains Mono** from Google Fonts via
`@import` at the top of each file, and force the families directly so they apply
the instant the fonts are available.

### If the type still looks like the system font

This means the **web font never loaded** — the colors and layout will look right,
but text falls back to your OS sans-serif. The `@import` from `fonts.googleapis.com`
is being blocked. Common causes:

- A privacy / tracker blocker in the browser (Vivaldi's built-in blocker, uBlock,
  Privacy Badger, etc.) blocks Google Fonts domains.
- A reverse-proxy or `[security]` Content-Security-Policy that disallows external
  styles/fonts.
- The instance is offline / air-gapped.

**Fix — self-host the fonts (recommended, bulletproof):**

1. Download the woff2 files:
   - Schibsted Grotesk (400/500/600/700) — <https://fonts.google.com/specimen/Schibsted+Grotesk>
   - JetBrains Mono (400/500/600) — <https://fonts.google.com/specimen/JetBrains+Mono>
2. Drop them in `custom/public/assets/fonts/`.
3. Delete the `@import url('https://fonts.googleapis.com/…')` line at the top of
   each kBenestad theme file and paste a local block in its place, e.g.:

   ```css
   @font-face {
     font-family: "Schibsted Grotesk";
     font-weight: 400 800;
     font-display: swap;
     src: url("/assets/fonts/SchibstedGrotesk.woff2") format("woff2");
   }
   @font-face {
     font-family: "JetBrains Mono";
     font-weight: 400 600;
     font-display: swap;
     src: url("/assets/fonts/JetBrainsMono.woff2") format("woff2");
   }
   ```

   (Adjust filenames to the files you downloaded. `/assets/fonts/…` is served
   directly by Forgejo from `custom/public/assets/fonts/`.)

The `--fonts-proportional` / `--fonts-monospace` variables already point at the
right family names, so no other change is needed.

## Troubleshooting — "the theme deployed but it still looks stock"

Forgejo's compiled `index.css` is the raw Fomantic/Semantic-UI base, which
*hardcodes* legacy colours (`.ui.primary.button{background:#2185d0}`,
`.ui.button{background:#e0e1e2}`, `.ui.label`…). Your `--color-*` variables only
take effect once the theme stylesheet that re-points those components onto the
variables is the one actually loaded. If the page still looks like default
Forgejo, work down this list:

1. **Stale cache (most common).** Forgejo serves files in
   `custom/public/assets/css/` with a 6-hour browser cache and **no `?v=` buster**
   (unlike the versioned `index.css?v=9.0.3~gitea-1.22.0`). After editing a theme
   file, the browser keeps the old copy. Fix: hard-refresh (Ctrl/Cmd-Shift-R), or
   bump `STATIC_CACHE_TIME` down while iterating, or append a throwaway query when
   testing. A server restart does **not** clear the *browser's* copy.
2. **Theme not selected.** Confirm `DEFAULT_THEME = kbenestad-light` (or `-auto`)
   in `[ui]`, *and* that your account isn't pinned to another theme under
   **Settings → Appearance**. A per-user choice overrides the default.
3. **Quick sanity check.** Open dev-tools → inspect `<body>` → Computed →
   `--color-primary`. It must read `#2f6fed` (ours), not `#4183c4`/`#2185d0`
   (stock). If it's the stock value, the kBenestad file isn't winning the cascade
   — that's cause 1 or 2, not the CSS itself.
4. **Right file path.** The `.css` must sit in `custom/public/assets/css/` so it's
   served at `/assets/css/theme-kbenestad-light.css` and the relative
   `@import "./theme-forgejo-light.css"` resolves next to it.

## What the theme recolours (and what it can't)

Pulled onto the brand: primary/positive buttons, repo-header owner/name, repo
tabs (active label + accent underline) and their count pills, topic chips,
dropdown/pagination active states, form-focus rings, checkboxes/toggles and
progress bars. **Language bars** (the Go/Shell/HTML stripe on the repo home) are
**not** themeable — Forgejo emits those segment colours as inline styles from its
per-language colour table, so they stay their canonical hues by design.

## Tweaking the accent

The entire accent ramp derives from the Nordic blue `#2f6fed`. To shift it, edit
the `--color-primary*` block (and the matching `rgba(47, 111, 237, …)` alpha
values) in each theme file.

## Compatibility

Built against the modern Forgejo CSS-variable theming system (Forgejo v7.0+).
Gitea compatibility is likely but untested.
