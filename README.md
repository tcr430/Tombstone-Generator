# Deal Tombstone Generator (MVP)

Internal web app to generate premium portrait investment banking tombstones with strict layout rules, live preview, and export (PNG/JPEG/SVG).

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS

## Features

- Left panel structured form + right panel live tombstone preview
- One controlled premium portrait template (v1)
- Name-less top structure focused on logo and whitespace discipline
- Single mode and Bulk mode
- Global typography settings (top-right): font family + font size scale, applied to preview and exports
- Language-aware formatting:
  - Portuguese value: `x.xxx.xxx €`
  - English value: `€ x,xxx,xxx`
  - Month + year rendering in selected language
- Export formats:
  - PNG
  - JPEG
  - SVG
  - Editable PPTX (single mode)
- Exact 300 DPI export dimensions by size:
  - Small: `378 x 472`
  - Medium: `567 x 709`
  - Large: `756 x 945`
- Validation + guardrails:
  - Required fields
  - Required client name for filename pattern
  - Max description length
  - Logo type/size validation
  - Disabled download until valid
  - Reset button
- Bulk processing:
  - Upload one spreadsheet (deal rows)
  - Upload one logos zip (`logo_key` maps to file name without extension)
  - Validate rows with per-row status
  - Generate one zip with all tombstones
  - Generate one editable PowerPoint deck with configurable layout: 4 (2x2), 6 (3x2), or 8 (4x2) tombstones per slide
  - Bulk global settings (language, size, format, background), with transparent as default
  - Max 100 deals per bulk file
  - ESG flag support (`1` ESG / `0` non-ESG) with top-right icon rendering on ESG deals

## File Structure

```text
app/
  globals.css
  layout.tsx
  page.tsx
components/
  bulk/
    BulkGenerator.tsx
  forms/
    TombstoneForm.tsx
  single/
    SingleGenerator.tsx
  tombstone/
    TombstoneCard.tsx
    TombstonePreview.tsx
lib/
  constants/
    tombstone.ts
  types/
    bulk.ts
    tombstone.ts
  utils/
    bulk.ts
    color.ts
    export.ts
    formatting.ts
    validation.ts
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open:

```text
http://localhost:3000
```

## Architecture Notes

- `lib/constants/tombstone.ts` centralizes size specs, spacing ratios, dropdown values, and limits.
- `components/tombstone/TombstoneCard.tsx` is the reusable master template used for both preview and export.
- `lib/utils/formatting.ts` handles language-aware number/date output.
- `lib/utils/validation.ts` handles form and upload validation.
- `lib/utils/export.ts` handles PNG/JPEG/SVG generation from the same template node to keep preview/export aligned.
- `components/bulk/BulkGenerator.tsx` handles spreadsheet/zip upload, bulk validation, and batch zip generation.
- `lib/utils/bulk.ts` handles spreadsheet parsing, logo zip parsing, row validation, and template workbook generation.

## Bulk Template Columns

Use these exact headers in the first sheet:

- `entry_id` (pre-filled 1 to 100)
- `deal_date` (`YYYY-MM`)
- `client_name`
- `sector`
- `role`
- `deal_value`
- `description`
- `esg` (`1` or `0`)
- `logo_key`

Logo matching rule:

- `logo_key` must match a PNG file name in the logos zip (without extension).
- Example: `logo_key=semapa` matches `semapa.png`.

Template behavior:

- Deals sheet is pre-structured for 100 entries (1..100) and starts empty.
- Role column includes Excel dropdown validation (English roles only).
- Instructions sheet explains date format, description max length, and logo naming convention.

## Security & Audit

- See [SECURITY.md](./SECURITY.md) for controls and deployment recommendations.
- See [AUDIT_PREP.md](./AUDIT_PREP.md) for audit checklist and evidence steps.
- See [AUDIT_FINDINGS.md](./AUDIT_FINDINGS.md) for the latest local scan snapshot.

## Extensibility

The MVP is designed so additional templates can be added by introducing:

- New template layout config constants
- Additional renderer components
- A template selector in the form (future v2)
