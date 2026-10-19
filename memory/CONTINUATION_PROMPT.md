# Shobdo continuation prompt

Read AGENTS.md, PROJECT_SYSTEM_PROMPT.md, memory/PROJECT_MEMORY_GRAPH.json, memory/DEVELOPMENT_PLAN.json, and docs/PRODUCTION_ROADMAP.md before editing.

Continue Phase 1: Scaffolding and core infrastructure.
Preserve native SSM architecture. Report scaffolding, mocks, and real inference accurately. Do not advance phases until acceptance checks pass.

Recorded active feature: Phase 1: verify isolated Neon migration/ownership, finish browser/setup acceptance and establish verified GitHub/Vercel delivery; preserve accepted hosted UI preview
Inference status: not_implemented
Deployment state: User reports https://shobdo-web.vercel.app live and accepts that URL, and reports GitHub/Vercel repository connection completed manually. Remote content/revision, interactive behavior, CI execution, project settings, backend/inference and production integration remain unverified.

Production vision: Deliver a Bangla-first production platform for Bangladeshi Facebook and YouTube creators: authenticated script creation with a native SSM, controllable native text-to-speech, consent-based own-voice cloning, and protected multi-format downloads, supported by an independent API, owner-scoped persistence, administration and billing. A live writing UI is an early preview, not completion of this platform.

Architecture boundaries:
- Keep apps/web and apps/admin independently buildable. Use the typed HTTP client and versioned /api/v1 contract; never import database/model code or backend secrets into a frontend.
- Keep authorization, persistence, quotas, billing, jobs and inference orchestration in apps/api. Keep native Python/PyTorch/CUDA inference in packages/ssm-core behind authenticated service boundaries.
- Use Neon/PostgreSQL and reviewed Drizzle migrations. Isolate development/staging/production data; keep credentials server-only and out of logs, Git and browser bundles.
- Develop the core script/speech/voice pipeline natively with SSMs. Validate architecture, versions, hardware, datasets and licenses before selection; hosted generative APIs are not a substitute.
- Distinguish source implementation, local validation, user-reported hosting and independently verified product behavior. Keep missing features disabled and labeled; retain measured evidence.

Outstanding tasks and acceptance checks:
- [blocked] database: Define owner-scoped creator, script, consent, voice, and generation schema
  Acceptance: Generate and review the initial Drizzle migration; apply it to an isolated Neon development database and verify ownership constraints
- [blocked] api-communication: Provide independent API startup/configuration/tests, OpenAPI contract, typed client, and frontend connection status
  Acceptance: Pass API integration checks and verify actual requests from both running Next.js applications, unavailable states, validation errors, denied admin access, and configured CORS behavior
- [blocked] local-setup: Document local configuration, package setup, and validation commands
  Acceptance: Smoke-test both apps after installation and verify the Python 3.11 package import
- [blocked] delivery-connection: Verify repository linkage, preview hosting and the chosen gated CI/CD route for separate frontend/backend projects
  Acceptance: Confirm Vercel GitHub link or an explicitly documented Actions-only delivery route, verify a remote CI validation run and project/secret configuration without exposing values, and confirm preview versus production routing and release-gate behavior

Concrete next actions:
1. Verify the supplied Neon project is Shobdo and select/create an isolated development branch; never infer isolation from connectivity.
2. Apply the reviewed Drizzle migration only to that branch, run packages/db/tests/ownership.sql with error-stop and rollback, and record a live schema version only after success.
3. Complete clean npm ci, current advisory review, installed Python 3.11 package checks and README browser/UI/API/origin acceptance with both frontends and the real API.
4. Preserve the user-accepted UI at https://shobdo-web.vercel.app; verify its revision/content/assets when access permits. Do not pursue the shorter alias or redeploy without a reason.
5. Verify the manually completed GitHub/Vercel repository connection, project roots/routing, secret presence and remote CI validation without exposing values. Native Git auto-deploy remains disabled; verify one gated production delivery route.
6. Keep Phase 1 open until all task acceptance checks pass. Then begin native SSM feasibility/training with validated runtime/GPU, architecture, data licenses and checkpoint/evaluation provenance.

Remaining delivery roadmap (planned; start each phase only after the preceding acceptance gate):
Phase 2: SSM engine and native inference pipeline
- [pending] model-feasibility: Evaluate native SSM architecture, licensed datasets, tokenizer, training plan, and PyTorch/CUDA environment
  Acceptance: Document reproducible runtime and architecture selection, data permissions, GPU requirements, and checkpoint provenance
