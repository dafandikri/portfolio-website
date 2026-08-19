# Talk-Active, Kato and the Visitor Center — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Talk-Active as the fifth featured project, regrid the paddocks 3-over-2, perch the Kato mascot outside the Talk-Active containment unit, and add a Visitor Center scene that records the Best Presentation award and references the project.

**Architecture:** Content stays data-driven — a new project entry, a new `awardSchema` and `awards.ts`, both Zod-validated at module load by `src/data/index.ts`, plus a referential check that a Zod schema cannot express. The paddock regrid is CSS-only because paddock serials derive from array index. Kato is a presentational component rendered inside the Talk-Active `<li>` but positioned into the airspace above it. The Visitor Center is a fifth `DeferredScene` using the existing lazy-import and in-view gating.

**Tech Stack:** React 19, TypeScript, Vite, Zod 4, Vitest 4, @testing-library/react 16, ImageMagick + cwebp for asset preparation.

**Spec:** `docs/superpowers/specs/2026-08-18-talk-active-awards-kato-design.md`

## Global Constraints

- **Project copy is pure product.** No project's `description`, `context`, or `features` may mention the hackathon, the competition, the team, or the award. That content belongs only to `src/data/awards.ts`. The reference points one way: award → project.
- **No `any`.** Types are inferred from Zod schemas via `z.infer`, per the existing `src/data/schema.ts`.
- **Talk-Active does not use Tailwind.** It ships hand-written CSS. Do not add `tailwind` to its `techStack`.
- Every `techStack` key must resolve in the `icons` map in `src/assets/index.js`. Approved keys for Talk-Active: `nextjs`, `typescript`, `react`, `postgresql`, `playwright`.
- Kato is decorative: `aria-hidden="true"` and `pointer-events: none`, always.
- Every scene honours `prefers-reduced-motion: reduce`.
- Package manager is **pnpm**. Never npm or npx.
- Commands: `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm validate-data`.
- Source assets live in `~/Documents/Universitas Indonesia/Non-Academics/hackathon-ristek-2026-fam` (referred to below as `$TA`).

---

### Task 1: Talk-Active project data and paddock media

**Files:**
- Create: `src/assets/img/talkactive_project_landscape.webp`
- Modify: `src/data/projects.ts`
- Modify: `src/components/scenes/projectMedia.ts`
- Test: `src/components/scenes/projectMedia.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: a project titled exactly `'Talk-Active'` with `image: 'talkactive_project'`, `featured: true`, at index 2 of `projectsData`. Task 2 relies on there being five featured projects; Task 3 relies on the exact title string `'Talk-Active'`; Task 4 relies on it for the referential check.

- [ ] **Step 1: Write the failing test**

Append to `src/components/scenes/projectMedia.test.ts`:

```ts
describe('Talk-Active media', () => {
  it('resolves media for the Talk-Active paddock', () => {
    const media = projectMedia('talkactive_project')
    expect(media).not.toBeNull()
    expect(media?.kind).toBe('image')
  })

  it('gives Talk-Active a paddock plaque title', () => {
    expect(projectCardTitle('Talk-Active')).toBe('Talk-Active')
  })
})
```

If `describe`, `projectMedia` or `projectCardTitle` are not already imported at the top of that file, add them:

```ts
import { describe, it, expect } from 'vitest'
import { projectCardTitle, projectMedia } from './projectMedia'
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/scenes/projectMedia.test.ts`
Expected: FAIL — `projectMedia('talkactive_project')` returns `null`, so `expect(media).not.toBeNull()` fails.

- [ ] **Step 3: Build the paddock still**

The source screenshot is 1440×1407. Paddocks are `aspect-ratio: 1.48`, so 1440 / 1.48 ≈ 973. Cropping from the top keeps the sidebar, the headline card and the main project card in frame.

```bash
TA=~/"Documents/Universitas Indonesia/Non-Academics/hackathon-ristek-2026-fam"
magick "$TA/.lavish/updated-workspace.png" -crop 1440x973+0+0 +repage /tmp/ta-crop.png
cwebp -q 82 /tmp/ta-crop.png -o src/assets/img/talkactive_project_landscape.webp
magick identify src/assets/img/talkactive_project_landscape.webp
```

Expected: `1440x973`. Confirm the file is comfortably under 200 KB; if not, re-run `cwebp` at `-q 75`.

- [ ] **Step 4: Register the media**

In `src/components/scenes/projectMedia.ts`, add the import beside the existing four:

```ts
import talkactiveProjectLandscape from '../../assets/img/talkactive_project_landscape.webp'
```

Add to `PROJECT_MEDIA`, after the `boulder_project` entry:

```ts
  talkactive_project: {
    kind: 'image',
    src: talkactiveProjectLandscape,
    alt: 'Talk-Active rehearsal workspace showing a current project, its evaluator rubric and the next practice session',
  },
```

Add to `SHORT_TITLES`, after `'Boulder Coach': 'Boulder Coach',`:

```ts
  'Talk-Active': 'Talk-Active',
