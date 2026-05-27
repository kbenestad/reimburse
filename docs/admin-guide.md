# Administrator Guide — Reimbursement Form

This guide is for the person responsible for deploying and configuring the reimbursement form for their organisation.

---

> Copyright 2026 Kristian Benestad. Licensed under the Apache License, Version 2.0. See LICENSE for more information.
>
> This is a custom build of kbenestad/reimburse for Boat People SOS and People Serving People Foundation.

---

## Architecture

The application is a static web app — a single HTML file that loads a YAML configuration file at runtime. There is no server-side logic, no database, and no build step.

```
app/
├── index.html        # Complete application
├── config.yml        # All organisation-specific settings
└── assets/
    └── logo.png      # Optional organisation logo (PNG or JPG)
```

The browser downloads the two CDN libraries at startup:
- `pdf-lib` 1.17.1 — PDF generation
- `js-yaml` 4.1.0 — YAML config parsing

Both are loaded from `unpkg.com`. Users need an internet connection to open the form for the first time; subsequent use within the same browser session does not re-fetch them.

---

## Deployment

1. Copy the `app/` directory to any static web server (Nginx, Caddy, Apache, S3 + CloudFront, GitHub Pages, etc.).
2. Ensure the server serves `.yml` files with a valid MIME type. Caddy does this automatically. For Nginx, add:
   ```nginx
   types { text/yaml yml; }
   ```
3. Access the form at the URL where `index.html` is served. No path configuration is needed inside the file.

The form works with any URL path. If you deploy at `https://intranet.example.org/finance/reimbursement/`, no changes to the source are required.

---

## Configuration reference — `config.yml`

All customisation is done in `config.yml`. The file is loaded fresh every time the page is opened, so changes take effect immediately without redeploying.

### Organisation identity

```yaml
organization: "Center for Asylum Protection"
logo: yes
logo-maxwidth: 4
```

| Key | Type | Required | Description |
|---|---|---|---|
| `organization` | string | Yes | Displayed in the form header and on the PDF. Used as a fallback if the logo is disabled or the image file is missing. |
| `logo` | `yes` / `no` | Yes | Whether to show a logo image. If `yes`, the app attempts to load `assets/logo.png`; if that fails, it tries `assets/logo.jpg`; if that also fails, it falls back to displaying the `organization` text. |
| `logo-maxwidth` | number (cm) | No | Maximum width of the logo in centimetres, applied in both the browser UI and the PDF. Default behaviour is unconstrained. Typical value: `4`. |

**Logo requirements:**
- Format: PNG (preferred) or JPG
- File must be placed at `assets/logo.png` (or `assets/logo.jpg`)
- The image is scaled to fit within `logo-maxwidth` cm width and 56 px height (UI) or 50 pt height (PDF), whichever is the binding constraint

### PDF page setup

```yaml
page-size: A4
```

| Key | Type | Required | Description |
|---|---|---|---|
| `page-size` | `A4` / `letter` | Yes | Paper size for PDF output. `A4` = 595.28 × 841.89 pt. `letter` = 612 × 792 pt. |

### Typography

```yaml
font-body: Helvetica
font-heading: Helvetica
font-monospace: Courier
font-size: 10
```

| Key | Type | Required | Description |
|---|---|---|---|
| `font-body` | string | Yes | Font used for body text in the PDF. Must be one of the standard PDF fonts: `Helvetica`, `Times`, or `Courier`. Custom TTF fonts are not yet supported. |
| `font-heading` | string | Yes | Font used for headings and labels in the PDF. Same options as `font-body`. |
| `font-monospace` | string | Yes | Font used for monospaced content. Recommended: `Courier`. |
| `font-size` | number (pt) | Yes | Base font size in points for PDF body text. Headings and labels are scaled relative to this. Typical range: 9–12. |

> **Note on fonts:** The current implementation always uses `Helvetica`/`HelveticaBold`/`Courier` regardless of what `font-body`, `font-heading`, and `font-monospace` are set to. Custom font selection is planned but not yet implemented.

### Branding

