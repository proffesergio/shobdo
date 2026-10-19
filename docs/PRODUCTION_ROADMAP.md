# Shobdo production vision and remaining scope

## Current stage

Shobdo remains in **Phase 1: scaffolding and core infrastructure**. The user
reports the writing UI is live at <https://shobdo-web.vercel.app> and accepts
that address. Keep it; do not spend time pursuing `shobdo.vercel.app` unless
requested again. Agent web and shell fetches failed, so remote page content,
deployed revision, build settings and interactive behavior are not independently
verified. Hosting a frontend is an early preview milestone.

Verified locally: separate web/admin/API/package boundaries, committed lockfile,
workspace typechecks and normal frontend builds, API/client HTTP tests, actual
Next.js proxy requests and a browser-asset credential scan. A read-only Neon
connection succeeded. Migration SQL and metadata were generated and reviewed.
The initial migration and rollback ownership fixture remain unapplied; the live
schema version remains 0. Native inference is not implemented.

The Git origin is `https://github.com/proffesergio/shobdo.git`; the initial
commit/workflow is present locally and the user reports a manual push and a
completed GitHub/Vercel connection. Remote Actions runs, project settings and
secret configuration are unverified. The earlier `vercel git connect` failure
is superseded by the owner's manual completion report; it is not independently
verified in this shell. A Git remote, a Vercel local project link and a
provider-side GitHub connection are distinct states.

## Product destination

A Bangladeshi creator signs in, writes or generates a Bangla video script using
the native SSM pipeline, saves it privately, and synthesizes real speech with
validated speed, volume, emotion and pronunciation settings. The creator can
enroll only their own voice with explicit consent, preview generated audio and
download supported text/audio formats. Account quotas, billing entitlements and
resource ownership are enforced by the backend. Administrators see authorized,
measured operational information and auditable actions.

This requires real models, licensed data, checkpoints, GPU/runtime validation and
quality evaluations. Do not replace the core pipeline with hosted generative
APIs or describe untrained models, mock services or simulated audio as inference.
Planning references to specific Mamba variants, A10G hardware, speedups or
sub-150ms first chunks remain candidates/goals until tested.

## Delivery order and acceptance

| Phase | Remaining scope | Evidence needed to move on |
| --- | --- | --- |
| 1: Foundation | Isolated Neon branch, live migrations/ownership; clean setup/advisory and Python package checks; browser UI/API acceptance; repository/CI wiring | Verified intended development target, error-stop migration and rollback fixture, reproducible setup, real browser flows, remote CI validation and documented routing/secrets |
| 2: Native inference | Architecture/runtime/data feasibility; Bangla normalization/G2P; script and speech model training/adaptation; real streaming | Licensed/provenanced checkpoints and datasets, repeatable inference, representative Bangla/code-mix fixtures and quality review, cancellation/backpressure, hardware/workload-bound latency and capacity results |
| 3: Creator product | Auth and persistence; durable generation/media jobs; complete studio; own-voice enrollment/revocation/deletion; admin, quotas and billing | Real authenticated generation/download, cross-owner denial, private media, explicit consent enforcement, safe retries/cancellation, signed billing webhooks and sandbox entitlements |
| 4: Release and expansion | Factual growth pages; voice-agent interfaces; end-to-end coverage; deployment hardening and operations | Staging journeys against real services, controlled voice-agent integration, load/failure/security checks, alerts/runbooks, backup restore and rollback drills, approved production rollout |

`memory/DEVELOPMENT_PLAN.json` is the executable source of task statuses and
acceptance checks. Later-phase rows describe planned work. Finish the earliest
unfinished phase before advancing; a hosted preview does not close Phase 1.

## Immediate next increment

1. Verify the supplied Neon project belongs to Shobdo and select/create an
   isolated development branch. Do not infer isolation from a working URL.
2. Apply the reviewed migration only to that branch; run
   `packages/db/tests/ownership.sql` with `ON_ERROR_STOP=1` and rollback. Record
   the live schema version only after success.
3. Finish clean `npm ci`, current online advisory review and installed Python
   3.11 package verification. Keep logs and credentials private.
4. Complete README browser checks: responsive Bangla UI, keyboard use, editing,
   storage failure/restoration/deletion, UTF-8 export, unavailable/retry states,
   admin denial and configured-origin behavior. Verify hosted assets and the
   actual deployed revision when access permits.
5. Verify the manually completed Vercel GitHub connection and project settings,
   then confirm repository app access, CI execution and required secrets without
   exposing values. Do not change proxy/security restrictions or repeatedly
   retry unchanged failures.
6. Close Phase 1 only with recorded evidence. Then begin native SSM feasibility
   with an architecture/data/runtime decision record and a concrete training
   and evaluation plan. Missing GPU, weights, data rights and budget are explicit
   blockers, not reasons to claim an inference prototype works.

## Service and delivery boundaries

`apps/web` and `apps/admin` talk to the independently deployed `apps/api` through
the typed `/api/v1` client, preferably via same-origin proxying. The API owns
auth, database operations, quotas, billing, jobs and inference orchestration.
The Python service remains behind it. Neon and object-storage credentials stay
server-only. Keep development, staging and production data/configuration separate.

`UI_PREVIEW_ONLY=true` is for a static first look: it removes API rewrites and
does not enable backend features. Connected deployments require a real API
origin and verified CORS/credential/CSRF behavior. Readiness must represent real
dependencies; the current scaffold correctly cannot report inference ready.

The intended production automation is the checked-in GitHub Actions workflow,
with separate API/web/admin project IDs and release gates. App configs currently
disable native Vercel Git auto-deployment to avoid a second path bypassing those
checks. Connecting the repository does not turn these settings on. Verify one
chosen delivery path end to end before calling auto-deploy operational; do not
remove the Phase 1 gate just to make a workflow green.

## Production release definition

Production readiness requires the complete evidence list in
`memory/DEVELOPMENT_PLAN.json`: real native creator journeys; authorization and
consent/deletion; reproducible checkpoints and licensed datasets; validated
Bangla handling and prosody; private media and protected downloads; quotas and
billing verification; current dependency/security review; accessible UI; tested
CI/CD and rollback; realistic load/cost limits; monitoring, backup recovery and
incident procedures. No compliance certification follows from scaffolding.

The continuation generator includes this vision, architecture boundaries,
current acceptance checks, concrete next actions, all later phases and production
release gates. Update observed state and regenerate it every session. This
roadmap does not authorize spending, paid provisioning or contacting others.
