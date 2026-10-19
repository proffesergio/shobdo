# Shobdo / Bhasha Labs

Bangla-first scripts, speech, and own-voice creation using a native SSM pipeline. This repository is still in Phase 1. A responsive Bangla writing workspace is implemented with optional browser draft storage and UTF-8 text export. Workspace typechecks, both production builds and actual frontend proxy requests now pass; interactive browser acceptance remains pending. AI script generation, speech, voice cloning, authentication, billing, and inference are **not implemented**.

See [deployment and CI/CD setup](docs/DEPLOYMENT.md) for the GitHub origin, Vercel backend adapter, automatic push workflow, required secrets and observed blockers. No deployment has succeeded. The Neon connection works through `psql`, but branch isolation and migration/ownership validation remain pending.

## Layout

| Path | Responsibility |
| --- | --- |
| `apps/web` | Bangla writing workspace, port 3000; build/browser verification pending |
| `apps/admin` | Static admin placeholder, port 3001; no private data or operations |
| `apps/api` | Independently runnable Node HTTP backend scaffold, port 4000 |
| `packages/api-client` | Shared browser client and TypeScript declarations |
| `packages/db` | Drizzle schema and explicit Neon database factory |
| `packages/ssm-core` | Python package boundary for future native inference |
| `memory` | Development plan, observed state, generated continuation prompt |

## Local setup

Use Node 22 or 24 and npm workspaces. Use Python 3.11 for SSM development; the system Python 3.15 is outside this package's supported range.

```powershell
npm install
Copy-Item .env.example .env
npm run typecheck
npm run build
npm run dev:api
# In another terminal:
npm run dev:web
# In another terminal:
npm run dev:admin
```

Dependencies use bounded compatible ranges. Installed dependencies and a generated `package-lock.json` are now present. Observed versions include Next.js 15.5.28, React/React DOM 19.3.1, Drizzle ORM 0.44.7, Drizzle Kit 0.31.11, Neon serverless 1.2.0 and TypeScript 5.9.3. Typechecks and builds pass. A fresh online advisory review is still pending; an offline audit is insufficient. Keep the lockfile in source control and use `npm ci` for subsequent installs. Re-evaluate Next.js support and patches before deployment.

Neither app needs database credentials to render its current static page. Root `.env` is read by the Drizzle CLI; Next.js app-specific server variables belong in `apps/web/.env.local` or `apps/admin/.env.local` when those integrations are implemented. Never expose `DATABASE_URL` through a `NEXT_PUBLIC_` variable.

The API also reads root `.env` via Node's environment-file option. Its entry point uses only the standard library, so `npm run dev:api` works without installing dependencies. `API_HOST` defaults to `127.0.0.1`, `API_PORT` to `4000`, and cross-origin access is denied unless `API_ALLOWED_ORIGINS` explicitly allows the browser origin. Keep the backend on loopback for local development.

Both frontends call `/api/v1/capabilities` through the shared typed client. Next.js rewrites forward `/api/v1/*` to the server-only `API_ORIGIN` (default `http://127.0.0.1:4000`), following the [documented proxy mechanism](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites). Copy each app's `.env.example` to `.env.local` if overriding the defaults. An optional `NEXT_PUBLIC_API_ORIGIN` supports separate-origin browser calls; it must match an explicitly allowed CORS origin. Requests omit cookies and browser credentials. No session, login, CSRF-protected mutation, or private admin API is implemented yet.

### API contract and verification

The contract is `apps/api/openapi.json`, also served at `/api/v1/openapi.json`:

| Endpoint | Current result |
| --- | --- |
| `GET /health/live` | 200: HTTP process is alive |
| `GET /health/ready` | 503: database is unconfigured/unverified and inference is not implemented |
| `GET /api/v1/capabilities?locale=bn` | 200: factual scaffold status; accepts `bn` or `en` |
| `GET /api/v1/admin/status` | 401 for every caller; authentication is not configured |

Errors have `{ "error": { "code", "message", "requestId" } }` and responses include `X-Request-Id`. Unknown/duplicate parameters return 400, disallowed origins 403, unknown routes 404, and mutations 405. The client supports timeouts, cancellation, response validation, and normalized errors. Readiness deliberately remains 503 even when `DATABASE_URL` is set: connectivity and model availability have not been verified.

`npm test` starts real loopback HTTP servers and verifies the shared client/backend round trip, validation, unauthorized access, CORS, cancellation, timeouts, unavailable API behavior, and the served contract. These are infrastructure tests. They do **not** establish a running Next.js frontend or a product generation flow.

Both Next.js production servers and the API have now been run locally. Actual requests through ports 3000 and 3001 verified capabilities, validation, denied admin access, denied origins and stopped-API responses. Open `http://localhost:3000` and `http://localhost:3001` to finish the browser checks: inspect the capabilities request, confirm the connection message updates, then stop the API and reload to confirm each app shows its unavailable state. These visible UI checks remain pending.

### Writing workspace verification