```yaml
accent-colour: "#1a3a5c"
```

| Key | Type | Required | Description |
|---|---|---|---|
| `accent-colour` | hex colour string | Yes | Primary brand colour. Applied as the `--accent` CSS variable in the browser UI (buttons, borders, headings) and as the heading/divider colour in the PDF. Must be a six-digit hex string including the `#` prefix. |

### Form text

```yaml
intro: ""
footer: "Confidential"
```

| Key | Type | Required | Description |
|---|---|---|---|
| `intro` | string | No | Optional introductory text shown on the first page of the PDF, above the staff/period/currency fields. Leave empty (`""`) to omit. Long text wraps automatically. |
| `footer` | string | No | Text printed at the bottom of every PDF page. Typical values: `"Confidential"`, `"Internal use only"`, or your organisation's name. |

### Currency settings

```yaml
currency-base: USD

currencies:
  - code: USD
    name: United States dollar
  - code: THB
    name: Thai baht
  - code: EUR
    name: Euro
  - code: NOK
    name: Norwegian krone
```

| Key | Type | Required | Description |
|---|---|---|---|
| `currency-base` | ISO 4217 code | Yes | The default base (reimbursement) currency. Must be present in the `currencies` list. All amounts on the PDF summary are converted to this currency. |
| `currencies` | list of `{code, name}` | Yes | All currencies available in the per-line currency dropdown. `code` must be an ISO 4217 three-letter code. `name` is shown in the dropdown for user reference only. |

**FX rate convention:** rates are expressed as units of the line currency per 1 unit of the base currency (e.g. 34.25 THB per 1 USD). Conversion is `base_amount = line_amount / fx_rate`.

**Adding a currency:** append a new `{code, name}` entry to `currencies`. No other changes are needed.

**Removing a currency:** remove its entry. Any existing PDF claims already generated are unaffected.

### Accounts

```yaml
accounts:
  - "1000 - General Operations"
  - "2000 - Travel & Transport"
  - "3000 - Office Supplies"
  - "4000 - Professional Services"
```

| Key | Type | Required | Description |
|---|---|---|---|
| `accounts` | list of strings | Yes | Dropdown options for the "Account" field on each expense line. Each string is shown verbatim. Typically formatted as `"CODE - Description"`. At least one entry is required. |

Selecting an account is mandatory for each line. The account code selected appears verbatim on the generated PDF.

### Programs

```yaml
programs:
  - "General Operations"
  - "Legal Aid Program"
  - "Protection Program"
  - Other
```

| Key | Type | Required | Description |
|---|---|---|---|
| `programs` | list of strings | Yes | Dropdown options for the "Program" field on each expense line. At least one entry is required. |

**Special value `Other`:** if the literal string `Other` is included in the list, selecting it in the form reveals an additional free-text field where the user must type the program name. The PDF will show `Other: [typed value]`. All other values are shown exactly as written.

---

## Changing configuration

1. Edit `app/config.yml` in any text editor.
2. Save the file and refresh the browser. Changes are live immediately.
3. Existing downloaded PDFs are not affected.

---

## Adding a logo

1. Prepare a PNG or JPG image of your logo. Transparent background (PNG) works best.
2. Place the file at `app/assets/logo.png` (create the `assets/` folder if it does not exist).
3. Set `logo: yes` in `config.yml`.
4. Set `logo-maxwidth` to the desired maximum width in centimetres.

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| Form shows "Failed to load: Cannot load config.yml" | Server not serving the YAML file, or file missing | Check the file path and server MIME type configuration |
| Logo does not appear | File missing or wrong path | Place file at `assets/logo.png` relative to `index.html` |
| Accent colour not applied | Malformed hex value | Use the format `"#rrggbb"` (six digits, with quotes, with `#`) |
| Currency not in dropdown | Missing from `currencies` list | Add the `{code, name}` entry to `currencies` |
| `currency-base` not selectable | Code not in `currencies` list | Add it to `currencies` before using it as `currency-base` |
| PDF fonts look wrong | Custom font specified | Only `Helvetica`, `Times`, `Courier` are currently supported |
