# Audit Preparation Checklist

This file is intended to support internal review and audit handoff.

## 1) Build Integrity

Run:

```bash
npm install
npm run typecheck
npm run build
```

Expected:

- TypeScript check passes with no errors.
- Production build completes successfully in your controlled environment.

## 2) Dependency Security

Run:

```bash
npm run audit:prod
```

Review:

- Critical/high findings must be triaged and tracked.
- If a package has no upstream fix, document compensating controls and usage scope.

## 3) Functional Controls

Verify manually:

- Single mode:
  - Required field enforcement
  - File upload constraints
  - Filename pattern output
- Bulk mode:
  - Template download is structured for 100 rows
  - Role dropdown exists in template (English)
  - Row-level validation reports errors
  - PNG-only logo mapping in ZIP
  - ZIP generation works for valid rows

## 4) Security Controls

Confirm response headers in browser dev tools/network:

- `Content-Security-Policy`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`

## 5) Data Governance Confirmation

Confirm with reviewers:

- No persistence layer in this repo
- Processing is browser-side for generation/export
- Export artifacts remain on the user's endpoint unless uploaded elsewhere by user policy

## 6) Artifacts to Include in Submission

- Source repository snapshot/tag
- `README.md`
- `SECURITY.md`
- This `AUDIT_PREP.md`
- Output of:
  - `npm run typecheck`
  - `npm run audit:prod`
  - `npm run build`
