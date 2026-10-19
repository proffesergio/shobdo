# Shobdo deployment and automatic delivery

## Current state (supersedes earlier failed attempts)

The user reports <https://shobdo-web.vercel.app> is live and accepts that URL.
Agent web/shell fetches could not independently verify it. Preserve the existing
site; shorter-alias work is deferred. Backend/inference readiness and remote
product acceptance remain pending. See [production roadmap](PRODUCTION_ROADMAP.md)
for the full delivery vision and acceptance gates.

The user reports the GitHub/Vercel repository connection was completed manually.
This supersedes the earlier CLI attempt, which failed before account lookup with
`fetch failed`. The provider connection has not been independently verified from
this shell. Git authentication/push, root `.vercel` project metadata, and the
provider connection are separate states. Confirm the Vercel GitHub App can access
this repository and verify project roots, remote CI execution and secret presence
without exposing values.
The checked-in `git.deploymentEnabled=false` settings still disable native Git
auto-deploy: repository connection alone will not enable it. Verify the chosen
GitHub Actions release route, project configuration and secret presence before
claiming automatic deployment works. Do not enable a parallel ungated production
deploy path. [Vercel Git command](https://vercel.com/docs/cli/git)

The sections below retain historical attempts and setup guidance; they do not
negate the user's later report that the frontend is now hosted.

The local repository has `origin` set to
`https://github.com/proffesergio/shobdo.git`. The user manually committed and
pushed; local `main` and cached `origin/main` both point to
`8af414f00ae106bd6a456b39fa5884c74d6d1b0b`, including the lockfile and workflow.
Remote workflow execution has not been verified. GitHub CLI still reports an
invalid saved token; Git authentication can work independently of that token.

## First-look UI preview

Requested public alias: `shobdo.vercel.app`. A subsequent agent-shell deploy
attempt failed before upload with `Not able to load user ... fetch failed`.
Alias availability and ownership have not been verified, and it has not been
assigned. Once the deployment command below succeeds, copy its deployment URL
and run this from the working terminal:

```powershell
$deploymentUrl = Read-Host "Paste the successful Vercel deployment URL"
vercel alias set $deploymentUrl shobdo.vercel.app --scope proffesergios-projects
```

Vercel must accept the alias assignment before reporting that address as live.
If the name belongs to a different account, use an available name or a domain
you control. [Alias command reference](https://vercel.com/docs/cli/alias)

The user explicitly authorized a UI preview before completing Phase 1.
`shobdo-web` now exists with ID `prj_l1pvACkjKpYNZF7YL3thWdk4TLId`, and root
`.vercel/project.json` links to it. The project-settings API failed, so
`vercel.preview.json` builds a static export from the repository root and serves
`apps/web/out`. It does not depend on changing the remote monorepo root setting.

From the working user terminal, run:

```powershell
Set-Location C:\Users\bhnbi\Music\shobdo
vercel deploy --local-config vercel.preview.json --build-env UI_PREVIEW_ONLY=true --yes --scope proffesergios-projects
```

This creates a preview deployment. `UI_PREVIEW_ONLY=true` enables Next.js static
export and omits backend rewrites. Editing, opt-in browser drafts and text export
are the implemented UI scope; API, generation, audio and cloning remain
unavailable. No database or AWS credentials should be configured for the preview.
The upload exclusions omit environment files, Python environments and Neon
context. The browser scanner now also includes exported HTML/assets in `apps/web/out`.
Production CI/CD acceptance gates remain in place.

The agent's deployment dry run failed at project retrieval with
`ECONNREFUSED 127.0.0.1:9`; no upload or preview URL was created. The local static
export build encountered Windows `spawn EPERM`; a worker-thread attempt failed
with `DataCloneError` and was removed. The final configuration uses the default
Next.js workers and relies on Vercel's remote Linux build. Config checks verified
preview export/no rewrites and unchanged normal API proxy behavior; web typecheck
passed. The remote preview build is unverified until the deployment succeeds.

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
| `shobdo-web` | `apps/web` for connected app; repository root for static preview | Remote settings unverified | Live and GitHub connected by user report; agent verification and CI status pending |
| `shobdo-admin` | `apps/admin` | Next.js | Not created or linked |

The API project ID is `prj_bIQu96ZHXFRiXBE4YmeoK2jV5z4s`; the verified account
scope is `proffesergios-projects`, organization ID
`team_m6SDnGnsVUsbqrtGRdQvqsWd`. The local `.vercel/project.json` links to that
web project after the first-look session. The API monorepo root setting still
needs correction before backend deployment.

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
