<div align="center">

# Shobdo

### A Bangla-first creative studio for video makers

Write in Bangla. Shape every line. Build toward expressive speech with native state space models.

[Open the live preview](https://shobdo-web.vercel.app) · [Production roadmap](docs/PRODUCTION_ROADMAP.md) · [Deployment notes](docs/DEPLOYMENT.md)

**Current stage: Phase 1 — foundation** · Frontend preview reported live · Native inference not implemented

</div>

---

Shobdo is being built for Bangladeshi Facebook and YouTube creators. The product vision brings Bangla script creation, controllable text-to-speech, consent-based own-voice cloning, and protected downloads into one studio, backed by a native SSM pipeline.

The current app is an early writing workspace: edit a Bangla draft, optionally keep it in this browser, and download UTF-8 text. The hosted preview is [shobdo-web.vercel.app](https://shobdo-web.vercel.app), as reported by the project owner. Its deployed revision and interactive behavior have not yet been independently checked.

> **Implementation status:** Script generation, speech synthesis, voice cloning, login, billing, persistent user data, and model inference are not implemented. No generated audio is simulated or presented as real inference. Phase 1 remains open while database isolation, browser acceptance, and delivery checks are completed.

## What you can try

- **Bangla writing workspace** — draft and edit text with Bangla and English together.
- **Optional local draft** — opt in to save a draft in this browser; drafts are not uploaded.
- **UTF-8 text export** — download the current draft as a `.txt` file.
- **API connection status** — the web and admin apps use a typed client and a separate API scaffold.

These describe the current foundation. Native script generation, audio playback, voice enrollment, and account features are future work.

## Project map

| Workspace | Purpose | Local port |
| --- | --- | ---: |
| [`apps/web`](apps/web) | Creator writing workspace | 3000 |
| [`apps/admin`](apps/admin) | Admin interface scaffold | 3001 |
| [`apps/api`](apps/api) | Independent Node API and OpenAPI contract | 4000 |
| [`packages/api-client`](packages/api-client) | Shared typed HTTP client | — |
| [`packages/db`](packages/db) | Drizzle schema and Neon database integration | — |
| [`packages/ssm-core`](packages/ssm-core) | Python package boundary for future native inference | — |

Web and admin communicate with the API through the versioned `/api/v1` contract. The API will own authentication, authorization, persistence, quotas, billing, and inference orchestration. The native Python/PyTorch/CUDA service stays behind that backend boundary.

## Run locally

Requirements: Node.js 22 or 24, npm, and Python 3.11 for SSM package work. The current UI and API scaffold can be started without configuring a database.

```powershell
git clone https://github.com/proffesergio/shobdo.git
cd shobdo
npm ci
npm run typecheck
npm run build
```

Start each service in its own PowerShell terminal:

```powershell
npm run dev:api
```

```powershell
npm run dev:web
```

```powershell
npm run dev:admin
```

Then visit [localhost:3000](http://localhost:3000) and [localhost:3001](http://localhost:3001). The API listens on `127.0.0.1:4000` by default. The UI calls `/api/v1/capabilities` through a same-origin Next.js proxy. Readiness currently reports unavailable because the database and inference dependencies are not verified.

### Environment

Copy `.env.example` to `.env` for optional server-side configuration. Each Next.js app has its own `.env.example` for app-specific settings. Keep database and service credentials server-side; never use a `NEXT_PUBLIC_` variable for a secret. The current writing workspace does not need database credentials.

For database setup and the isolated Neon migration procedure, see [Deployment and database notes](docs/DEPLOYMENT.md). Do not migrate until the target is confirmed to be an isolated Shobdo development branch.

## Verify changes

```powershell
npm test
npm run typecheck
npm run build
npm run secrets:check
```

The API tests exercise real loopback HTTP requests, validation, access denial, CORS, timeouts, cancellation, and unavailable-service behavior. They do not prove browser-level product flows or model inference. See the [local validation record](memory/LOCAL_VALIDATION.md) for remaining UI and browser checks.

## Development status

| Area | Status |
| --- | --- |
| Monorepo, lockfile, API contract, and database schema draft | Implemented; local typechecks/builds previously passed |
| Creator writing workspace | Implemented; browser acceptance remains |
| Neon migration and ownership validation | Pending verified isolated development branch |
| Authentication, persistence, and billing | Not implemented |
| Native Bangla SSM models and speech pipeline | Not implemented; architecture/data/runtime feasibility remains |
| Hosted UI | Owner reports [shobdo-web.vercel.app](https://shobdo-web.vercel.app) live; remote build and UI behavior unverified here |
| Production release | Not ready; Phase 1 acceptance is incomplete |

The full destination, phase gates, and acceptance evidence are in the [production roadmap](docs/PRODUCTION_ROADMAP.md). Project continuity and the next concrete task are maintained in [`memory/CONTINUATION_PROMPT.md`](memory/CONTINUATION_PROMPT.md).

## Push this README to GitHub

The repository is connected to GitHub manually. To publish only this README update from the `main` branch, run:

```powershell
git status --short
git add README.md
git diff --cached --check
git diff --cached -- README.md
git commit -m "Refresh README project showcase"
git push origin main
```

Review the staged diff before committing. `git add README.md` limits the commit to this file, even if other project changes are present locally. If you are working on a feature branch, replace `main` in the push command with that branch name.

## Product principles

- Build the core script and speech pipeline with native SSMs; validate architecture, licenses, hardware, and model evidence before making capability claims.
- Handle Bangla digits, dates, identifiers, conjuncts, and Bangla-English code mixing deliberately.
- Require explicit consent to enroll a person's own voice, and enforce access, revocation, retention, and deletion in the backend.
- Measure latency and quality on named workloads, hardware, and checkpoints. Targets are not results.
- Keep credentials out of source control and browser bundles. Do not claim compliance from scaffolding.

See [`AGENTS.md`](AGENTS.md) for repository workflow and [`PROJECT_SYSTEM_PROMPT.md`](PROJECT_SYSTEM_PROMPT.md) for the product brief.