```

- [ ] **Step 5: Add the project entry**

In `src/data/projects.ts`, insert this object **between** the `Boulder Coach` entry and the `Portfolio Website` entry, so Talk-Active takes paddock 03 in the top row.

Read the Global Constraints again before writing the copy: nothing here mentions the hackathon.

```ts
  {
    title: 'Talk-Active',
    year: '2026',
    featured: true,
    context: 'Team product · Live',
    description:
      "A rehearsal workspace for students preparing a rubric-graded pitch, scholarship interview, thesis defence or competition Q&A. Rather than scoring delivery, it maps a spoken attempt against the evaluator's actual rubric, refuses any verdict it cannot support with a quote from the transcript, and turns the weakest claim into the next question the student has to answer.",
    image: 'talkactive_project',
    features: [
      'Semantic analysis through the Vercel AI Gateway, with every model-proposed verdict rejected server-side unless its supporting quote is found verbatim in the transcript',
      'Visible degradation — a timeout, malformed response or exhausted budget falls back to deterministic cue matching, and the interface names which engine produced each verdict',
      'Rubric → attempt → evidence → grounded judge question → saved session loop, persisted so projects, drafts and history survive a reload',
      'Optional camera-and-microphone replay behind explicit opt-in plus browser dictation; guest workspace data never leaves localStorage',
    ],
    techStack: ['nextjs', 'typescript', 'react', 'postgresql', 'playwright'],
    liveLink: 'https://talk-active-id.vercel.app',
    liveLabel: 'Open live app',
    repoLink: 'https://github.com/dafandikri/talk-active',
  },
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm test -- src/components/scenes/projectMedia.test.ts src/data`
Expected: PASS. The data tests also confirm the new entry satisfies `projectSchema`.

- [ ] **Step 7: Verify data and types**

Run: `pnpm validate-data && pnpm typecheck`
Expected: both exit 0. `validate-data` fails loudly if the entry is malformed.

- [ ] **Step 8: Commit**

```bash
git add src/data/projects.ts src/components/scenes/projectMedia.ts \
        src/components/scenes/projectMedia.test.ts \
        src/assets/img/talkactive_project_landscape.webp
git commit -m "feat: add Talk-Active as a featured project

Its paddock shows a still rather than a walkthrough clip: the recording
does not exist yet. The image branch of projectMedia already supports
this, so no new media type is invented for a gap that closes as soon as
the clip is captured.

