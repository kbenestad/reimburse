# Reimbursement Form — Agent Reference

> **Custom build** for [Boat People SOS](https://bpsos.org) and People Serving People Foundation. This branch (`bpsos-customisation`) contains org-specific configuration and any customisations made for those organisations.

Static browser app that collects expense data via a form UI and generates a PDF with attached receipts. No server, no build step — one HTML file + config.yml + optional logo.

## Repository layout

```
.
├── CLAUDE.md               # This file
├── README.md
├── LICENSE
├── docs/
│   ├── user-guide.md       # End-user instructions
│   ├── admin-guide.md      # Deployment and config.yml reference
│   └── developer-guide.md  # Fork/extend instructions, design notes
└── app/
    ├── index.html          # Entire application (~870 lines)
    ├── config.yml          # Runtime configuration (loaded via fetch at startup)
    └── assets/
        └── logo.png        # Optional logo (PNG or JPG)
```

## Architecture

Single-file app. CSS in `<style>`, JS in `<script>`. No framework, no build tools. Vanilla JS with DOM manipulation (no re-rendering — elements are created once, updated via event listeners). Two CDN dependencies loaded at runtime:

- **pdf-lib** 1.17.1 — PDF creation, image embedding, PDF merging (`unpkg.com`)
- **js-yaml** 4.1.0 — config.yml parsing (`unpkg.com`)

## Code sections (index.html)

| Banner | Approx lines | Contents |
|---|---|---|
| `UTILITIES` | 103–131 | `uid()`, `el()`, `fmtAmt()`, `defaultPeriod()` |
| `CONFIG` | 136–143 | `loadConfig()` — fetches and parses config.yml |
| `STATE` | 145–155 | `state` object, `newItem()`, `newLine()` |
| `CALCULATIONS` | 157–175 | `recalc()` |
| `CURRENCY DROPDOWN` | 177–195 | `makeCDD()` |
| `SELECT HELPER` | 197–208 | `makeSelect()` |
| `FORM RENDERING` | 210–469 | `render()`, `renderItem()`, `renderLine()`, `buildReceiptArea()` |
| `VALIDATION` | 471–500 | `validate()` |
| `PDF ENGINE` | 502–786 | `generatePDF()` and helpers |
| `GENERATE HANDLER` | 831–854 | `onGenerate()` |
| `INIT` | 856–869 | `init()` |

## State model

```js
state = {
  staff: string,           // persisted to localStorage('reimb-staff')
  periodFrom: string,      // YYYY-MM-DD
  periodTo: string,        // YYYY-MM-DD
  baseCurrency: string,    // ISO code; from CFG['currency-base']
  fxRateMemory: {},        // { [code]: '00.00000' } session cache
  items: Item[],
  _grandTotal: number      // computed by recalc()
}

Item = {
  id: string,
  name: string,
  lines: Line[],
  _subtotal: number        // computed by recalc()
}

Line = {
  id: string,
  date: string,            // YYYY-MM-DD
  description: string,
  currency: string,        // ISO code
  fxRate: string,          // '0.00000'; units of line currency per 1 base currency
  vendor: string,
  hasReceipt: boolean,
  receipts: Receipt[],
  noReceiptExplanation: string,
  amount: string,          // in line currency
  account: string,         // from CFG.accounts[]
  program: string,         // from CFG.programs[]
  programOther: string     // used when program === 'Other'
}

Receipt = {
  name: string,
  type: string,            // 'application/pdf' | 'image/png' | 'image/jpeg'
  data: ArrayBuffer
}
```

State is mutated directly. After any change that affects totals, call `recalc()` explicitly.

## Config keys — full reference

All config is accessed as `CFG['key']` after `jsyaml.load()`. Keys with hyphens must use bracket notation.

| JS access | YAML key | Type | Default | Notes |
|---|---|---|---|---|
| `CFG.organization` | `organization` | string | — | Org name; PDF header and logo fallback |
| `CFG.logo` | `logo` | `yes`/`no` | — | Checked as `=== true \|\| === 'yes'`; loads `assets/logo.png` then `assets/logo.jpg` |
| `CFG['logo-maxwidth']` | `logo-maxwidth` | number (cm) | unconstrained | Converted to pt by `× 28.3465` for PDF; applied as `maxWidth` CSS in UI |
| `CFG['page-size']` | `page-size` | `'A4'`/`'letter'` | `'A4'` | A4: 595.28×841.89 pt; letter: 612×792 pt |
| `CFG['font-body']` | `font-body` | string | `'Helvetica'` | Parsed but currently unused (hardcoded to StandardFonts) |
| `CFG['font-heading']` | `font-heading` | string | `'Helvetica'` | Parsed but currently unused |
| `CFG['font-monospace']` | `font-monospace` | string | `'Courier'` | Parsed but currently unused |
| `CFG['font-size']` | `font-size` | number (pt) | `10` | PDF base size; `szSm = sz-1`, `szLg = sz+4`, `lh = sz+4` |
| `CFG['accent-colour']` | `accent-colour` | hex string | `'#1a3a5c'` | Set as CSS `--accent`; converted via `parseHex()` for PDF |
| `CFG.intro` | `intro` | string | `''` | Rendered on PDF page 1 before header fields; omitted if empty |
| `CFG.footer` | `footer` | string | `''` | Bottom of every PDF page |
| `CFG['currency-base']` | `currency-base` | ISO code | — | Initial `state.baseCurrency`; must be in `currencies` list |
| `CFG.currencies` | `currencies` | `{code, name}[]` | — | Options for per-line currency dropdown |
| `CFG.accounts` | `accounts` | `string[]` | — | Options for account dropdown; selection required per line |
| `CFG.programs` | `programs` | `string[]` | — | Options for program dropdown; literal `'Other'` triggers text input |

## Validation rules

`validate()` returns `string[]`. Empty array means valid.

- `state.staff` — required (non-empty after trim)
- `state.periodFrom`, `state.periodTo` — both required
- `state.items.length > 0` — at least one item
- Per item: `name` required; `lines.length > 0`
- Per line:
  - `date` — required
  - `description` — required
  - `vendor` — required
  - `amount` — required; must parse as positive float
  - `fxRate` — required positive float if `currency !== baseCurrency`
  - `account` — required
  - `program` — required
  - if `program === 'Other'`: `programOther` required
  - if `hasReceipt === true`: `receipts.length > 0`
  - if `hasReceipt === false`: `noReceiptExplanation` required

## PDF layout

**Coordinate system:** origin bottom-left, Y increases upward.

**Margins:** top 50, bottom 65, left 50, right 50 (pt).

**Usable width:** `W = pageW - 100`.

**Column positions** (inside line blocks):
```
c1 = 0          // Date
c2 = W * 0.22   // Vendor
c3 = W * 0.68   // Currency, Receipt label
c4 = W * 0.82   // FX rate, Amount label
```
Program: `W * 0.5`. Account: left edge.

**Header columns:** Staff at left, Period at `W * 0.5`, Currency at `W * 0.8`.

**Page break:** `needSpace(h)` checks `y - h < marginBottom`; if so, calls `addPage()` which draws a continuation header (staff name + period + divider).

**Four-pass PDF build:**
1. Form pages + receipt placeholder recording (`receiptRefs[]`)
2. Receipt pages — PDF merging and image embedding (`receiptPageMap{}`)
3. Backfill receipt references ("See page N for receipt")
4. Footers on all pages (page X/Y, printed timestamp, staff name)

**Downloaded filename:** `reimbursement_[staff]_[from]_[to].pdf` (spaces replaced with `_`).

## FX rate convention

Rate = units of line currency per 1 base currency.

```
base_amount = line_amount / fxRate
```

Example: 1000 THB at rate 34.25000 → 1000/34.25 = 29.20 USD.

The `fxRate` field is locked to `'1.00000'` (readonly) when `line.currency === state.baseCurrency`. FX rates are cached in `state.fxRateMemory[code]` while the page is open.

## Key design decisions

**`makeCDD` — custom currency dropdown:** native `<select>` cannot show code+name two-line options that collapse to code-only. Built as a positioned div with click-outside-to-close via a document-level listener.

**Receipt storage as ArrayBuffer:** files are stored raw in state, ready for pdf-lib without re-reading. Memory is proportional to total file size.

**No re-rendering:** DOM is mutated in-place. Exception: `buildReceiptArea()` replaces the receipt area div when file list or toggle changes.

**Period auto-fill:** `defaultPeriod()` returns the previous calendar month. Exception: if today is the last day of the month, returns the current month.

**localStorage key:** `reimb-staff` — staff name only; no other state is persisted.

## Common tasks (checklist)

**Add a field to an expense line:**
1. `newLine()` — add field with default
2. `renderLine()` — create DOM, wire event listener, call `recalc()` if it affects amounts
3. `validate()` — add error if required
4. `generatePDF()` — render value at appropriate position

**Add a config option:**
1. Add to `config.yml`
2. Read as `CFG['your-key']` in JS
3. No other registration needed

**Change PDF column layout:**
Edit `c1`–`c4` constants inside the `item.lines.forEach` block in `generatePDF()`.

**Implement custom TTF fonts:**
1. `const bytes = await fetch('assets/Font.ttf').then(r => r.arrayBuffer())`
2. `const font = await doc.embedFont(bytes)`
3. Replace `StandardFonts.Helvetica` references with the embedded font

## Known limitations

| Limitation | Detail |
|---|---|
| Custom fonts not embedded | `font-body`/`font-heading`/`font-monospace` config keys parsed but ignored; hardcoded to Helvetica/Courier |
| Password-protected PDFs fail | pdf-lib cannot decrypt; error page inserted instead |
| No offline support | CDN dependencies require network on first load |
| Large receipts stress memory | All ArrayBuffers held in JS heap |
| Long text truncated with `…` | Most PDF fields truncate to fit column width; only `intro` and `noReceiptExplanation` wrap |

## Deployment

Static files served from any HTTP server. No build step. Place `app/` at the target path. The server must serve `.yml` files (Caddy does this by default; for Nginx add `text/yaml yml` to `types {}`).

Local development: `python3 -m http.server 8080` from the `app/` directory. Do not open `index.html` via `file://` — `fetch('config.yml')` is blocked on that origin.

## Human-readable docs

- `docs/user-guide.md` — filling in the form (staff audience)
- `docs/admin-guide.md` — deployment and all config.yml keys (admin audience)
- `docs/developer-guide.md` — architecture, state, PDF engine, modification patterns (developer audience)
