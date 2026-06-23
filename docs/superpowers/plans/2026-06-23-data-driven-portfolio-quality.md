# Data-Driven Portfolio + Enforced Quality — Implementation Plan

> **For agentic workers:** execute phase-by-phase; each phase ends green (lint/typecheck/test/build pass) and is committable. Steps use checkbox syntax.

**Goal:** Decouple all portfolio content into typed, Zod-validated data files on a strict-TypeScript base, covered by Vitest/RTL tests (≥80%), with a CI gate that blocks deploys on failure.

**Tech Stack:** React 19, Vite 6, TypeScript (strict), Zod, Vitest + React Testing Library + jsdom, ESLint (typescript-eslint), pnpm, GitHub Actions.

## Global Constraints
- pnpm only; run `pnpm install` after dep changes so `--frozen-lockfile` passes in Docker/CI.
- No `any`; infer types from Zod (`z.infer`).
- Content copied verbatim during decoupling — no visual change.
- Test data values include a `test`/`mock`/`dummy`/`example` marker.

---

## Phase 1 — TypeScript foundation + CI skeleton

- [ ] Add deps: `typescript`, `typescript-eslint`, `@types/node` (dev).
- [ ] Add `tsconfig.json` (strict, `noEmit`, `jsx: react-jsx`, `moduleResolution: bundler`, `noUncheckedIndexedAccess`).
- [ ] Add `tsconfig.node.json` for vite/config files.
- [ ] Add scripts to `package.json`: `"typecheck": "tsc --noEmit"`, `"test": "vitest run"`, `"test:cov": "vitest run --coverage"`.
- [ ] Rename `vite.config.js` → `vite.config.ts`; convert `src/main.jsx`→`.tsx`, `src/App.jsx`→`.tsx`.
- [ ] Update ESLint config for TS (`typescript-eslint` recommended).
- [ ] Add `.github/workflows/ci.yml`: install → lint → typecheck → build (tests added Phase 3).
- [ ] Verify: `pnpm install && pnpm lint && pnpm typecheck && pnpm build` all pass.
- [ ] Commit.

Note: convert remaining `.jsx` components to `.tsx` here OR incrementally in Phase 2 as each is touched. Chosen: convert entry + config in P1; convert each component when decoupled in P2 (minimizes churn per commit).

---

## Phase 2 — Content decoupling + Zod schemas

- [ ] Add dep: `zod`.
- [ ] Create `src/data/schema.ts`: Zod schemas for Project, Experience(+year grouping), Profile, Skill/TechStack, Hobby, Contact; export inferred types.
- [ ] Create `src/data/{projects,experiences,profile,skills,hobbies,contact}.ts` — copy content verbatim from the current components, typed by the inferred types.
- [ ] Create `src/data/index.ts` — `schema.parse()` each dataset, re-export validated typed data; throw with clear message on failure.
- [ ] Create `scripts/validate-data.ts` + script `"validate-data": "tsx scripts/validate-data.ts"` (add `tsx` dev dep) — imports `src/data` so a bad edit fails fast.
- [ ] Refactor each component (`Project`, `Experience`, `ProfileCard`, `KnowEachOther`, `TechStackDialog`, `SkillsetsDialog`, `Hobbies`, `Contact`) to `.tsx`, importing from `src/data`; remove inline content.
- [ ] Add `validate-data` to `ci.yml` before build; keep build-with-reviews working.
- [ ] Verify: app renders identically (`pnpm dev` spot-check); corrupting a data field fails `pnpm validate-data` with a Zod error; `pnpm build` passes.
- [ ] Commit.

---

## Phase 3 — Tests + coverage

- [ ] Add dev deps: `vitest`, `@vitest/coverage-v8`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`.
- [ ] Add `vitest.config.ts` (env jsdom, globals, setup file, coverage v8, thresholds 80% on `src/data`+`src/components`).
- [ ] Add `src/test/setup.ts` (jest-dom matchers).
- [ ] Schema tests: each schema accepts a valid fixture, rejects bad input (missing field, bad URL).
- [ ] Data integrity test: `import('../data')` resolves (real data valid).
- [ ] Component render tests: each data-driven component renders content from a mock dataset.
- [ ] Interaction tests: project pagination, experience selection.
- [ ] Wire `pnpm test:cov` into `ci.yml`.
- [ ] Verify: `pnpm test:cov` passes with coverage ≥ 80%.
- [ ] Commit.

---

## Phase 4 — Gate deploy behind CI

- [ ] Change `deploy.yml` to trigger on `workflow_run` of "CI" completed successfully on `main` (replace the `push` trigger), with an `if: github.event.workflow_run.conclusion == 'success'` guard.
- [ ] Verify: a failing CI run does NOT trigger deploy; a passing CI run does.
- [ ] Commit.

---

## Self-Review
- Covers all four pillars (TS, Zod, tests, CI gate) + content decoupling — maps to spec.
- No placeholders; each phase has explicit verify commands.
- Naming consistent: `src/data/index.ts`, `validate-data`, `typecheck`, `test:cov`, `ci.yml`.