The copy describes the product only. The hackathon result it earned is
recorded separately, in the awards data, which points at the project
rather than the other way round."
```

---

### Task 2: Regrid the paddocks 3-over-2

**Files:**
- Modify: `src/components/scenes/ParkScene.css:148-161` (`.park__grid`), `:163` (`.park__containment`), `:842-845` (short-viewport query)
- Test: `src/components/scenes/ParkScene.test.tsx`

**Interfaces:**
- Consumes: five featured projects from Task 1.
- Produces: a grid whose top row holds three paddocks and whose bottom row holds two, centred. Task 3 relies on `.park__grid` having top padding that reserves airspace above the top row.

- [ ] **Step 1: Update the stale test name and assert five paddocks**

The existing assertions already derive counts from `featured.length`, so they pass unchanged. Only the name lies. In `src/components/scenes/ParkScene.test.tsx`, rename the first test and add an explicit count so the number is pinned rather than implied:

```ts
  it('shows five complete containment paddocks and a quieter earlier-work archive', () => {
    const { container } = render(<ParkScene />)

    expect(featured).toHaveLength(5)
    expect(screen.getByRole('heading', { level: 2, name: 'Projects' })).toBeInTheDocument()
    expect(container.querySelectorAll('.park__containment')).toHaveLength(featured.length)
```

Leave the remainder of that test body exactly as it is.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/scenes/ParkScene.test.tsx`
Expected: PASS if Task 1 is complete, because five featured projects now exist. If it FAILS with `expected 4 to have length 5`, Task 1 was not finished — go back and finish it before continuing.

- [ ] **Step 3: Widen the grid and switch to six tracks**

In `src/components/scenes/ParkScene.css`, replace the `grid-template-columns`, `grid-template-rows`, `padding` and `width` declarations inside `.park__grid` (around line 148):

```css
.park__grid {
  display: grid;
  flex: none;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  grid-template-rows: repeat(2, auto);
  gap: clamp(0.72rem, 1.7vw, 1.15rem) clamp(0.9rem, 2vw, 1.4rem);
  min-height: 0;
  margin: 0;
  /* Top padding is Kato's airspace: he perches above the top row's lintel,
     outside the containment unit, and must never reach the header plaque. */
  padding: 2.6rem 0.8rem 0.7rem;
  list-style: none;
  perspective: 1200px;
  transition: opacity 260ms ease, transform 320ms ease;
  width: min(100%, 64rem);
}
```

Immediately after the `.park__containment` rule (around line 163), add the span rules. Six tracks with each unit spanning two is what lets the bottom row sit half a column in from each edge without a wrapper element:

```css
.park__containment { grid-column: span 2; }
.park__containment:nth-child(4) { grid-column: 2 / span 2; }
.park__containment:nth-child(5) { grid-column: 4 / span 2; }
```

- [ ] **Step 4: Relax the short-viewport query**

Three columns need more room than two did. At line 842 replace the grid width:

```css
@media (max-height: 720px) and (min-width: 761px) {
  .park__grid { width: min(100%, 60rem); gap: 0.55rem 0.85rem; padding-top: 2.1rem; }
  .park__sill { height: 2rem; }
}
```

- [ ] **Step 5: Neutralise the span rules on mobile**

The `max-width: 760px` block already sets `grid-template-columns: 1fr`, but the `nth-child` span rules would still apply and break the single column. Inside that existing block (around line 811), add:

```css
  .park__containment,
  .park__containment:nth-child(4),
  .park__containment:nth-child(5) { grid-column: auto; }
```

- [ ] **Step 6: Verify in a browser**

```bash
pnpm dev
```

Open the projects scene and confirm at each width that the top row holds three paddocks, the bottom row holds two and is centred, and nothing overflows the stage:

- 1440×900
- 1024×768
- 800×720 (exercises the `max-height: 720px` query)
- 390×844 (single column, stage scrolls)

- [ ] **Step 7: Run the full suite**

Run: `pnpm test && pnpm typecheck && pnpm lint`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/scenes/ParkScene.css src/components/scenes/ParkScene.test.tsx
git commit -m "feat: regrid paddocks three-over-two for a fifth project

Four projects fitted a quadrant. Five do not, and the stage is a single
non-scrolling viewport, so the row that would have overflowed becomes a
centred row of two instead.

Six tracks with each unit spanning two is what allows that centring
without a wrapper element. The grid also gains top padding, reserving
the airspace above the top row that the mascot occupies next.

Mobile is untouched behaviourally: it was already a scrolling single
column, so the span rules are switched off there."
```

---

### Task 3: Kato, perched outside the containment unit

**Files:**
- Create: `src/assets/img/kato-poses.webp`
- Create: `src/components/KatoPerch.tsx`
- Create: `src/components/KatoPerch.css`
- Create: `src/components/KatoPerch.test.tsx`
- Modify: `src/components/scenes/ParkScene.tsx`
- Modify: `src/components/scenes/ParkScene.test.tsx`

**Interfaces:**
- Consumes: the project title `'Talk-Active'` from Task 1; `.park__grid` top padding from Task 2.
- Produces: `export default function KatoPerch(): JSX.Element` — takes no props. Renders a single `<span class="kato" aria-hidden="true">`.

- [ ] **Step 1: Write the failing test**

Create `src/components/KatoPerch.test.tsx`:

```tsx
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import KatoPerch from './KatoPerch'

afterEach(cleanup)

describe('KatoPerch', () => {
  it('renders a decorative perch that assistive technology ignores', () => {
    const { container } = render(<KatoPerch />)

    const kato = container.querySelector('.kato')
    expect(kato).toBeInTheDocument()
    expect(kato).toHaveAttribute('aria-hidden', 'true')
  })

  it('adds no accessible name or role of its own', () => {
    render(<KatoPerch />)

    // A mascot is decoration. The paddock beneath it already carries the
    // accessible name; a second one here would only add noise.
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/KatoPerch.test.tsx`
Expected: FAIL — `Failed to resolve import "./KatoPerch"`.

- [ ] **Step 3: Build the sprite strip**

The four mascot SVGs in `$TA/src/assets/mascot/` are roughly 1 MB each — they are base64 PNGs inside an SVG wrapper, not vector art. Shipping them would undo the PageSpeed results the README documents. Extract the pose sheet's bitmap and cut three poses from it instead.

The crop boxes below were measured from the sheet, not guessed. Each pose is re-canvassed with `-gravity South` so all three share a foot baseline; without that they sit at different heights and Kato appears to sink when he changes pose.

```bash
TA=~/"Documents/Universitas Indonesia/Non-Academics/hackathon-ristek-2026-fam"

python3 - "$TA" <<'PY'
import base64, re, sys
sheet = f"{sys.argv[1]}/src/assets/mascot/kato-macaw-pose-sheet.svg"
m = re.search(r'base64,([A-Za-z0-9+/=]+)', open(sheet).read())
open("/tmp/kato-sheet.png", "wb").write(base64.b64decode(m.group(1)))
PY

# idle | wings-spread | wings-up, left to right
i=0
for box in "261x374+66+153" "304x329+349+164" "350x346+988+587"; do
  i=$((i+1))
  magick /tmp/kato-sheet.png -crop $box +repage \
    -background none -gravity South -extent 380x400 -resize 190x200 "/tmp/kato-$i.png"
done
magick /tmp/kato-1.png /tmp/kato-2.png /tmp/kato-3.png +append /tmp/kato-strip.png
cwebp -q 90 -alpha_q 100 /tmp/kato-strip.png -o src/assets/img/kato-poses.webp
magick identify /tmp/kato-strip.png
```

Expected: `570x200`, and the `.webp` around 24 KB. Open `/tmp/kato-strip.png` and confirm three macaws stand on a common baseline with no stray wingtips from neighbouring poses.

- [ ] **Step 4: Write the component**

Create `src/components/KatoPerch.tsx`:

```tsx
import './KatoPerch.css'

/**
 * Kato, the Talk-Active macaw, perched on top of his project's paddock.
 *
 * He renders inside the containment `<li>` but sits in the airspace above it,
 * outside the unit's box, because that is the joke: on an island of
 * enclosures, the one asset not in containment is the mascot.
 *
 * Purely decorative. The paddock beneath him is the interactive element and
 * already carries its own accessible name, so he is hidden from assistive
 * technology and cannot receive pointer events.
 */
export default function KatoPerch() {
  return (
    <span className="kato" aria-hidden="true">
      <span className="kato__bird" />
    </span>
  )
}
```

- [ ] **Step 5: Write the styles**

Create `src/components/KatoPerch.css`. The hop distance needs no measurement: `.kato` is the full width of the paddock, so `-100%` minus one grid gap lands exactly on the neighbouring lintel.

```css
/*
 * Three poses in one strip: idle, wings-spread, wings-up.
 * background-size: 300% 100% makes each pose one third of the box, so
 * background-position-x steps 0% / 50% / 100% select pose 1 / 2 / 3.
 */
/*
 * Two elements, and the split between them is load-bearing.
 *
 * Two animations on one element cannot animate the same property — the one
 * declared last silently wins. So the hop lives on the wrapper (translate)
 * while arrival (transform) and breathing (translate) live on the bird.
 * Different elements compose; the same element would collide.
 *
 * The wrapper is also exactly one paddock wide, which is what makes the hop
 * distance expressible without measuring anything.
 */
.kato {
  position: absolute;
  bottom: 100%;
  left: 0;
  z-index: 9;
  width: 100%;
  height: clamp(2.6rem, 5.2vh, 3.4rem);
  pointer-events: none;
  animation: kato-hop 15s ease-in-out 2600ms infinite;
}

.kato__bird {
  position: absolute;
  bottom: -0.12rem;
  left: 62%;
  width: clamp(2.4rem, 4.6vh, 3.1rem);
  height: 100%;
  background: url('../assets/img/kato-poses.webp') 0% 100% / 300% 100% no-repeat;
  transform-origin: 50% 100%;
  animation:
    kato-arrive 1100ms cubic-bezier(0.22, 1.1, 0.36, 1) both,
    kato-breathe 4s ease-in-out 1100ms infinite;
}

/*
 * Flies in from off-stage right with wings spread (pose 2), then settles into
 * the idle pose (pose 1) as he lands. This is the only rule that animates
 * background-position-x, so nothing competes with it.
 */
@keyframes kato-arrive {
  0%   { opacity: 0; background-position-x: 50%; transform: translate(19rem, -7rem) rotate(-9deg) scale(0.82); }
  55%  { opacity: 1; background-position-x: 50%; transform: translate(4.5rem, -2.6rem) rotate(-5deg) scale(0.94); }
  85%  { background-position-x: 50%; transform: translate(0, -0.5rem) rotate(0deg) scale(1); }
  86%  { background-position-x: 0%; }
  100% { opacity: 1; background-position-x: 0%; transform: none; }
}

@keyframes kato-breathe {
  0%, 100% { translate: 0 0; }
  50%      { translate: 0 -0.16rem; }
}

/*
 * Hop to the neighbouring lintel and back. The wrapper is exactly one paddock
 * wide, so -100% minus one column gap lands precisely on paddock 02. The arc
 * in the middle of each leg is what reads as a hop rather than a slide.
 */
@keyframes kato-hop {
  0%, 12%   { translate: 0 0; }
  20%       { translate: calc(-50% - clamp(0.45rem, 1vw, 0.7rem)) -1.5rem; }
  26%, 62%  { translate: calc(-100% - clamp(0.9rem, 2vw, 1.4rem)) 0; }
  70%       { translate: calc(-50% - clamp(0.45rem, 1vw, 0.7rem)) -1.5rem; }
  76%, 100% { translate: 0 0; }
}

/*
 * Hovering or focusing the paddock puts him in the wings-up pose (pose 3).
 * `!important` is deliberate and is the correct tool here: an important
 * declaration outranks an animation in the cascade, which is exactly the
 * override needed to beat kato-arrive's filled final value.
 */
.park__containment-unit:hover ~ .kato .kato__bird,
.park__containment-unit:focus-visible ~ .kato .kato__bird {
  background-position-x: 100% !important;
}

/* He vanishes with the rest of the interface while a dossier is open. */
.park.is-inspecting .kato { opacity: 0; visibility: hidden; }

@media (max-width: 760px) {
  .kato { height: 2.5rem; animation: none; }
  .kato__bird { left: 66%; width: 2.3rem; }
}

/*
 * Reduced motion: perched and still. No flight, no hop, no bob — matching how
 * this scene already suppresses the containment-deploy animation.
 */
@media (prefers-reduced-motion: reduce) {
  .kato { animation: none; }
  .kato__bird { animation: none; background-position-x: 0%; }
}
```

- [ ] **Step 6: Run the component test to verify it passes**

Run: `pnpm test -- src/components/KatoPerch.test.tsx`
Expected: PASS.

- [ ] **Step 7: Write the failing integration test**

Kato must appear on exactly one paddock — Talk-Active's — and must not swallow its click. Append to `src/components/scenes/ParkScene.test.tsx`:

```tsx
describe('Kato', () => {
  it('perches on the Talk-Active paddock and no other', () => {
    const { container } = render(<ParkScene />)

    const perches = container.querySelectorAll('.kato')
    expect(perches).toHaveLength(1)

    const host = perches[0]!.closest('.park__containment')
    expect(within(host as HTMLElement).getByText('Talk-Active')).toBeInTheDocument()
  })

  it('stays out of the accessibility tree', () => {
    const { container } = render(<ParkScene />)

    expect(container.querySelector('.kato')).toHaveAttribute('aria-hidden', 'true')
  })
})
```

- [ ] **Step 8: Run it to verify it fails**

Run: `pnpm test -- src/components/scenes/ParkScene.test.tsx`
Expected: FAIL — `expected length 0 to be 1`, because nothing renders Kato yet.

- [ ] **Step 9: Mount Kato on the Talk-Active paddock**

In `src/components/scenes/ParkScene.tsx`, add the import beside the others:

```tsx
import KatoPerch from '../KatoPerch'
```

Inside the `featuredProjects.map` callback, render him as a **sibling after** the `</button>`, still inside the `<li>`. Sibling order matters: the hover rule in `KatoPerch.css` uses the general sibling combinator `~`, which only matches elements after the button.

```tsx
              </button>
              {project.title === 'Talk-Active' && <KatoPerch />}
            </li>
```

- [ ] **Step 10: Run the tests to verify they pass**

Run: `pnpm test -- src/components/scenes/ParkScene.test.tsx src/components/KatoPerch.test.tsx`
Expected: PASS.

- [ ] **Step 11: Verify in a browser**

```bash
pnpm dev
```

Confirm, on the projects scene:
- Kato flies in from the right and lands on the Talk-Active lintel.
- He never overlaps the header plaque at 1440, 1024, 800×720 or 390 wide.
- Hovering the Talk-Active paddock switches him to wings-up.
- Clicking the paddock opens its dossier, and Kato hides while it is open.
- `document.elementFromPoint` at Kato's centre returns something **other** than
  `.kato` — the grid, in practice. That is the real assertion: he must not be an
  invisible click target hanging in the air.

  Note there is nothing beneath him to "click through" to. He sits at
  `bottom: 100%`, above the paddock and outside its box, so his airspace is not
  over the button. Expecting a click on Kato to open the dossier would be
  expecting the wrong geometry.
- With OS "reduce motion" enabled he is perched and still.

- [ ] **Step 12: Commit**

```bash
git add src/components/KatoPerch.tsx src/components/KatoPerch.css \
        src/components/KatoPerch.test.tsx src/assets/img/kato-poses.webp \
        src/components/scenes/ParkScene.tsx src/components/scenes/ParkScene.test.tsx
git commit -m "feat: perch Kato outside the Talk-Active paddock

The mascot belongs to a project but is not one, so he is rendered inside
the containment list item and positioned into the airspace above it —
outside the unit's box. On an island of enclosures the only asset not in
containment is the parrot, which is the better joke and also the honest
arrangement.

The mascot's source art is four ~1MB SVGs that are really base64 PNGs.
Three poses are cut from the pose sheet into one 24KB WebP strip
instead, re-canvassed bottom-aligned so he does not sink when the pose
changes.

He is aria-hidden and pointer-events: none: the paddock underneath is
the interactive element and already carries its accessible name."
```

---

### Task 4: Award schema, data, and the referential check

**Files:**
- Modify: `src/data/schema.ts`
- Create: `src/data/awards.ts`
- Modify: `src/data/index.ts`
- Test: `src/data/schema.test.ts`, `src/data/index.test.ts`

**Interfaces:**
- Consumes: the project titled `'Talk-Active'` from Task 1.
- Produces:
  - `export const awardSchema` and `export type Award = z.infer<typeof awardSchema>` in `schema.ts`
  - `export const awardsSchema = z.array(awardSchema)` in `schema.ts`
  - `export const awardsData: Award[]` in `awards.ts`
  - `export const awards` in `index.ts`, validated and referentially checked
  - `Award` re-exported from `index.ts`

  Task 5 imports `awards` and the `Award` type from `../../data`.

- [ ] **Step 1: Write the failing schema test**

Append to `src/data/schema.test.ts`. Place `validAward` beside the existing `validProject` / `validEntry` fixtures:

```ts
const validAward = {
  title: 'Mock Award',
  event: 'Mock Competition 2025',
  host: 'Test University',
  date: '1 January 2025',
  team: 'Team Mock',
  members: ['Mock Person'],
  projectTitle: 'Mock Project',
  story: 'A mock award used for testing.',
  highlights: ['won a mock thing'],
  logo: 'github',
}

describe('awardSchema', () => {
  it('accepts a valid award', () => {
    expect(awardSchema.safeParse(validAward).success).toBe(true)
  })

  it('accepts an award not tied to any project', () => {
    expect(awardSchema.safeParse({ ...validAward, projectTitle: null }).success).toBe(true)
  })

  it('rejects an award with no members', () => {
    expect(awardSchema.safeParse({ ...validAward, members: [] }).success).toBe(false)
  })

  it('rejects an award with no highlights', () => {
    expect(awardSchema.safeParse({ ...validAward, highlights: [] }).success).toBe(false)
  })

  it('rejects an award with an empty title', () => {
    expect(awardSchema.safeParse({ ...validAward, title: '' }).success).toBe(false)
  })
})
```

Add `awardSchema` to the existing import block at the top of the file.

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test -- src/data/schema.test.ts`
Expected: FAIL — `awardSchema` is not exported from `./schema`.

- [ ] **Step 3: Add the schema**

Append to `src/data/schema.ts`, after the Card section:

```ts
// ---------------------------------------------------------------------------
// Awards
// ---------------------------------------------------------------------------

/**
 * A competition result.
 *
 * Awards are held apart from projects on purpose. A project's copy describes
 * the product; anything it went on to win is recorded here and points back at
 * it by title. The reference runs one way only, so a reader who wants to know
 * what a product does never has to read around a placing to find out.
 */
export const awardSchema = z.object({
  title: z.string().min(1),
  event: z.string().min(1),
  host: z.string().min(1),
  date: z.string().min(1),
  team: z.string().min(1),
  members: z.array(z.string().min(1)).min(1),
  /**
   * Title of the project this was won with, matching a `projectSchema` title
   * exactly. `null` for an award that belongs to no project on the site.
   * The match itself is enforced in ./index.ts — Zod validates each collection
   * in isolation and cannot see across them.
   */
  projectTitle: z.string().min(1).nullable(),
  story: z.string().min(1),
  highlights: z.array(z.string().min(1)).min(1),
  /** asset key resolved via getIcon(). */
  logo: z.string().min(1),
})
export type Award = z.infer<typeof awardSchema>

export const awardsSchema = z.array(awardSchema)
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm test -- src/data/schema.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the failing referential test**

Append to `src/data/index.test.ts`:

```ts
describe('awards', () => {
  it('exposes awards that are all schema-valid', () => {
    expect(awards.length).toBeGreaterThan(0)
    for (const award of awards) {
      expect(awardSchema.safeParse(award).success).toBe(true)
    }
  })

  it('points every award at a project that exists', () => {
    const titles = new Set(projects.map((project) => project.title))
    for (const award of awards) {
      if (award.projectTitle === null) continue
      expect(titles).toContain(award.projectTitle)
    }
  })

  it('rejects an award pointing at a project that does not exist', () => {
    // Zod validates each collection alone, so a dangling cross-reference is
    // only catchable here. Without this check, renaming a project would ship a
    // broken link rather than failing the build.
    expect(() =>
      assertAwardProjectsExist(
        [{ ...awards[0]!, projectTitle: 'No Such Project' }],
        projects,
      ),
    ).toThrow(/No Such Project/)
  })
})
```

Extend the file's existing import lines to:

```ts
import { projects, experiences, techStack, skills, awards, parseOrThrow, assertAwardProjectsExist } from './index'
import { projectSchema, experienceEntrySchema, awardSchema } from './schema'
```

- [ ] **Step 6: Run it to verify it fails**

Run: `pnpm test -- src/data/index.test.ts`
Expected: FAIL — `awards` and `assertAwardProjectsExist` are not exported from `./index`.

- [ ] **Step 7: Write the awards data**

Create `src/data/awards.ts`. This file is where the competition, the team and the placing live — the things deliberately kept out of `projects.ts`.

```ts
import type { Award } from './schema'

/**
 * Awards. Edit THIS file to add a result.
 * Validated at load time against awardsSchema (see ./index.ts), including a
 * check that every `projectTitle` names a real project.
 *
 * This is the only place competition results belong. A project's own entry
 * describes the product and nothing else; an award reaches across to it.
 */
export const awardsData: Award[] = [
  {
    title: 'Best Presentation',
    event: 'RISTEK Hackathon 2026',
    host: 'Fakultas Ilmu Komputer, Universitas Indonesia',
    date: '14 August 2026',
    team: 'Team FAM',
    members: [
      'Sultan Ibnu Mansiz',
      'Farrel Athalla Muljawan',
      'Erdafa Andikri',
      'Ivan Jehuda Angi',
      'Abhiseka Susanto',
    ],
    projectTitle: 'Talk-Active',
    story:
      'Team FAM built Talk-Active over the course of the competition and presented it at the finals. The award was for the pitch itself, judged on the same kind of rubric the product exists to rehearse: a tool for defending claims under questioning, defended under questioning.',
    highlights: [
      'Best Presentation at the RISTEK Hackathon 2026 finals, Fasilkom UI',
      'A five-person team; a 6:35 pitch with a 2:15 live demo driven from a separate operator machine',
      'Judged against a published finals rubric covering problem, solution, innovation, technical depth, design and Q&A',
      'Demonstrated live on production, including the degraded offline path',
    ],
    logo: 'ristek',
  },
]
```

- [ ] **Step 8: Validate and cross-check at load**

In `src/data/index.ts`, add to the imports:

```ts
import { projectsSchema, experiencesSchema, techStackSchema, skillsSchema, awardsSchema } from './schema'
import { awardsData } from './awards'
import type { Award, Project } from './schema'
```

Add `Award` to the existing `export type { ... }` block.

Then, after the existing `export const skills = ...` line, add:

```ts
/**
 * Zod validates each collection in isolation, so it cannot know whether an
 * award names a project that exists. Renaming a project without updating its
 * award would otherwise ship a dangling reference; this turns that into a
 * build failure. Exported so it can be tested against inputs other than the
 * real data.
 */
export function assertAwardProjectsExist(
  awardList: readonly Award[],
  projectList: readonly Project[],
): void {
  const titles = new Set(projectList.map((project) => project.title))
  for (const award of awardList) {
    if (award.projectTitle !== null && !titles.has(award.projectTitle)) {
      throw new Error(
        `Award "${award.title}" references unknown project "${award.projectTitle}".`,
      )
    }
  }
}

export const awards = parseOrThrow('awards', awardsSchema.safeParse(awardsData))
assertAwardProjectsExist(awards, projects)
```

- [ ] **Step 9: Run the tests to verify they pass**

Run: `pnpm test -- src/data`
Expected: PASS.

- [ ] **Step 10: Verify data and types**

Run: `pnpm validate-data && pnpm typecheck`
Expected: both exit 0.

- [ ] **Step 11: Commit**

```bash
git add src/data/schema.ts src/data/awards.ts src/data/index.ts \
        src/data/schema.test.ts src/data/index.test.ts
git commit -m "feat: add award content with a checked project reference

Competition results now have somewhere to live that is not a project's
own description. An award names the project it was won with; the project
says nothing about the award. Keeping the reference one-directional is
what lets the product copy stay product copy.

Zod validates each collection alone and cannot see across them, so the
cross-reference gets an explicit assertion at load. Rename a project
without updating its award and the build fails instead of shipping a
link to nothing."
```

---

### Task 5: The Visitor Center scene

**Files:**
- Create: `src/components/scenes/VisitorCenterScene.tsx`
- Create: `src/components/scenes/VisitorCenterScene.css`
- Create: `src/components/scenes/VisitorCenterScene.test.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `awards` and the `Award` type from `../../data`; `getIcon` from `../../assets/index.js`.
- Produces: `export default function VisitorCenterScene()`, rendering a `<section aria-labelledby="awards-heading">` containing an `<h2 id="awards-heading">` with the accessible name `Awards`.

- [ ] **Step 1: Write the failing test**

Create `src/components/scenes/VisitorCenterScene.test.tsx`:

```tsx
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import VisitorCenterScene from './VisitorCenterScene'
import { awards } from '../../data'

afterEach(cleanup)

describe('VisitorCenterScene', () => {
  it('titles the scene as the awards section', () => {
    render(<VisitorCenterScene />)

    expect(screen.getByRole('heading', { level: 2, name: 'Awards' })).toBeInTheDocument()
  })

  it('shows one case per award, with the competition it was won at', () => {
    const { container } = render(<VisitorCenterScene />)

    expect(container.querySelectorAll('.rotunda__case')).toHaveLength(awards.length)
    expect(screen.getByText('Best Presentation')).toBeInTheDocument()
    expect(screen.getByText('RISTEK Hackathon 2026', { exact: false })).toBeInTheDocument()
  })

  it('names the team and every member', () => {
    render(<VisitorCenterScene />)

    expect(screen.getByText('Team FAM', { exact: false })).toBeInTheDocument()
    for (const member of awards[0]!.members) {
      expect(screen.getByText(member, { exact: false })).toBeInTheDocument()
    }
  })

  it('references the project it was won with, linked and safely targeted', () => {
    const { container } = render(<VisitorCenterScene />)

    const link = within(container.querySelector('.rotunda__case') as HTMLElement)
      .getByRole('link', { name: /Talk-Active/ })
    expect(link).toHaveAttribute('href', 'https://talk-active-id.vercel.app')
    expect(link).toHaveAttribute('rel', 'noreferrer noopener')
    expect(link).toHaveAttribute('target', '_blank')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test -- src/components/scenes/VisitorCenterScene.test.tsx`
Expected: FAIL — `Failed to resolve import "./VisitorCenterScene"`.

- [ ] **Step 3: Write the component**

Create `src/components/scenes/VisitorCenterScene.tsx`. The project link is looked up from `projects` rather than duplicated into the award, so a changed URL only has to change once.

```tsx
import { awards, projects } from '../../data'
import { getIcon } from '../../assets/index.js'
import './VisitorCenterScene.css'

/**
 * Past the gate, past the paddocks, into the Visitor Center.
 *
 * Awards get their own scene rather than a ribbon on a paddock. A result is a
 * different kind of fact from a product description, and the site's idiom is
 * that a different kind of content gets its own set piece.
 *
 * The banner is the rotunda's, re-lettered. Beneath it, one case per award,
 * built so a second and third need no redesign.
 */
export default function VisitorCenterScene() {
  return (
    <section className="rotunda" aria-labelledby="awards-heading">
      <div className="rotunda__hall" aria-hidden="true">
        <span className="rotunda__rib rotunda__rib--left" />
        <span className="rotunda__rib rotunda__rib--right" />
        <span className="rotunda__skeleton" />
      </div>

      <header className="rotunda__header">
        <p className="rotunda__kicker">Isla Nublar · Visitor Center</p>
        <h2 id="awards-heading" className="rotunda__heading">Awards</h2>
      </header>

      <p className="rotunda__banner">
        <span>When Dinosaurs Ruled The Hackathon</span>
      </p>

      <ul className="rotunda__cases" aria-label="Awards">
        {awards.map((award) => {
          const project = projects.find((candidate) => candidate.title === award.projectTitle)

          return (
            <li key={`${award.event}-${award.title}`} className="rotunda__case">
              <div className="rotunda__plate">
                <img className="rotunda__logo" src={getIcon(award.logo)} alt="" loading="lazy" />
                <p className="rotunda__event">{award.event}</p>
                <h3 className="rotunda__award">{award.title}</h3>
                <p className="rotunda__host">{award.host}</p>
                <p className="rotunda__date">Finals · {award.date}</p>
              </div>

              <div className="rotunda__label">
                <p className="rotunda__story">{award.story}</p>

                <p className="rotunda__section-label">Field record</p>
                <ul className="rotunda__highlights">
                  {award.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                </ul>

                <p className="rotunda__section-label">Specimen on file</p>
                {project ? (
                  <p className="rotunda__project">
                    <a
                      className="rotunda__link"
                      href={project.liveLink}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {project.title}
                    </a>
                    <span className="rotunda__project-context"> · {project.context}</span>
                  </p>
                ) : null}

                <p className="rotunda__team">
                  <strong>{award.team}</strong>
                  <span> — {award.members.join(', ')}</span>
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
```

- [ ] **Step 4: Write the styles**

Create `src/components/scenes/VisitorCenterScene.css`:

```css
/*
 * The Visitor Center rotunda at night: two ribs of scaffolding, the mounted
 * skeleton between them, and the banner across the hall. Awards hang beneath
 * it as lit specimen cases.
 */
.rotunda {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(0.6rem, 1.6vh, 1.1rem);
  padding: clamp(1rem, 2.4vw, 2rem) clamp(0.7rem, 2.6vw, 2rem);
  overflow: hidden;
  color: #f3e6c9;
  background:
    radial-gradient(ellipse 60% 45% at 50% 32%, rgba(126, 154, 143, 0.12), transparent 70%),
    linear-gradient(to bottom, #0a1512 0%, #060f0d 55%, #030807 100%);
}

.rotunda__hall { position: absolute; inset: 0; pointer-events: none; }

.rotunda__rib {
  position: absolute;
  top: 4%;
  width: clamp(2.2rem, 6vw, 4.4rem);
  height: 78%;
  opacity: 0.5;
  background: repeating-linear-gradient(
    to bottom, rgba(120, 96, 58, 0.5) 0 0.5rem, transparent 0.5rem 2.4rem);
  filter: blur(0.4px);
}

.rotunda__rib--left { left: 5%; transform: skewX(5deg); }
.rotunda__rib--right { right: 5%; transform: skewX(-5deg); }

.rotunda__skeleton {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: min(46rem, 82%);
  height: 62%;
  opacity: 0.15;
  background:
    radial-gradient(ellipse 20% 42% at 50% 88%, rgba(226, 214, 182, 0.5), transparent 68%),
    radial-gradient(ellipse 44% 12% at 50% 40%, rgba(226, 214, 182, 0.35), transparent 72%);
  transform: translateX(-50%);
}

.rotunda__header, .rotunda__banner, .rotunda__cases { position: relative; z-index: 2; }

.rotunda__kicker, .rotunda__section-label, .rotunda__event {
  margin: 0;
  font-family: var(--font-tech);
  font-size: clamp(0.42rem, 0.78vw, 0.55rem);
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: rgba(231, 219, 174, 0.76);
}

.rotunda__heading {
  margin: 0.1em 0 0;
  font-family: var(--font-tech);
  font-size: clamp(1.5rem, 4.4vw, 2.8rem);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.rotunda__header { text-align: center; }

/* The banner drops from its rigging once the hall is in view. */
.rotunda__banner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(100%, 46rem);
  margin: 0;
  padding: 0.7rem 1.4rem;
  font-family: var(--font-tech);
  font-size: clamp(0.72rem, 2vw, 1.15rem);
  letter-spacing: 0.16em;
  text-align: center;
  text-transform: uppercase;
  color: #22150a;
  background: linear-gradient(170deg, #e8dcb4, #cdbd8c 60%, #b6a578);
  box-shadow: 0 0.5rem 1.4rem rgba(0, 0, 0, 0.5), inset 0 -2px rgba(97, 82, 48, 0.4);
  clip-path: polygon(0 0, 100% 0, 100% 86%, 50% 100%, 0 86%);
  transform-origin: 50% 0;
  animation: rotunda-unfurl 900ms cubic-bezier(0.2, 1.1, 0.35, 1) both;
}

@keyframes rotunda-unfurl {
  from { opacity: 0; transform: scaleY(0.04) rotate(-1.5deg); }
  to   { opacity: 1; transform: none; }
}

.rotunda__cases {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 21rem), 1fr));
  gap: clamp(0.7rem, 1.8vw, 1.2rem);
  width: min(100%, 62rem);
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-y: auto;
}

.rotunda__case {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 0.55rem;
  padding: clamp(0.7rem, 1.6vw, 1.05rem);
  border: 1px solid rgba(226, 205, 143, 0.28);
  border-radius: 0.2rem;
  background: linear-gradient(165deg, rgba(30, 44, 38, 0.82), rgba(9, 18, 15, 0.9));
  box-shadow: 0 0.6rem 1.6rem rgba(0, 0, 0, 0.46), inset 0 1px rgba(255, 232, 176, 0.14);
}

.rotunda__plate { display: grid; gap: 0.16rem; }
.rotunda__logo { width: 1.5rem; height: 1.5rem; margin-bottom: 0.2rem; object-fit: contain; }

.rotunda__award {
  margin: 0;
  font-family: var(--font-tech);
  font-size: clamp(1rem, 2.4vw, 1.5rem);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.rotunda__host, .rotunda__date, .rotunda__story,
.rotunda__team, .rotunda__project, .rotunda__highlights {
  margin: 0;
  font-size: clamp(0.66rem, 1.15vw, 0.78rem);
  line-height: 1.5;
  color: rgba(238, 228, 200, 0.82);
}

.rotunda__label { display: grid; gap: 0.4rem; align-content: start; }
.rotunda__highlights { padding-left: 1rem; }
.rotunda__highlights li { margin-bottom: 0.18rem; }
.rotunda__team { color: rgba(238, 228, 200, 0.62); }

.rotunda__link { color: #f0b51f; text-underline-offset: 0.18em; }
.rotunda__link:hover, .rotunda__link:focus-visible { color: #ffd465; }

@media (max-width: 760px) {
  .rotunda { justify-content: flex-start; padding-top: max(2.6rem, env(safe-area-inset-top)); overflow-y: auto; }
  .rotunda__cases { overflow: visible; }
}

@media (prefers-reduced-motion: reduce) {
  .rotunda__banner { animation: none; }
}
```

- [ ] **Step 5: Run the scene test to verify it passes**

Run: `pnpm test -- src/components/scenes/VisitorCenterScene.test.tsx`
Expected: PASS.

- [ ] **Step 6: Add the scene to the sequence**

In `src/App.tsx`, add the lazy import beside the existing three:

```tsx
const VisitorCenterScene = lazy(() => import('./components/scenes/VisitorCenterScene'))
```

And add the fifth scene inside `<main>`, after the projects scene:

```tsx
      <DeferredScene name="projects"><GateScene /></DeferredScene>
      <DeferredScene name="awards"><VisitorCenterScene /></DeferredScene>
```

- [ ] **Step 7: Verify the app test still passes**

Run: `pnpm test -- src/App.test.tsx`
Expected: PASS. That test triggers every `[data-deferred-scene]` placeholder generically, so a fifth scene needs no change to it.

- [ ] **Step 8: Verify in a browser**

```bash
pnpm dev
```

Scroll past the projects scene and confirm the banner unfurls, the case is legible, the Talk-Active link opens the live app in a new tab, and the layout holds at 1440, 1024, 800×720 and 390 wide. Confirm the banner is already unfurled with OS "reduce motion" enabled.

- [ ] **Step 9: Commit**

```bash
git add src/components/scenes/VisitorCenterScene.tsx \
        src/components/scenes/VisitorCenterScene.css \
        src/components/scenes/VisitorCenterScene.test.tsx src/App.tsx
git commit -m "feat: add the Visitor Center awards scene

The projects stage is a single non-scrolling viewport that just absorbed
a fifth paddock; there was no room left in it for a second kind of
content. Awards get their own set piece instead, which is also how every
other kind of content on this site is handled.

It continues the same film rather than introducing another one: past the
gate, past the paddocks, into the rotunda. Each case reaches across to
the project it was won with and pulls that project's live URL from the
project data, so the link has one definition."
```

---

### Task 6: Full verification

**Files:** none modified unless a check fails.

**Interfaces:**
- Consumes: everything from Tasks 1–5.
- Produces: a branch ready to merge.

- [ ] **Step 1: Run every gate**

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm validate-data && pnpm build
```

Expected: all five exit 0. Do not proceed past a failure — fix it, then re-run the whole sequence.

- [ ] **Step 2: Confirm coverage did not regress**

Run: `pnpm test:cov`
Expected: the new files appear in the report. `KatoPerch.tsx`, `VisitorCenterScene.tsx`, `awards.ts` and the new `index.ts` export should all be covered by the tests written above.

- [ ] **Step 3: Check the built bundle**

```bash
pnpm build
ls -la dist/assets/*.webp | grep -i "kato\|talkactive"
```

Expected: both new images are emitted. Confirm `kato-poses` is roughly 24 KB and the Talk-Active still is under 200 KB — this site publishes PageSpeed scores in its README, and a heavy asset here is a regression.

- [ ] **Step 4: Final manual pass**

```bash
pnpm dev
```

Walk the whole scroll from the card to the Visitor Center once at 1440 wide and once at 390 wide. Confirm:
- five paddocks, three over two
- Kato perched outside the Talk-Active unit, not intercepting its click
- the Talk-Active dossier opens and its copy mentions no competition
- the Visitor Center names the hackathon, the team and the award, and links back to Talk-Active

- [ ] **Step 5: Push**

```bash
git push -u origin feat/talk-active-awards-kato
```

---

## Notes for the implementer

**Deferred deliberately.** The spec's pose table lists four poses including a
microphone, which would be the ideal hover reaction for a public-speaking app.
It is not in this plan. In the source pose sheet that pose's artwork overlaps
the thumbs-up pose beside it, and the overlapping wingtip is topologically
connected to the bird, so no crop or connected-component pass separates them.
Adding it needs manual masking in a vector editor. Three poses cover every
behaviour the design calls for; the mic pose can be added later by extending
the strip and changing `background-size` from `300%` to `400%`.

**When the walkthrough video arrives.** Task 1 ships a still because the
recording does not exist yet. Once it is captured with Cap, encode a short
muted loop and a full clip into `public/`, then change the single
`talkactive_project` entry in `projectMedia.ts` to:

```ts
  talkactive_project: {
    kind: 'video',
    src: '/talk-active-walkthrough.mp4',
    previewSrc: '/talk-active-preview.mp4',
    poster: talkactiveProjectLandscape,
    label: 'Talk-Active complete product walkthrough',
  },
```

Nothing else changes — not the project schema, not `ParkScene`, not a test.
