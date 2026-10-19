# Shobdo / Bhasha Labs

## Mission and scope

Build a Bangla-first native State Space Model platform for Bangladeshi Facebook and YouTube creators. The MVP covers Bangla video scripts, text-to-speech, cloning the user's own voice, and multi-format downloads.

Read `PROJECT_SYSTEM_PROMPT.md` for the project brief and `memory/PROJECT_MEMORY_GRAPH.json` before starting work. `master_prompt_optimization.md` is supporting research and planning material; its assertions are not verified implementation facts.

## Architecture

- Use a monorepo with separate frontend applications in `apps/web` and `apps/admin`, a backend API application in `apps/api`, and shared infrastructure in `packages/db` and `packages/ssm-core`.
- Planned stack: Next.js frontend, Drizzle ORM with Neon PostgreSQL, and a native PyTorch/CUDA SSM inference service.
- Prioritize native SSM model development and inference. Do not substitute hosted third-party generative APIs for the core model pipeline.
- Validate model architecture, dependency versions, hardware support, and licenses before selecting or installing them. Mamba variants mentioned in planning documents are candidates, not implemented capabilities.
- Keep frontend, admin, persistence, and inference responsibilities separate.
- Handle Bangla Unicode, Bangla digits ০–৯, dates, identifiers, conjuncts, and Bangla-English code mixing deliberately.
- Implement speed, volume, emotion, and pronunciation controls through explicit, validated inference inputs.

### Frontend/backend separation and API communication

- Keep `apps/web` and `apps/admin` independently buildable from `apps/api`. Give the backend its own entry point, configuration, tests, and development command.
- Put application business logic, database access, authorization, quotas, billing integration, and inference orchestration in `apps/api`. Frontends must not import database modules, model code, or backend secrets. Keep the Python inference service behind the backend boundary.
- Use versioned HTTP endpoints under `/api/v1` and a documented OpenAPI contract. Centralize frontend API calls in a typed client with configurable API origin, request cancellation, timeouts, and consistent error handling.
- Validate requests at the API boundary and return documented response schemas, appropriate HTTP status codes, and a consistent error shape with a request ID. Do not expose stack traces or credentials to clients.
- Prefer a same-origin reverse proxy for browser requests. If separate origins are required, allow only explicitly configured frontend origins through CORS; define credential and CSRF behavior explicitly. Never combine wildcard origins with credentialed access.
- Authenticate and authorize protected endpoints server-side, including resource ownership and admin roles. Keep service credentials server-only. Public frontend environment variables may contain API origins but never secrets.
- Document local ports, environment variables, startup commands, and deployment routing. Provide separate liveness and readiness endpoints; readiness must reflect required dependencies accurately.
- Treat working frontend/backend communication as an acceptance check: run both applications, verify an actual frontend request reaches the backend, and verify validation errors, unauthorized access, API unavailability, and configured origin behavior. Record the results; a typed client or health endpoint alone does not establish a working product integration.

## Delivery sequence

1. Scaffold the monorepo, database schema, local configuration, and project memory.
2. Develop the native SSM service, text normalization/G2P pipeline, and streaming audio contract.
3. Build the creator studio, own-voice cloning workflows, admin telemetry, and billing integrations.
4. Add growth pages, agent interfaces, end-to-end validation, and deployment hardening.

Complete reviewable increments. Do not present scaffolding, simulated audio, untrained models, or mocked services as working inference. Label mocks clearly and report missing datasets, weights, GPUs, credentials, and external dependencies.

## Quality and security

- Treat <150 ms first audio chunk, speedups, transcript accuracy, A10G deployment, and compliance readiness as goals requiring measured evidence.
- Record benchmark hardware, model/checkpoint, workload, and measurement boundaries with performance results.
- Require explicit voice-owner consent for cloning. Protect recordings, voice embeddings, and generated media with access control and retention/deletion policies.
- Keep secrets out of source control. Use documented environment variables and example values.
- Validate input and authorization at service boundaries; verify billing webhooks and enforce quotas server-side.
- Run checks appropriate to each change and report results honestly. Do not claim SOC2 or HIPAA compliance from architecture or scaffolding alone.

## Project continuity

Update `memory/PROJECT_MEMORY_GRAPH.json` after meaningful work with completed features, actual validation, decisions, blockers, and a concrete next-step directive. Keep it valid JSON; distinguish planned, mocked, implemented, and verified status. Never invent commits or test results.

### Mandatory continuation protocol

At the end of every development session, including blocked or partial sessions:

1. Read `memory/DEVELOPMENT_PLAN.json`. Update task status only from observed implementation and validation. Record pending checks and blockers in the memory graph.
2. Work on the earliest unfinished phase. Do not advance because a session ended. A phase is complete only when every task and its acceptance checks are complete.
3. Run `npm run continuation` to generate `memory/CONTINUATION_PROMPT.md` and synchronize `next_agent_prompt` in the memory graph. The generator selects the earliest unfinished phase and includes its outstanding tasks, acceptance checks, blockers, and validation history. When all phases are done, it requests a review of remaining risks instead of inventing a new phase.
4. Run `npm run continuation:check` to verify the generated prompt is current. Resolve stale output before ending the session.
5. End the final response with a concise continuation directive and a link to `memory/CONTINUATION_PROMPT.md`. Report unfinished verification explicitly. The generated prompt is a handoff, not authorization to deploy, spend money, or contact others.

If the generator cannot run, manually update both continuation outputs using the same rules and record the failure. Never omit the handoff because the work is blocked.

This repository guidance supplements the active agent's governing instructions; it does not replace them.
