# User Guide — Reimbursement Form

This guide is for staff submitting expense reimbursement claims.

---

## Overview

The reimbursement form runs in your browser. You fill in your expenses, attach receipts, and click one button to download a PDF. No account, login, or internet upload is needed — the PDF is generated entirely on your device.

---

## Step-by-step

### 1. Open the form

Navigate to the URL your administrator has given you (e.g. `https://app.example.org/reimbursement/`). The form loads in a few seconds. If you see an error, check your internet connection — the form needs to reach CDN servers to load its libraries.

### 2. Fill in the header fields

At the top of the form you will see four fields:

| Field | What to enter |
|---|---|
| **Staff** | Your full name. This is saved in your browser and pre-filled next time. |
| **Period from** | Start date of the expense period (defaults to the first day of last month). |
| **to** | End date of the expense period (defaults to the last day of last month). |
| **Base currency** | The currency your reimbursement will be paid in. Select from the dropdown. |

> **Period default logic:** On the last day of the current month, the period defaults to the current month instead of the previous one.

### 3. Add items

An "item" groups related expenses — for example, a trip, a project, or a category. Click **+ Add item / project / travel** to create one. Give the item a descriptive name (e.g. "Field visit to Chiang Rai, March 2026").

You can add as many items as you need and remove any item with the **✕ Remove** button.

### 4. Add expense lines

Each item contains one or more expense lines. A line represents a single purchase or payment. Click **+ Add line** inside an item to add a line.

Each line has the following fields:

#### Date
The date the expense was incurred. Use the date picker or type `YYYY-MM-DD`.

#### Vendor
The name of the shop, service provider, or payee. Example: "Bangkok Airways", "Office Depot".

#### Currency
The currency in which you paid. Select from the dropdown. Each option shows the currency code (e.g. `THB`) and the full name (e.g. "Thai baht").

#### FX rate
How many units of the line currency equal one unit of the base currency.

- Example: if base currency is USD and you paid in THB, enter the number of Thai baht per 1 US dollar (e.g. `34.25000`).
- If the line currency is the same as the base currency, this field is locked at `1.00000` and you cannot change it.
- The form remembers FX rates you have entered for each currency during the session.

> **FX rate direction:** `line_amount ÷ fx_rate = base_amount`. Always use the rate as "how many [line currency] per 1 [base currency]".

#### Description
A brief description of what was purchased or paid for. Example: "Taxi from airport to hotel".

#### Receipt
Select **Yes** if you have a receipt, **No** if you do not.

- **Yes:** Upload one or more receipt files (PDF, JPG, or PNG). Each file will be embedded at the end of the PDF output. You can remove an uploaded file and re-upload.
- **No:** A text box appears. You must explain why no receipt is available (e.g. "Toll fees — no receipt issued"). This explanation will appear on the PDF.

#### Amount
The amount paid, in the line currency (not converted). Enter a positive number. Example: `1850.00`.

#### Account
Select the accounting code that this expense belongs to. The options are configured by your administrator.

#### Program
Select the program or project this expense relates to. If you select **Other**, a text field appears where you must type the program name.

### 5. Review totals

Each item shows a **Subtotal** in the base currency. The bottom of the form shows the **Total reimbursement claim**. These update as you type.

### 6. Generate the PDF

Click **Generate Reimbursement Form**. The form validates all fields first. If anything is missing or incorrect, a red box at the top lists the problems — fix them and click again.

When validation passes, the PDF is generated in your browser and downloaded automatically. The filename is:

```
reimbursement_[Your_Name]_[from-date]_[to-date].pdf
```

### 7. Submit the PDF

Send the downloaded PDF to whoever handles reimbursements at your organisation. No further action is needed in the browser.

---

## Tips

- **Your name is remembered.** It is stored in your browser's local storage so you do not need to retype it next visit.
- **FX rates are remembered within a session.** If you enter a rate for THB and then switch to USD and back, the THB rate is restored.
- **Large receipt files slow PDF generation.** If the browser appears frozen after clicking "Generate", wait — it is processing the files.
- **Password-protected PDFs cannot be merged.** If a receipt PDF is password-protected, the output will contain an error page in its place. Use a non-protected version.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Form shows "Loading configuration…" indefinitely | Network issue or server misconfiguration | Check internet connection; contact your administrator |
| "Failed to load: Cannot load config.yml" | Server is not serving the config file | Contact your administrator |
| PDF download starts but contains error text | A receipt PDF is password-protected or corrupt | Replace the file with an unprotected version |
| Amounts show as "–" in the PDF | Amount field left blank or non-numeric | Enter a valid number in the amount field |
| FX rate field is greyed out | Line currency equals the base currency | No action needed; rate is 1.00000 by definition |
