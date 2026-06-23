# Design: Data-Driven Portfolio + Enforced Code Quality

**Date:** 2026-06-23
**Status:** Approved (recommended defaults)

---

## Goal

Make updating the portfolio's "about me" content low-friction and safe, and enforce high code
quality automatically. Concretely:

1. Move ALL hardcoded content (projects, experiences, profile/about, skills/tech, hobbies,
   contact) out of JSX into **typed, schema-validated data files**. Updating content becomes
   editing one data file, not hunting through components.
2. Migrate the codebase to **TypeScript (strict)**.
3. Validate every data file against a **Zod schema** at build time — a malformed/incomplete entry
   fails the build with a clear error instead of shipping broken.
4. Add a **Vitest + React Testing Library** test suite with an enforced **80% coverage** floor.
5. Add a **CI quality gate** (`ci.yml`) that runs lint → typecheck → test → build on every
   push/PR, and **block the deploy** (`deploy.yml`) unless CI passes.

Non-goal (explicitly deferred per user decision): external content automation (GitHub API sync,
headless CMS, scheduled rebuilds). Content is hand-edited in data files. The architecture leaves
room to add a build-time fetch later (the existing `fetch-letterboxd.js` pattern), but that is out
of scope here.

---

## Current state (from repo scan)

- React 19 + Vite, plain JS/JSX. No TypeScript, no tests, no CI quality gate (only `deploy.yml`).
- Content is hardcoded inline: `const projects = [...]` in `src/components/Project.jsx`,
  `experienceData = {...}` in `src/components/Experience.jsx`, and similar in
  `ProfileCard.jsx`, `KnowEachOther.jsx`, `TechStackDialog.jsx`, `SkillsetsDialog.jsx`,
  `Hobbies.jsx`, `Contact.jsx`.
- One existing build-time automation: `scripts/fetch-letterboxd.js` → writes
  `public/data/letterboxd_reviews.json`, consumed at runtime.
- Deploy: push to `main` → GitHub Actions builds Docker image (nginx) → ghcr.io → k3s rollout.
  Vercel also auto-deploys the apex. Both consume the same build output.

---

## Architecture

### Data layer (`src/data/`)

```
src/data/
  schema.ts       # Zod schemas; TS types via z.infer (single source of truth)
  projects.ts     # typed data arrays/objects, validated against schema
  experiences.ts
  profile.ts      # about / profile card
  skills.ts       # tech stack + skillsets
  hobbies.ts
  contact.ts      # contact links
  index.ts        # imports all data + schemas, runs schema.parse() on each,
                  # re-exports validated, typed data. Throws on invalid data.
```

- **Schemas are the source of truth.** Each content type has a Zod schema; the TS type is
  `z.infer<typeof schema>`. Data files are typed by that inferred type, so types and runtime
  validation can never drift.
- **Validation runs at module load.** `index.ts` calls `schema.parse(data)` for each dataset.
  Because Vite evaluates this during `build`, invalid data fails the build. A standalone
  `scripts/validate-data.ts` (run in CI before build) gives a fast, clear failure independent of
  the full build.
- Components import already-validated, typed data from `src/data` and contain **no inline
  content**. Component responsibility narrows to presentation + interaction only.

### TypeScript

- Add `tsconfig.json` with `strict: true`, `noUncheckedIndexedAccess: true`,
  `jsx: react-jsx`, `moduleResolution: bundler`, `noEmit: true`.
- Convert `.jsx` → `.tsx` and `.js` → `.ts` (including `src/main.jsx`, `src/App.jsx`, all
  components, `scripts/*`). Add `@types/react`, `@types/react-dom` (already present).
- `tsc --noEmit` is a CI step; Vite handles transpilation via `@vitejs/plugin-react`.
- ESLint updated for TypeScript (`typescript-eslint`).

### Testing

