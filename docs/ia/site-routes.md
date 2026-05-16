# Site routes (App Router inventory)

Parent/child relationships for marketing and role dashboards. All user-facing pages below are linked from the primary header in `app/components/SiteChrome.tsx`.

| Route | Purpose | Parent | In primary nav |
| --- | --- | --- | --- |
| `/` | Marketing / demo narrative | — | Overview |
| `/employer` | Employer workspace + placeholder txs | `/` (breadcrumb) | Employer |
| `/employee` | Employee receipt demo | `/` | Employee |
| `/audit` | Auditor disclosure exports | `/` | Audit |

## API routes (not in nav)

| Route | Purpose |
| --- | --- |
| `GET /api/veil-ledger` | JSON snapshot of public Veil ledger via indexer |
| `POST /api/veil/employer/register-employee` | Placeholder registry bump (script bridge) |
| `POST /api/veil/employer/run-batch` | Placeholder batch anchor (script bridge) |

## Orphans and dead ends

- No orphan marketing or role pages: the four shells above cover the hackathon story.
- External links (`Midnight`, GitHub README anchor) intentionally leave the app.

## Breadcrumbs

- Role pages use a lightweight text breadcrumb (`Overview / Role`) next to the `h1` instead of a separate component, because each dashboard is only one hop deep from home. Deeper nested IA should introduce a shared breadcrumb component if new intermediate routes appear.
