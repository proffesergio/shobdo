# Shobdo deployment and automatic delivery

The local repository has `origin` set to
`https://github.com/proffesergio/shobdo.git`. No commit or push has been made.
Remote history has not been inspected. GitHub CLI reports an invalid saved
token. The workflow exists locally; it is not yet active on GitHub.

## Observed validation on 2026-10-19

- Workspace typechecks and both Next.js production builds passed using the
  existing installed dependencies and lockfile.
- Fifteen tests passed, including the Vercel backend adapter over real HTTP.
- Both running frontend proxies reached the API: capabilities 200, invalid
  locale 400, admin 401, disallowed origin 403; stopped API produced HTTP 500
  through both proxies. Browser rendering and interactive UI acceptance remain
  unverified because no browser surface is available to this agent.
- The browser asset scanner inspected 33 assets and found no supplied credential
  values or credential-bearing PostgreSQL URLs. This does not certify security.
- A read-only `psql` connection using `DATABASE_URL` from root `.env.local`
  succeeded. Only that variable was copied to ignored root `.env`; AWS
  credentials were not copied. Neon project/branch identity was returned by
  PostgreSQL, but project name and branch isolation remain unverified because
  Neon CLI could not reach its API. No migration or ownership fixture was run.
- Drizzle CLI generation failed with `spawn EPERM`. The initial SQL, snapshot,
  and journal were instead generated with the installed Drizzle Kit API and
  Node 24's native TypeScript support. Thirteen SQL statements were reviewed:
  five tables, one enum, composite owner foreign keys, unique keys and a duration
  check; no destructive statements. The migration remains unapplied.
- Offline npm audit returned no findings, but this is not a current advisory
  check. The workflow requires an online audit.

## Vercel projects

| Application | Root Directory | Framework | Status |
| --- | --- | --- | --- |
| `shobdo-api` | `apps/api` | Other | Created; root/settings update failed, no deployment |
| `shobdo-web` | `apps/web` | Next.js | Not created or linked |
| `shobdo-admin` | `apps/admin` | Next.js | Not created or linked |

The API project ID is `prj_bIQu96ZHXFRiXBE4YmeoK2jV5z4s`; the verified account
scope is `proffesergios-projects`, organization ID
`team_m6SDnGnsVUsbqrtGRdQvqsWd`. The local `.vercel/project.json` links to that
API project. Its monorepo root setting must be corrected before deploying.

Run Vercel CLI from the repository root, selecting the intended project for
each operation. Set Root Directory and enable source files outside that root
in each Vercel project's Build and Deployment settings. The checked-in app
`vercel.json` files set install/build commands. The API adapter exports the
existing request handler; Vercel owns the listener. Python inference remains
outside Vercel and behind the independent API boundary.

Backend Vercel environment variables:

- `DATABASE_URL`: set privately in the API project only, after the intended
  branch is verified. It does not enable database-backed product features.
- `API_ALLOWED_ORIGINS`: comma-separated exact deployed frontend origins.
  Include localhost origins only in local development configuration.

Web/admin environment variables:

- `API_ORIGIN`: actual deployed API HTTPS origin, with no path or trailing slash.
  Set it before building. The localhost default is unsuitable for deployment.
- Leave `NEXT_PUBLIC_API_ORIGIN` unset for same-origin proxying.
- Do not add database, AWS, or service credentials to either frontend project.

Vercel rejected native GitHub linking because the account needs a GitHub Login
Connection. GitHub Actions with a Vercel token can deploy without native Git
linking; the workflow uses that route. Network requests remain inconsistent:
some Vercel commands succeeded, while team lookup failed at `127.0.0.1:9` and
the root-settings PATCH failed with `fetch failed`. Proxy/security settings
were not changed. No successful deploy or public URL is recorded.

## GitHub Actions setup

`.github/workflows/ci-deploy.yml` validates pull requests and pushes to `main`.
After validation, pushes to `main` deploy API, web, and admin as three separate
projects. Production deployment first requires `npm run release:check`: every
Phase 1 task must have observed acceptance and be marked `done`. Keep the gate
until outstanding database, browser, package and advisory checks pass.

Add these GitHub repository or `production` environment secrets:

| Secret | Value |
| --- | --- |
| `VERCEL_TOKEN` | Authorized Vercel deployment token |
| `VERCEL_ORG_ID` | Verified Vercel organization ID |
| `VERCEL_API_PROJECT_ID` | API project ID |
| `VERCEL_WEB_PROJECT_ID` | Web project ID |
| `VERCEL_ADMIN_PROJECT_ID` | Admin project ID |

From your authenticated terminal, after completing the Vercel project setup:

```powershell
gh auth login --hostname github.com --web
gh auth status
gh secret set VERCEL_TOKEN --repo proffesergio/shobdo
gh secret set VERCEL_ORG_ID --repo proffesergio/shobdo
gh secret set VERCEL_API_PROJECT_ID --repo proffesergio/shobdo
gh secret set VERCEL_WEB_PROJECT_ID --repo proffesergio/shobdo
gh secret set VERCEL_ADMIN_PROJECT_ID --repo proffesergio/shobdo
```

Each secret command prompts for its value. Do not paste tokens into source or
chat. The workflow uses pinned action commits and Vercel CLI 54.18.1. It runs
`npm ci`, an online security audit, tests, typechecks, builds, browser-secret
scan and continuation verification before deployment. Secrets are unavailable
to pull-request validation. Native Vercel Git deployment is disabled by each
app's configuration to avoid a second path bypassing the workflow's checks.

Inspect remote history with `git fetch origin` before preparing the first
commit/push; preserve any existing remote work. Once the repository is
published and configuration/acceptance are complete, subsequent `main` pushes
trigger the workflow automatically. No deployment workflow execution has been
verified yet. Plan eligibility must be checked for the intended use; Vercel
Hobby is limited to personal, non-commercial projects. No paid upgrade was
requested.

References: [Vercel with GitHub Actions](https://vercel.com/kb/guide/how-can-i-use-github-actions-with-vercel),
[Vercel monorepos](https://vercel.com/docs/monorepos),
[Node functions](https://vercel.com/docs/functions/runtimes/node-js),
[Hobby eligibility](https://vercel.com/docs/plans/hobby).
