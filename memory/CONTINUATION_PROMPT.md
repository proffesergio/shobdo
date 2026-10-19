# Shobdo continuation prompt

Read AGENTS.md, PROJECT_SYSTEM_PROMPT.md, memory/PROJECT_MEMORY_GRAPH.json, and memory/DEVELOPMENT_PLAN.json before editing.

Continue Phase 1: Scaffolding and core infrastructure.
Preserve native SSM architecture. Report scaffolding, mocks, and real inference accurately. Do not advance phases until acceptance checks pass.

Recorded active feature: Phase 1: verify isolated Neon branch and migration/ownership, finish browser and package/advisory acceptance, configure GitHub/Vercel CI/CD
Inference status: not_implemented

Outstanding tasks and acceptance checks:
- [implemented] monorepo: Create independent Next.js web/admin, Node API, typed client, Drizzle database, and native Python package boundaries
  Acceptance: Install dependencies, commit a generated lockfile, and pass npm run typecheck and npm run build
- [blocked] database: Define owner-scoped creator, script, consent, voice, and generation schema
  Acceptance: Generate and review the initial Drizzle migration; apply it to an isolated Neon development database and verify ownership constraints
- [blocked] api-communication: Provide independent API startup/configuration/tests, OpenAPI contract, typed client, and frontend connection status
  Acceptance: Pass API integration checks and verify actual requests from both running Next.js applications, unavailable states, validation errors, denied admin access, and configured CORS behavior
- [blocked] local-setup: Document local configuration, package setup, and validation commands
  Acceptance: Smoke-test both apps after installation and verify the Python 3.11 package import

Recorded blockers:
- Neon project/branch isolation remains unverified. PostgreSQL connectivity now works with supplied credentials, but Neon CLI project listing fails. Do not migrate until the target is verified as isolated Shobdo development; live schema version remains 0.
- Interactive frontend acceptance is pending: browser inventory empty and in-app browser unavailable. HTTP proxy checks passed; visual layout, keyboard, storage, UTF-8 download and visible unavailable-state behavior are not verified.
- Fresh online advisory review, reproducible npm ci and lockfile commit remain pending. Offline audit zero findings is not current security evidence. Drizzle CLI spawn EPERM; initial migration was generated via its installed API instead.
- GitHub CLI saved token is invalid. No remote history fetch, commit, push, repository secrets or Actions execution. Origin is configured to the requested repository.
- Vercel shobdo-api exists but monorepo root/settings update failed. Native GitHub linking requires a Login Connection; Actions token deployment can operate independently. Web/admin projects, routing, secrets, plan eligibility and remote smoke tests remain pending. Network/proxy failures are inconsistent; do not change restrictions or repeat unchanged failed requests.
- Python 3.11 source import previously passed; editable package installation remains unverified due prior build dependency/temp-directory failures.

Recorded validation:
- 2026-10-19 credentials/CI session: full workspace typechecks, both builds and 15 HTTP/continuation tests passed. Actual Next proxies on 3000/3001 reached API 4000 and returned 200/400/401/403; stopped API returned 500. Credential scan passed 33 assets. Read-only live psql succeeded. Migration generated/reviewed but not applied; browser, online audit, installed Python package, workflow and deployment verification remain pending.
- 2026-10-19 follow-up: npm test passed 14/14. Environment inspection confirmed unchanged blocking proxy/offline settings; no repeated npm/Neon network attempts, no restriction changes, and no new frontend/database/deployment verification.
- 2026-10-19 current session: npm test passed 14 tests (9 real loopback API/client integration checks, 5 continuation checks). These do not validate the frontend UI.
- 2026-10-19 current session: npm run dev:api started on 127.0.0.1:4000. Actual HTTP results: live 200, ready 503 (database not_configured/inference not_implemented), capabilities 200 scaffold, invalid locale 400, admin 401.
- 2026-10-19 current session: npm install failed ECONNREFUSED 127.0.0.1:9; Neon project list failed unreachable API; full typecheck failed missing dependencies; build and dev:web failed missing next. No frontend browser/proxy verification, Neon connection/migration/ownership check, or Vercel deployment.
- Earlier session: API workspace tests passed; shared api-client declaration check passed with global tsc. Python 3.11.15 venv source import passed with PYTHONPATH, but editable package install remains unverified.
- Rollback-only packages/db/tests/ownership.sql is prepared, never executed. Full evidence and next validation checklist: memory/LOCAL_VALIDATION.md.

Start with the earliest unfinished task that can be progressed. Resolve missing verification before claiming completion. Keep credentials private; use an isolated development database for migrations.

Before ending: update the plan and memory with observed results, run npm run continuation, npm test, and npm run continuation:check, then link this prompt in the final response.