- [pending] bangla-normalization: Implement and validate Bangla normalization and G2P, numbers, dates, IDs, and code mixing
  Acceptance: Pass representative Bangla fixtures with explicit ambiguity rules
- [pending] native-model-training: Implement reproducible native SSM script and speech model training/adaptation, licensed checkpoint manifests and Bangla quality evaluation
  Acceptance: Produce real checkpoint(s) with data/license/training provenance, repeatable inference, representative Bangla/code-mixed evaluation, human audio review and documented quality/resource limits; specify any native vocoder/speaker-conditioning component and its license
- [pending] streaming: Build inference service and audio streaming contract around a real native model
  Acceptance: Verify cancellation, backpressure, error handling, and real audio; benchmark first-chunk latency with hardware and checkpoint recorded
Phase 3: Creator studio and headless administration
- [pending] auth-persistence: Implement authentication, sessions and owner-scoped script/consent/voice/generation APIs against migrated PostgreSQL
  Acceptance: Verify login/session expiry, server-side ownership/admin checks, input errors, documented CORS/CSRF behavior and cross-user denial with real database integration tests
- [pending] generation-jobs-media: Implement durable inference jobs, cancellation/retry and private recording/generated-media storage with protected exports
  Acceptance: Verify job ownership/idempotency, retries and cancellation, quota reservation/release, storage access and signed-download expiry; produce real UTF-8 text and supported audio formats with correct metadata and deletion/retention enforcement
- [pending] studio: Implement authentication, scripts, synthesis, prosody controls, waveform playback, and downloads
  Acceptance: Verify authenticated owner isolation and an end-to-end real generation/download flow
- [pending] voice-cloning: Implement own-voice enrollment, consent, revocation/deletion, and voice conversion
  Acceptance: Validate sample handling and prevent use after consent revocation
- [pending] admin-billing: Add role-gated admin, measured telemetry, quotas, and bKash/Stripe integration
  Acceptance: Verify permissions, webhook signatures, idempotency, and quota enforcement in sandbox environments
Phase 4: Growth and enterprise deployment
- [pending] growth: Add factual SEO pages, structured metadata, and llms.txt
  Acceptance: Validate indexable content and metadata against actual product capabilities
- [pending] agents: Implement managed voice-agent interfaces
  Acceptance: Verify consent, authentication, and real-time integration in a controlled environment
- [pending] deployment: Add Playwright end-to-end coverage and deployment hardening
  Acceptance: Pass release checks, document monitoring and recovery, and obtain explicit authorization for external deployment
- [pending] operations-release: Complete operational readiness, privacy/security controls, measured capacity and staged production release
  Acceptance: Pass staging real-user journeys, rate-limit/load/failure tests, backup restore and rollback drills; verify redacted logs/alerts, incident runbooks, retention/deletion, account/plan/secret configuration and explicitly authorized production rollout; publish only measured capability claims

Production readiness requires evidence for every gate:
- Reproducible clean installs/builds, current advisory review, passing meaningful unit/integration/browser tests, reviewed migrations and owner-isolation/authorization failures tested against real services.
- An authenticated creator completes a real native script-to-audio generation and protected download; Bangla digits, dates, identifiers, conjuncts and code mixing pass representative fixtures and human/metric evaluation.
- Own-voice enrollment requires explicit consent; recordings, embeddings and media are private. Revocation, deletion and retention are enforced and verified, including signed-download expiry.
- Native checkpoints have reproducible provenance, licensed datasets, compatible runtime/GPU manifests and quality evaluations. Streaming, cancellation, backpressure, latency and capacity measurements record workload/hardware/checkpoint and measurement boundaries.
- Validated speed, volume, emotion and pronunciation controls reach real inference. No simulated audio or untrained models are presented as usable synthesis.
- Server-side quotas, billing entitlements and admin roles are enforced. Provider sandbox webhook signatures, replay handling, idempotency and quota races pass before live billing.
- Frontend, API and inference routes/secrets are independently configured and smoke-tested in staging. CI/CD has one verified deployment path, release gates and tested rollback; Git connection alone is not deployment evidence.
- Operations include readiness reflecting actual dependencies, structured redacted logs, metrics/alerts, rate limits, backup restore drill, incident/runbook ownership and an agreed load/cost/capacity plan.
- Accessibility, responsive Bangla UI, privacy/consent terms and documented limitations are reviewed. No SOC2/HIPAA, near-perfect accuracy, A10G support or latency claim without measured/audited evidence.