- **Vitest + @testing-library/react + @testing-library/jest-dom + jsdom.**
- `vitest.config.ts` (or merged into `vite.config`) with `environment: jsdom`, globals, and
  `coverage` (provider `v8`) thresholds at **80%** for lines/statements/functions/branches,
  scoped to `src/data/**` and `src/components/**`.
- Test categories:
  - **Schema tests:** each schema accepts a known-good fixture and rejects representative bad
    input (missing required field, malformed URL, empty array where ≥1 required).
  - **Data integrity test:** importing `src/data` succeeds (real data passes its own schemas).
  - **Component render tests:** each data-driven component renders expected content from a
    provided/mocked dataset.
  - **Interaction tests:** project pagination (`Project.jsx`) and experience selection
    (`Experience.jsx`) behave correctly.

### CI quality gate

- New workflow `.github/workflows/ci.yml`, triggers: `push` (all branches) + `pull_request`.
  Steps: checkout → setup-node + pnpm → `pnpm install --frozen-lockfile` →
  `pnpm lint` → `pnpm typecheck` (`tsc --noEmit`) → `pnpm test --coverage` →
  `pnpm build`.
- **Gate the deploy:** `deploy.yml` runs only after CI succeeds. Implementation: change
  `deploy.yml` trigger to `workflow_run` (depends on CI completing successfully on `main`), OR
  add the same lint/typecheck/test steps as required earlier stages within `deploy.yml` before
  the build/push job. Chosen approach: **`workflow_run`** so the gate is explicit and the deploy
  job stays focused.

---

## Phased delivery

Each phase is independently shippable, verifiable, and leaves `main` green.

| Phase | Deliverable | Verify |
|-------|-------------|--------|
| 1 | TS foundation: `tsconfig`, deps, convert build entry + config to TS, ESLint-TS, `ci.yml` skeleton running lint + typecheck + build | `pnpm lint && pnpm typecheck && pnpm build` pass locally and in CI |
| 2 | `src/data/` with Zod schemas + all content decoupled + `validate-data` script; components consume typed data | App renders identically; corrupting a data file fails build/validate with clear error |
| 3 | Vitest/RTL suite + coverage ≥ 80% wired into `ci.yml` | `pnpm test --coverage` passes, threshold enforced |
| 4 | `deploy.yml` gated behind CI (`workflow_run`) | A failing CI run blocks deploy; passing CI triggers deploy |

---

## Constraints

- Package manager: **pnpm** (never npm). Keep `pnpm-lock.yaml` in sync (run `pnpm install`
  after dependency changes, so `--frozen-lockfile` passes in CI/Docker).
- No `any` in TypeScript — infer from Zod or define explicit types.
- Test data must include `test`/`mock`/`dummy`/`example` markers in values.
- Visual output must not change after content decoupling (Phase 2 is a refactor, not a redesign).
- The Dockerfile build (`pnpm run build-with-reviews`) must keep working; data validation must
  not break the existing Letterboxd build step.

---

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| TS migration churn breaks build | Phase 1 converts incrementally; `tsc --noEmit` + build gate catch regressions before deploy |
| Content drift during decoupling | Snapshot/visual check; copy content verbatim from current components into data files |
| Coverage threshold blocks legit work | Scope coverage to `src/data` + `src/components`; 80% is achievable for a presentational app |
| `workflow_run` gating misconfigured (deploy never fires) | Verify in Phase 4 with a deliberate failing + passing CI run |
| Lockfile drift fails Docker `--frozen-lockfile` | Always `pnpm install` after dep changes and commit the lockfile |

---

## Success criteria

- Editing any content = editing one file under `src/data/`; a malformed edit fails the build with
  a clear Zod error (never ships).
- `pnpm lint && pnpm typecheck && pnpm test --coverage && pnpm build` all pass; coverage ≥ 80%.
- CI runs on every push/PR; **deploy only happens when CI is green.**
- Rendered site is visually unchanged from today.
- `dafandikri.tech` (Vercel) and `k8s.dafandikri.tech` (k3s) both continue to work.
