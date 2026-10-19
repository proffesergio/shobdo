# Local validation — 2026-10-19

## Latest: credentials, local integration and CI/CD preparation

Dependencies and `package-lock.json` supplied since the earlier sessions are
now present. Full workspace typechecks and both production builds passed.
`npm test` passed 15 tests, including a real HTTP check of the new Vercel API
adapter. Browser-secret scanning passed for 33 built assets. Offline npm audit
reported zero findings; a fresh online advisory check remains pending.

Read-only PostgreSQL access using supplied `.env.local` credentials succeeded.
Only `DATABASE_URL` was copied into ignored root `.env`; no credential value
was printed. PostgreSQL returned project `polished-bread-19441837` and branch
`br-still-tooth-aoafetmt`. Their Shobdo name and isolated-development status
are not verified. Neon CLI project listing still failed. Drizzle CLI generation
failed `spawn EPERM`; the installed Drizzle Kit API generated and enabled review
of the initial migration, snapshot and journal. No migration or ownership test
was applied to the live database; schema version remains 0.

API and production frontend servers ran on 4000, 3000 and 3001. Both actual
Next.js proxies returned capabilities 200, invalid locale 400, admin 401 and
disallowed origin 403 with matching request IDs for the first three. Stopping
the API produced HTTP 500 through both proxies; the API was restarted. The
browser tool reported no browser inventory and could not open its in-app
browser. Visual, keyboard, draft-storage, download and visible unavailable-state
acceptance checks remain pending.

Initialized Git on `main` and added the requested GitHub origin. No commit,
fetch or push occurred; remote history remains unverified. GitHub CLI reports
an invalid saved token. Added a push-to-main workflow for separate API/web/admin
deployment after validation and the Phase 1 release gate. Its remote execution
and YAML-tool validation remain unverified (local PyYAML is unavailable).

Vercel login and project listing succeeded. `shobdo-api` was created and linked
locally; native GitHub linking was rejected for a missing GitHub Login Connection.
A subsequent API project root/settings PATCH failed `fetch failed`; another
lookup failed at proxy `127.0.0.1:9`. No frontend Vercel projects, deployment,
public URLs or remote secrets were configured. Existing proxy/security settings
were left unchanged. See `docs/DEPLOYMENT.md` for exact setup requirements.

The older tables below describe earlier attempts, not current dependency state.

Current phase: **1 — Scaffolding and core infrastructure**. Phase 2 has not begun. The new writing UI is a requested frontend foundation; it does not complete the Phase 3 studio or any inference task.

| Check | Observed result |
| --- | --- |
| `neon projects list --output json` | Failed: could not reach Neon API. CLI authentication, projects, and development branch are unverified. |
| `npm install --offline=false --fetch-retries=0 --fetch-timeout=15000` | Failed: `ECONNREFUSED 127.0.0.1:9` while resolving `@types/node`. No lockfile generated. |
| `npm run typecheck` | Failed: React, Next, Drizzle, and associated types are missing. |
| `npm run build` | Failed: `next` executable missing for both apps. |
| `npm run dev:web` | Failed: `next` executable missing. No frontend listening on port 3000 was established. |
| `npm test` | Passed: 14 tests, comprising 9 API/client HTTP checks and 5 continuation checks. These do not test the UI. |
| `npm run continuation` / `npm run continuation:check` | Passed: plan selects Phase 1 and both continuation outputs are synchronized. |
| `npm run dev:api` | Started on `http://127.0.0.1:4000`; root `.env` absent. |
| Live API smoke requests | Liveness 200; readiness 503 with database `not_configured` and inference `not_implemented`; capabilities 200 `scaffold`; invalid locale 400; admin 401. |

No database connection, migration, ownership fixture, full typecheck, frontend build, browser rendering, or Vercel deployment has passed in this session. No credentials or remote database changes were made. No Git repository exists, so there is no commit.

## Resume order

### Follow-up environment inspection

The follow-up session confirmed `NPM_CONFIG_OFFLINE=true` and HTTP, HTTPS,
ALL_PROXY, and Git proxy settings pointing to `http://127.0.0.1:9`. No proxy
or security setting was changed. Because these match the previously failed
conditions, npm installation and Neon listing were not retried. Restore
permitted access through the execution environment controls before retrying;
the user's working terminal does not establish access in this agent shell.

`node_modules`, `package-lock.json`, and root `.env` are absent. `npm test`
passed all 14 tests again. No new build, resolved-version/advisory review,
browser/proxy integration, browser bundle secret check, Neon migration, or
ownership verification was completed. Live schema version remains 0 and
Phase 1 remains open. No Phase 2 work or Vercel deployment was started.

1. Restore permitted npm/Neon network access in the execution environment. The user's terminal reportedly has a working Neon CLI; this agent shell still cannot reach Neon. Do not change proxy/security restrictions or repeatedly retry unchanged conditions.
2. Install dependencies, review actual resolved versions/advisories, generate a lockfile, and pass workspace typechecks/builds.
3. List Neon projects without printing credentials. Identify the Shobdo project and create/select an isolated development branch; do not guess an unrelated project. Store its URL only in ignored root `.env` as `DATABASE_URL`.
4. Generate/review Drizzle migration SQL, migrate the isolated branch, and run `packages/db/tests/ownership.sql` with rollback and error-stop enabled. Only then record a live schema version and complete database-dependent API work.
5. Start API, web, and admin on ports 4000, 3000, and 3001. Complete README's UI and frontend/API acceptance checks. Confirm no secrets enter browser bundles.
6. Update observed plan statuses and continuity outputs. Keep Phase 1 open until all its acceptance checks pass. Begin native SSM feasibility next, preserving separate backend and inference boundaries.

The requested Vercel free-tier deployment remains pending local verification. Hosting configuration, account eligibility, backend routing, and secret configuration still require validation. No paid services have been provisioned.