`apps/web/app/studio.tsx` provides the writing interface; it does not call a generation service. Draft storage is opt-in under the versioned browser key `shobdo:draft:v1`. Restored data is validated before use, invalid records are preserved, and storage failures ask the creator to download the text. Disabling storage removes the saved draft while retaining the editor text. Drafts are not uploaded to the API. Text export uses UTF-8 with a BOM for Bangla compatibility. The safety ceiling uses JavaScript string length, not a count of visible Bangla letters or conjuncts. Word count uses whitespace boundaries, not a language tokenizer.

After dependencies are installed, verify these acceptance checks in a real browser before calling this UI ready:

- At 360, 768, and 1440px widths, check Bangla font rendering, wrapping, overflow, and keyboard focus. Use the skip link, labeled editor fields, navigation anchors, and download button with the keyboard.
- Edit Bangla conjuncts, Bangla digits, and mixed Bangla/English text. Download the `.txt` file and compare its content with the editor. Check empty text and the length boundary.
- Enable draft storage, wait for the saved message, reload, and verify restoration. Disable storage and reload to verify deletion. Check denied storage, invalid JSON, unsupported draft versions, and storage quota exhaustion without silently replacing the existing draft.
- Check the unsaved-change warning; verify audio remains unavailable and no fake playback, voice upload, or generation request occurs.
- With the API running and stopped, verify connection and unavailable states and the retry button. Complete the separate admin/proxy/error/origin checks described above.

The latest session passed both production builds, started web/admin/API on ports 3000/3001/4000 and verified HTTP proxy behavior. Browser interaction checks could not run because the browser tool has no available browser surface. See `docs/DEPLOYMENT.md` and `memory/LOCAL_VALIDATION.md` for observed evidence. Production deployment remains gated on Phase 1 acceptance, including the isolated Neon migration; keep native inference behind the independent backend.

For the Python package:

```powershell
uv venv --python 3.11 packages/ssm-core/.venv
uv pip install --python packages/ssm-core/.venv/Scripts/python.exe -e packages/ssm-core
packages/ssm-core/.venv/Scripts/python -c "import shobdo_ssm; print(shobdo_ssm.__version__)"
```

The installed Python 3.11 is managed by uv and is not registered with the Windows `py -3.11` launcher. Use uv as shown above, or your own Python 3.11 executable. The environment was created; editable installation remains pending because offline build dependencies are unavailable and an alternate local build encountered Windows file permission errors. The source import was checked with Python 3.11 using `PYTHONPATH=packages/ssm-core/src`; this is not an installed-package check.

## Database

Set `DATABASE_URL` in root `.env` to an **isolated development Neon database**. Schema generation itself does not require a connection:

```powershell
npm run db:generate
# Review generated SQL before applying:
npm run db:migrate
```

The schema includes users, scripts, voice consents, voices, and generations. Composite foreign keys prevent associating a generation with another owner's script or voice, and prevent associating a voice with another owner's consent. Consent revocation and authorization still require service-level enforcement in later phases. No public database endpoints exist. Initial migration SQL and metadata are generated under `packages/db/migrations` and reviewed, but remain unapplied. Drizzle CLI generation encountered `spawn EPERM`; the installed Drizzle Kit API generated the initial files using Node 24's native TypeScript support. Live migration and constraint checks await verified branch isolation. Do not use schema push against production.

### Neon CLI and ownership checks

Neon CLI 5.0.0 and PostgreSQL `psql` are installed. A read-only `psql` connection using the supplied root `.env.local` succeeded; only `DATABASE_URL` was copied to ignored root `.env`. The CLI's project-list request still fails because it cannot reach the Neon API, so project name and branch isolation remain unverified. Once connectivity is restored, inspect projects and select a Shobdo development project, then create or select an isolated development branch. Do not run migrations on a default branch without establishing that it is the intended isolated target. Keep connection strings out of terminal output and source control.

After generating, reviewing, and applying the migration to that branch, run the rollback-only ownership fixture using explicit branch and project identifiers:

```powershell
neon psql <development-branch> --project-id <project-id> -- -X --set ON_ERROR_STOP=1 --file packages/db/tests/ownership.sql
```

The fixture checks valid same-owner records, nullable voice references, rejection of another owner's consent/script/voice, and rejection of negative durations. It creates randomized fixture IDs inside a transaction and rolls back every row on success. It has been prepared for live verification but **has not been executed**. This checks relational integrity; it does not implement user authorization or consent revocation policy.

## Development handoff

`AGENTS.md` defines the mandatory end-of-session protocol. Update task statuses in `memory/DEVELOPMENT_PLAN.json` and actual findings in `memory/PROJECT_MEMORY_GRAPH.json`, then run:

```powershell
npm run continuation
npm test
npm run continuation:check
```

These commands use only Node's standard library and work before installing dependencies. `implemented` means code exists but acceptance checks remain; only `done` advances the plan. The generated `memory/CONTINUATION_PROMPT.md` and memory graph always point to the earliest unfinished phase.

## Reference decisions

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Next.js security advisory and patched 15.x releases](https://nextjs.org/blog/security-update-2025-12-11)
- [Drizzle with Neon](https://orm.drizzle.team/docs/tutorials/drizzle-with-neon)
- [Drizzle migration workflow](https://orm.drizzle.team/docs/migrations)

Latency and quality goals are unmeasured. No trained weights, GPU runtime, licensed dataset, or compliance certification is included.
