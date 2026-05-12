# Reimbursement Form App

Static browser app that collects expense data via a form UI and generates a PDF with attached receipts. No server, no build step — one HTML file + config.yml + assets.

## Architecture

```
reimbursement/
├── index.html      # Complete app (HTML + CSS + JS, ~850 lines)
├── config.yml      # All configurable values (parsed at runtime via js-yaml)
├── assets/
│   └── logo.png    # Optional org logo
└── CLAUDE.md
```

Single-file app. CSS is in `<style>`, JS is in `<script>`. No framework, no build tools. Vanilla JS with DOM manipulation (no re-rendering — elements are created once, updated via event listeners).

## Dependencies (CDN, loaded at runtime)

- **pdf-lib** (1.17.1) — PDF creation, image embedding, PDF merging. Loaded from unpkg.
- **js-yaml** (4.1.0) — config.yml parsing. Loaded from unpkg.

No npm, no node_modules, no bundler.

## Key design decisions

- **Custom currency dropdown** (`makeCDD`): native `<select>` can't show two-line options (code + name) that collapse to code-only. Built as a positioned div with click-outside-to-close.
- **FX rate direction**: "units of line currency per 1 base currency" (e.g. 32.00000 THB per 1 USD). Conversion: `base_amount = line_amount / fx_rate`. Rate field locks to 1.00000 when line currency = base currency.
- **Receipt storage**: `File.arrayBuffer()` stored in state. Memory-heavy for many large files but acceptable for typical reimbursement volumes (10-20 receipts).
- **PDF page references**: two-pass approach. First pass renders form pages and records placeholder positions for "See page X" text. Second pass adds receipt pages, then backfills page numbers at recorded positions. Footers (Page X/Y) added last after total page count is known.
- **Period auto-fill**: previous month by default; current month if today is the last day of the month.
- **Staff name**: cached in `localStorage` under key `reimb-staff`.

## State model

```
state.staff         string
state.periodFrom    string (YYYY-MM-DD)
state.periodTo      string (YYYY-MM-DD)
state.items[]
  .id               string (uid)
  .name             string
  ._subtotal        number (calculated, base currency)
  .lines[]
    .id             string (uid)
    .date           string (YYYY-MM-DD)
    .description    string
    .currency       string (ISO code)
    .fxRate         string (5 decimal places)
    .vendor         string
    .hasReceipt     boolean
    .receipts[]     { name, type, data: ArrayBuffer }
    .noReceiptExplanation  string
    .amount         string
    .account        string
    .program        string
    .programOther   string
```

No reactivity system. State is mutated directly by event listeners; `recalc()` is called explicitly after any change that affects totals.

## config.yml schema

| Key | Type | Notes |
|-----|------|-------|
| `organization` | string | Shown if logo disabled or missing |
| `logo` | `yes`/`no` | Loads `assets/logo.png`, falls back to `.jpg` |
| `logo-maxwidth` | number | cm — applied to both UI and PDF |
| `page-size` | `A4`/`letter` | PDF output size |
| `font-body`, `font-heading`, `font-monospace` | string | `Helvetica`/`Times`/`Courier` or `.ttf` path (TTF not yet implemented) |
| `font-size` | number | Base pt size for PDF |
| `accent-colour` | hex string | Applied as CSS variable and PDF heading/divider color |
| `intro` | string | Rendered on PDF above form fields |
| `footer` | string | Bottom of every PDF page |
| `currency-base` | string | ISO code, must appear in currencies list |
| `currencies[]` | `{code, name}` | Populates currency dropdowns |
| `accounts[]` | string[] | Dropdown options |
| `programs[]` | string[] | `"Other"` triggers a text field |

## PDF layout (pdf-lib coordinate system)

- Origin: bottom-left. Y increases upward.
- A4: 595.28 × 841.89 pt. Letter: 612 × 792 pt.
- Margins: top 50, bottom 65, left 50, right 50.
- Cursor (`y`) starts at `pageHeight - marginTop`, decrements downward.
- `needSpace(h)` checks if `y - h < marginBottom`; if so, calls `addPage()` which draws the continuation header.
- Fonts: StandardFonts only (Helvetica, HelveticaBold, Courier). Custom TTF embedding is stubbed in config but not yet wired.

## Common tasks

**Add a new form field**: add to `newLine()` defaults → add UI in `renderLine()` → add validation in `validate()` → add PDF rendering in `generatePDF()`.

**Change PDF layout**: all layout happens in `generatePDF()`. Column positions are defined as proportions of usable width (`W`). Adjust `c1`–`c4` and `r2v`/`r2r`/`r2a` variables.

**Add a new config option**: add to `config.yml` → read from `CFG['key-name']` in JS.

## Deployment

Static files served from a web server. No build step. Drop the directory at the target path (e.g. `app.capthailand.org/reimbursement/`). Ensure the server serves `.yml` files with a valid MIME type (Caddy does this by default).

## Known limitations

- Custom TTF fonts referenced in config are not yet embedded in PDFs (falls back to standard fonts)
- Password-protected PDF receipts will fail to merge
- No offline support (CDN dependencies)
- Large receipt volumes may stress browser memory
- PDF form layout has fixed column proportions — very long field values get truncated with `…`
