# Security Overview

## Scope

This application is an internal tool to generate deal tombstones from user-provided data and logos.

## Security Controls Implemented

- Strict client-side validation for all required fields.
- Upload validation for logo files (single mode):
  - Allowed types: PNG, JPEG, SVG, WebP
  - Max size enforced in code.
- Upload validation for bulk files:
  - Spreadsheet: `.xlsx` or `.csv`, max 5MB
  - Logos archive: `.zip`, max 50MB
  - Logos consumed as PNG in bulk processing (`logo_key` -> `<key>.png`)
- Bulk row limit enforced: maximum 100 deals per run.
- Sanitized output filenames to prevent unsafe characters.
- Security headers configured at app level:
  - `Content-Security-Policy`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: no-referrer`
  - `Permissions-Policy` with restrictive defaults
- Next image optimization endpoint is disabled (`images.unoptimized = true`) to reduce surface area.

## Data Handling Model

- Processing is performed in-browser for:
  - Single tombstone generation
  - Bulk spreadsheet parsing and ZIP output generation
- Generated files are downloaded directly to the user's machine.
- No application-level database is used by this project.

## Known Limitations / Risk Notes

- Browser memory usage increases with large logo files and large bulk batches.
- CSV parsing is supported; complex malformed CSV may produce row-level errors.
- Dependency risk should be continuously monitored with `npm run audit:prod`.

## Recommended Enterprise Deployment Controls

- Restrict access behind corporate SSO and MFA.
- Deploy on private network/internal ingress only.
- Enable WAF/reverse proxy protections at platform edge.
- Integrate runtime logs and access logs into SOC SIEM.
- Pin dependencies and perform scheduled vulnerability scans.
