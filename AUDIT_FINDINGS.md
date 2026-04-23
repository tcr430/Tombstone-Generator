# Audit Findings Snapshot

Date: 2026-04-23

## Commands Run

```bash
npm run typecheck
npm run audit:prod
```

## Results

- `npm run typecheck`: PASS
- `npm run audit:prod`: vulnerabilities reported by npm advisory feed

Current reported items:

- `next` package: high severity advisories reported at package-family level.
- `exceljs -> uuid` chain: moderate advisory reported by npm.

## Mitigations Applied in This Repo

- Upgraded `next` from `14.2.5` to `14.2.35`.
- Removed `xlsx` dependency (which had an unresolved high advisory in prior version set).
- Disabled Next image optimization path by setting `images.unoptimized = true`.
- Restricted image sources and configured strict security headers.
- Added upload constraints and bulk-row bounds.

## Reviewer Guidance

- Validate advisories against actual feature usage and threat surface.
- Review compensating controls in `SECURITY.md`.
- Track unresolved advisories in your internal risk register with owner and due date.