Recorded blockers:
- Neon project/branch isolation remains unverified. PostgreSQL connectivity now works with supplied credentials, but Neon CLI project listing fails. Do not migrate until the target is verified as isolated Shobdo development; live schema version remains 0.
- Interactive frontend acceptance is pending: browser inventory empty and in-app browser unavailable. HTTP proxy checks passed; visual layout, keyboard, storage, UTF-8 download and visible unavailable-state behavior are not verified.
- Fresh online advisory review, reproducible npm ci remain pending; lockfile commit now verified. Offline audit zero findings is not current security evidence. Drizzle CLI spawn EPERM; initial migration was generated via its installed API instead.
- Git was authenticated and pushed manually by user; local main/cached origin/main match at 8af414f. GitHub CLI separately still reports invalid saved token; repository secret and workflow execution verification remain pending.
- User reports frontend live at shobdo-web.vercel.app and GitHub/Vercel repository connection completed manually; agent remote verification is unavailable. Backend/admin/routing/secrets, remote CI and production acceptance remain unverified. Preserve accepted URL and existing restrictions; do not retry unchanged failures or pursue the shorter alias.
- Python 3.11 source import previously passed; editable package installation remains unverified due prior build dependency/temp-directory failures.

Recorded validation:
- 2026-10-19 current-stage update: user reports shobdo-web.vercel.app live and accepts it, and reports GitHub/Vercel repository connection completed manually. Agent web/shell could not independently verify remote setup. README refreshed as project showcase with a README-only push recipe; plan records connection as user-reported while remote CI/configuration remain pending. Phase 1 remains open.
- 2026-10-19 named-preview attempt: Vercel deploy failed before upload on user lookup (fetch failed). Requested alias shobdo.vercel.app is unassigned and availability unverified. Existing Phase 1 statuses unchanged; no deployment claimed.
- 2026-10-19 first-look request: observed commit 8af414f and matching cached origin/main, lockfile tracked. Created/linked shobdo-web. Static preview configured without API rewrites; mode checks and web typecheck passed. Local export encountered spawn EPERM and a discarded worker-thread DataCloneError. Vercel settings and dry deployment failed; no deployed preview or remote build verification.
- 2026-10-19 credentials/CI session: full workspace typechecks, both builds and 15 HTTP/continuation tests passed. Actual Next proxies on 3000/3001 reached API 4000 and returned 200/400/401/403; stopped API returned 500. Credential scan passed 33 assets. Read-only live psql succeeded. Migration generated/reviewed but not applied; browser, online audit, installed Python package, workflow and deployment verification remain pending.
- 2026-10-19 follow-up: npm test passed 14/14. Environment inspection confirmed unchanged blocking proxy/offline settings; no repeated npm/Neon network attempts, no restriction changes, and no new frontend/database/deployment verification.
- 2026-10-19 current session: npm test passed 14 tests (9 real loopback API/client integration checks, 5 continuation checks). These do not validate the frontend UI.
- 2026-10-19 current session: npm run dev:api started on 127.0.0.1:4000. Actual HTTP results: live 200, ready 503 (database not_configured/inference not_implemented), capabilities 200 scaffold, invalid locale 400, admin 401.
- 2026-10-19 current session: npm install failed ECONNREFUSED 127.0.0.1:9; Neon project list failed unreachable API; full typecheck failed missing dependencies; build and dev:web failed missing next. No frontend browser/proxy verification, Neon connection/migration/ownership check, or Vercel deployment.
- Earlier session: API workspace tests passed; shared api-client declaration check passed with global tsc. Python 3.11.15 venv source import passed with PYTHONPATH, but editable package install remains unverified.
- Rollback-only packages/db/tests/ownership.sql is prepared, never executed. Full evidence and next validation checklist: memory/LOCAL_VALIDATION.md.

Start with the earliest unfinished task that can be progressed. Resolve missing verification before claiming completion. Keep credentials private; use an isolated development database for migrations.

Before ending: update the plan and memory with observed results, run npm run continuation, npm test, and npm run continuation:check, then link this prompt in the final response.
