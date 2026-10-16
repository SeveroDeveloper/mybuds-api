# CLAUDE.md

Guidance for Claude Code in this repository.

## What this repo is

`mybuds-api`: the NestJS backend of **mybuds**. It's one repo of a polyrepo:
- `../mybuds`: the **docs hub** (private). Product spec, domain rules, architecture, ADRs, roadmap. **Read it before changing business behavior**: `docs/business-rules.md`, `docs/domain-decisions.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/adr/`. Start sessions with `claude --add-dir ../mybuds` to have access.
- `../mybuds-web`: the React frontend. It only knows this API through the generated **OpenAPI** contract.

## Commands

`npm run start:dev` · `npm run build` · `npm run lint` (oxlint) · `npm run typecheck` · `npm test` (Vitest) · `npm run test:e2e`. Node 24 (`.nvmrc`). Development database = Neon `dev` branch; integration tests use the Neon `test` branch locally and a `postgres:18` service in CI.

## Architecture rules (details in ../mybuds/docs/ARCHITECTURE.md)

- **Modules = bounded contexts** under `src/modules/<context>/` with layers `domain/` → `application/` → `presentation/` + `infrastructure/`.
- **Dependency rule:** `domain/` never imports Nest, Prisma or Express. Prisma lives only in `infrastructure/`.
- Modules never read another module's tables; they use published **ports**.
- One class per use case. Business rules live in entities/aggregates; DTOs only validate shape.
- **Money:** never a JS `number`. `Money` value object (decimal.js), `numeric(14,2)` in the DB, decimal strings in JSON.
- **Tenancy:** the tenant is a **bud**. Routes `/api/v1/buds/{budId}/…`, `BudAccessGuard`, repositories require `budId`, non-member → 404, a cross-bud test for every repository.
- **Concurrency:** `version` column + 409, idempotent "set" endpoints, Idempotency-Key on money-creating POSTs.
- Code identifiers in English; user-facing errors are returned as codes (translated by the web).

## Definition of Done

See `../mybuds/docs/ROADMAP.md`. Unit tests for domain rules, integration tests (incl. cross-bud + concurrency), API e2e for the main flow, OpenAPI updated with no unplanned breaking change, migration reviewed.

## How to work with this user

The user is building mybuds **to learn software engineering for their next job**. Explain every decision briefly: why, what's interesting, the trade-off (🎓 / ⚖️). Keep explanations short. Name the AWS equivalent when touching infrastructure. Commit messages: **one line**, Conventional Commits, no body. Never commit secrets (`.env` is gitignored). Work on branches + PRs; don't push to `main` or merge unless asked.
