# Developer Guide — Reimbursement Form

This guide is for developers who want to fork, extend, or modify the reimbursement form.

---

> Copyright 2026 Kristian Benestad. Licensed under the Apache License, Version 2.0. See LICENSE for more information.
>
> This is a custom build of kbenestad/reimburse for Boat People SOS and People Serving People Foundation.

---

## Repository layout

```
.
├── CLAUDE.md               # Agent-oriented reference (architecture, state, tasks)
├── README.md
├── LICENSE
├── docs/
│   ├── user-guide.md
│   ├── admin-guide.md
│   └── developer-guide.md  # this file
└── app/
    ├── index.html          # Entire application (~870 lines)
    ├── config.yml          # Runtime configuration
    └── assets/
        └── logo.png        # Optional organisation logo
```

---

## Technology

| Concern | Technology |
|---|---|
| UI | Vanilla JS — DOM manipulation, no framework, no virtual DOM |
| PDF generation | [pdf-lib](https://pdf-lib.js.org/) 1.17.1 via CDN |
| Config parsing | [js-yaml](https://github.com/nodeca/js-yaml) 4.1.0 via CDN |
| Build | None — single HTML file served as-is |

There is no `package.json`, no bundler, and no transpilation step. The file runs directly in any modern browser.

---

## Code structure inside `index.html`

The JS is one immediately-invoked async function. Sections are separated by `// ===` banners:

| Section | Line range | Purpose |
|---|---|---|
| UTILITIES | ~103–131 | `uid()`, `el()`, `fmtAmt()`, `defaultPeriod()` |
| CONFIG | ~136–143 | `loadConfig()` — fetches and parses `config.yml` |
| STATE | ~145–155 | `state` object, `newItem()`, `newLine()` |
| CALCULATIONS | ~157–175 | `recalc()` — recomputes subtotals and grand total |
| CURRENCY DROPDOWN | ~177–195 | `makeCDD()` — custom two-line currency picker |
| SELECT HELPER | ~197–208 | `makeSelect()` — standard `<select>` builder |
| FORM RENDERING | ~210–469 | `render()`, `renderItem()`, `renderLine()`, `buildReceiptArea()` |
| VALIDATION | ~471–500 | `validate()` — returns array of error strings |
| PDF ENGINE | ~502–786 | `generatePDF()` and helpers |
| GENERATE HANDLER | ~831–854 | `onGenerate()` — wires validation to PDF generation |
| INIT | ~856–869 | `init()` — entry point |

---

## State model

```js
state = {
  staff: string,            // Full name, persisted in localStorage('reimb-staff')
  periodFrom: string,       // YYYY-MM-DD
  periodTo: string,         // YYYY-MM-DD
  baseCurrency: string,     // ISO code from CFG['currency-base']
  fxRateMemory: {},         // { [currencyCode]: '00.00000' } — session cache
  items: Item[],
  _grandTotal: number       // computed by recalc()
}

Item = {
  id: string,               // uid()
  name: string,
  lines: Line[],
  _subtotal: number         // computed by recalc()
}

Line = {
  id: string,               // uid()
  date: string,             // YYYY-MM-DD
  description: string,
  currency: string,         // ISO code
  fxRate: string,           // '0.00000' — units of line currency per 1 base currency
  vendor: string,
  hasReceipt: boolean,
  receipts: Receipt[],
  noReceiptExplanation: string,
  amount: string,           // in line currency
  account: string,          // one of CFG.accounts[]
  program: string,          // one of CFG.programs[]
  programOther: string      // used when program === 'Other'
}

Receipt = {
  name: string,             // original filename
  type: string,             // MIME type: 'application/pdf', 'image/png', 'image/jpeg'
  data: ArrayBuffer         // raw file bytes
}
```

State is mutated directly — there is no reactivity system. After any change that affects totals, call `recalc()` explicitly.

---

## Config keys read by the JS

| JS expression | Config key | Type | Notes |
|---|---|---|---|
| `CFG['accent-colour']` | `accent-colour` | string | Hex colour applied via CSS variable and used in PDF |
| `CFG['page-size']` | `page-size` | string | `'A4'` or `'letter'` |
| `CFG['font-size']` | `font-size` | number | Base pt size; `sz` in PDF engine |
| `CFG['font-body']` | `font-body` | string | Parsed but currently unused (hardcoded to Helvetica) |
| `CFG['font-heading']` | `font-heading` | string | Parsed but currently unused |
| `CFG['font-monospace']` | `font-monospace` | string | Parsed but currently unused |
| `CFG.logo` | `logo` | `true` / `'yes'` / `false` / `'no'` | Checked with `=== true \|\| === 'yes'` |
| `CFG['logo-maxwidth']` | `logo-maxwidth` | number | cm; converted to pt by `× 28.3465` |
| `CFG.organization` | `organization` | string | Fallback text and PDF org header |
| `CFG['currency-base']` | `currency-base` | string | Initial value for `state.baseCurrency` |
| `CFG.currencies` | `currencies` | `{code, name}[]` | Currency dropdown options |
| `CFG.accounts` | `accounts` | `string[]` | Account dropdown options |
| `CFG.programs` | `programs` | `string[]` | Program dropdown options |
| `CFG.intro` | `intro` | string | Rendered on first PDF page; empty string omits it |
| `CFG.footer` | `footer` | string | Printed at bottom of every PDF page |

---

## PDF engine

### Coordinate system

pdf-lib uses a bottom-left origin. Y increases upward.

| Page size | Width (pt) | Height (pt) |
|---|---|---|
| A4 | 595.28 | 841.89 |
| letter | 612 | 792 |

Margins: top 50 pt, bottom 65 pt, left 50 pt, right 50 pt.

The cursor variable `y` starts at `pageH - marginTop` and decrements as content is drawn. `needSpace(h)` checks `y - h < marginBottom` and calls `addPage()` if a page break is needed.

### Column positions

Within each expense line the usable width `W = pageW - 100` is divided using fixed proportions:

```js
const c1 = 0;         // Date column — left edge
const c2 = W * 0.22;  // Vendor column
const c3 = W * 0.68;  // Currency / Receipt columns
const c4 = W * 0.82;  // FX rate / Amount columns
```

Program label is at `W * 0.5`. Account starts at `c1`.

### Two-pass receipt page reference

The PDF is built in four passes:

1. **Form pages:** draw all item/line content. For each receipt, record `{ pageIdx, x, y, key }` in `receiptRefs[]` — placeholder positions.
2. **Receipt pages:** append embedded PDFs (page by page) and images (scaled to fit). Build `receiptPageMap[key] = pageNumber`.
3. **Reference backfill:** go back to each recorded position and draw `"See page N for receipt"`.
4. **Footers:** iterate all pages and draw the footer line with page X/Y and printed timestamp.

### Fonts

Three fonts are embedded from the standard PDF font set:

```js
const fontBody = await doc.embedFont(StandardFonts.Helvetica);
const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
const fontMono = await doc.embedFont(StandardFonts.Courier);
```

Custom TTF embedding is not yet wired despite the config keys being present.

### Font sizes

```js
const sz   = CFG['font-size'] || 10;   // body
const szSm = sz - 1;                   // labels
const szLg = sz + 4;                   // title, org name
const lh   = sz + 4;                   // line height
```

---

## Common modification tasks

### Add a new field to an expense line

Follow this checklist in order:

1. **`newLine()`** — add the field with its default value.
2. **`renderLine()`** — create and wire the DOM element; update state in an event listener; call `recalc()` if the field affects amounts.
3. **`validate()`** — add an error string if the field is required.
4. **`generatePDF()`** — render the field value at the appropriate position.

### Add a new config option

1. Add the key and value to `config.yml`.
2. Read it in JS as `CFG['your-key']` (or `CFG.yourKey` if it has no hyphens).
3. No other registration is needed — `jsyaml.load()` makes all keys available.

### Change PDF column proportions

Edit the `c1`–`c4` constants inside the `item.lines.forEach` block in `generatePDF()`. They are local to that scope. The header layout (Staff/Period/Currency) uses separate constants `col2 = W * 0.5` and `col3 = W * 0.8`.

### Implement custom TTF fonts

The config keys `font-body`, `font-heading`, `font-monospace` are parsed but not used. To implement:

1. Fetch the TTF file: `const fontBytes = await fetch('assets/MyFont.ttf').then(r => r.arrayBuffer())`.
2. Embed it: `const fontBody = await doc.embedFont(fontBytes)`.
3. Replace the `StandardFonts.Helvetica` call with the embedded font.
4. Do the same for bold and monospace variants.

Note: pdf-lib requires the font to be a valid OpenType/TrueType file. Subset embedding is done automatically.

### Add a new top-level form field (not per-line)

1. Add the field to `state` in the module-level `state` declaration.
2. Render it in `render()`, between the header and the divider.
3. Add validation in `validate()`.
4. Render it in `generatePDF()` in the header section (around the Staff/Period/Currency row).

---

## Key design decisions

**Custom currency dropdown (`makeCDD`):** The native `<select>` element cannot display two-line options (code on line 1, name on line 2) that collapse to code-only in the closed state. The custom dropdown is a positioned `div` with click-outside-to-close via a document-level listener.

**FX rate direction:** The rate is "units of line currency per 1 base currency". This means `base_amount = line_amount / fx_rate`. Example: if base is USD and line is THB at rate 34.25, then 1000 THB = 1000/34.25 = 29.20 USD.

**Receipt storage as ArrayBuffer:** Files are stored as `ArrayBuffer` in state (not as object URLs or base64). This keeps them ready for pdf-lib without re-reading. Memory use is proportional to total receipt file size.

**No re-rendering:** DOM elements are created once by `render()`/`renderItem()`/`renderLine()` and mutated in-place by event listeners. The only exception is the receipt area (`buildReceiptArea`), which is replaced when the file list or receipt toggle changes.

**`localStorage` for staff name:** Keyed as `reimb-staff`. This persists the most frequently retyped field across sessions without requiring a server.

**Period default logic:** `defaultPeriod()` returns the previous calendar month in most cases. Exception: if today is the last day of the month, it returns the current month (on the assumption that the user is filing for the month just ending).

---

## Known limitations and planned work

| Limitation | Notes |
|---|---|
| Custom TTF fonts not embedded | Config keys present but code uses StandardFonts only |
| Password-protected PDF receipts fail | pdf-lib cannot decrypt; an error page is inserted instead |
| No offline support | CDN-loaded libraries require internet on first load |
| Large receipts stress browser memory | ArrayBuffer approach stores all bytes in RAM |
| PDF text truncated with `…` | Long field values are cut to fit the fixed column width |
| No multi-line PDF text in most fields | Only `intro` and `noReceiptExplanation` wrap; other fields truncate |

---

## Testing

There is no automated test suite. To test manually:

1. Open `app/index.html` via a local HTTP server (e.g. `python3 -m http.server 8080` from the `app/` directory, then open `http://localhost:8080`).
2. Opening `index.html` as a `file://` URL will fail — `fetch('config.yml')` is blocked by browser security on `file://` origins.
3. Exercise the form: add items and lines, attach receipts (PDF, PNG, JPG), toggle the receipt Yes/No, use non-base currencies, and generate a PDF.
4. Verify the generated PDF: check totals, receipt embedding, page references, footers, and column layout.

---

## Deployment checklist

- [ ] `config.yml` is updated for the target organisation
- [ ] `assets/logo.png` placed if `logo: yes`
- [ ] Web server serves `.yml` with a valid MIME type (`text/yaml`)
- [ ] URL is accessible to intended users
- [ ] Browser test: open form, fill in one claim, generate PDF, verify output
