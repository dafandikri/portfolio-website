# Talk-Active, Kato, and the Visitor Center — design

Date: 2026-08-18
Status: awaiting approval

## Problem

Three related gaps in the site as it stands.

1. Talk-Active is not on the site. It is a shipped, live product and the most
   recent featured work, but the Park scene shows four projects and none of
   them is it.
2. The site has no awards surface. Team FAM won Best Presentation at the
   RISTEK Hackathon 2026 finals with Talk-Active, and nothing records it.
3. Talk-Active has a mascot, Kato, that has no home here.

The constraint that shapes the whole design: **a project's own copy describes
the product and nothing else.** Competition results, team, and placement belong
to the awards surface, which references the project rather than the reverse. A
reader who cares only about what Talk-Active does should never have to read
around a hackathon result to find out.

## Current state

`App.tsx` renders four scenes in sequence, each a film set piece carrying real
content, each lazily loaded and gated on `useInView` so its JavaScript is not
requested until the visitor is within one viewport:

| Scene | Reference | Content |
|-------|-----------|---------|
| `CardScene` | American Psycho | identity |
| `DepartureScene` | — | transition |
| `TimeCircuitsScene` | Back to the Future | experience |
| `GateScene` → `ParkScene` | Jurassic Park | projects |

`ParkScene` is a fixed-height stage: `.park` is `position: absolute; inset: 0`,
holding a header plaque, a 2×2 grid of four featured containment paddocks at
`aspect-ratio: 1.48`, and an archive `<details>` strip. Below `760px` the grid
collapses to one column and the stage becomes `overflow-y: auto`.

Content lives in `src/data/`, validated by Zod at module load. `index.ts` calls
`parseOrThrow` per collection, so malformed content fails the build rather than
rendering broken. Media is deliberately held apart from copy in
`projectMedia.ts` so a still can become a video without touching the project
schema.

## Design

### 1. Talk-Active as a project

A new entry in `src/data/projects.ts`, `featured: true`, third in order so it
takes paddock 03 in the top row.

```
title:      'Talk-Active'
year:       '2026'
featured:   true
context:    'Team product · Live'
image:      'talkactive_project'
techStack:  ['nextjs', 'typescript', 'react', 'postgresql', 'playwright']
liveLink:   'https://talk-active-id.vercel.app'
liveLabel:  'Open live app'
repoLink:   'https://github.com/dafandikri/talk-active'
```

Every `techStack` key above already resolves through `getIcon()` in
`src/assets/index.js`. Tailwind is deliberately absent: Talk-Active ships
hand-written `tokens.css` and `styles.css`, and claiming Tailwind would be
inaccurate.

`context` reads `Team product · Live` and stops there. It does not say
"hackathon", which is the whole point of the separation.

**description**

> A rehearsal workspace for students preparing a rubric-graded pitch,
> scholarship interview, thesis defence or competition Q&A. Rather than scoring
> delivery, it maps a spoken attempt against the evaluator's actual rubric,
> refuses any verdict it cannot support with a quote from the transcript, and
> turns the weakest claim into the next question the student has to answer.

**features**

1. Semantic analysis through the Vercel AI Gateway, with every model-proposed
   verdict rejected server-side unless its supporting quote is found verbatim
   in the transcript
2. Visible degradation — a timeout, malformed response or exhausted budget
   falls back to deterministic cue matching, and the interface names which
   engine produced each verdict
3. Rubric → attempt → evidence → grounded judge question → saved session loop,
   persisted so projects, drafts and history survive a reload
4. Optional camera-and-microphone replay behind explicit opt-in plus browser
   dictation; guest workspace data never leaves `localStorage`

`projectMedia.ts` gains one `SHORT_TITLES` entry: `'Talk-Active': 'Talk-Active'`.

#### Media

Talk-Active is the only featured project without a walkthrough video; the
author will record one later using Cap. Until then the paddock shows a single
still through the `kind: 'image'` branch that `projectMedia.ts` and
`ProjectMediaView` already support, which needs no new code.

A crossfading multi-frame media type was considered and rejected. It would be
new abstraction with one caller and a known expiry date — deleted as soon as
the recording lands. When the video exists the entry changes to `kind: 'video'`
with a preview and full source, matching the other four paddocks, and nothing
else in the codebase moves. This is exactly the swap `projectMedia.ts`'s own
comment promises.

### 2. Paddock grid: 3-over-2

Five featured projects do not fit a grid built for four. The paddocks move to a
top row of three and a centred bottom row of two. This is CSS only, in
`ParkScene.css`; no component changes, because paddock serial numbers are
derived from array index and renumber to 01–05 on their own.

```css
.park__grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
.park__containment              { grid-column: span 2; }
.park__containment:nth-child(4) { grid-column: 2 / span 2; }
.park__containment:nth-child(5) { grid-column: 4 / span 2; }
```

Six tracks with each paddock spanning two is what allows the bottom row to sit
half a column in from each edge without a wrapper element.

Grid width goes from `min(100%, 58rem)` to `min(100%, 64rem)` so three across
does not over-shrink the paddocks. The `max-height: 720px and min-width: 761px`
query currently narrows the grid to `52rem`; that value is relaxed so three
columns stay legible on short laptop displays.

The `max-width: 760px` path needs no change at all — it is already a single
column with a scrolling stage, so five paddocks stack and scroll for free.

### 3. Kato

Kato is Talk-Active's mascot, a blue-and-gold macaw. He belongs on this scene
because macaws are Isla Nublar fauna, and he sits *outside* the containment
because that is the joke: on an island of enclosures, the one asset that got
out is the mascot of the project about speaking freely.

A new `src/components/KatoPerch.tsx` and `KatoPerch.css`, rendered inside the
Talk-Active `<li class="park__containment">` but positioned `bottom: 100%` so
he occupies the airspace above the lintel, outside the container's box.

#### Asset

The four mascot SVGs in the Talk-Active repo are roughly 1 MB each: they are
base64-encoded PNGs inside an SVG wrapper, not vector art. Shipping them would
undo the PageSpeed results the README documents.

Instead, three poses are cropped from `kato-macaw-pose-sheet.svg` into a single
570×200 WebP sprite strip of about 24 KB, stepped with `background-position`.
Each pose is re-canvassed bottom-aligned, because the poses do not share a
baseline in the source sheet and Kato would otherwise appear to sink when his
pose changes.

| Pose | Purpose |
|------|---------|
| idle | perched default |
| wings-spread | flight in |
| wings-up | hover on the Talk-Active paddock |

A fourth pose was intended — the microphone, which would be the ideal hover
reaction for a public-speaking app. It is not included. In the source sheet
that pose's artwork overlaps the thumbs-up pose beside it, and the overlapping
wingtip is topologically connected to the bird, so neither a tighter crop nor a
connected-component pass separates them; it needs manual masking in a vector
editor. Three poses cover every behaviour below. Adding the mic later means
extending the strip and changing `background-size` from `300%` to `400%`.

#### Motion

- **Entry.** On scene enter he flies in from off-stage right in the
  wings-spread pose, arcs down onto the lintel, and settles to idle. ~1.1s.
- **Idle.** A breathing bob of 2–3px on a 4s cycle, with an occasional
  head-tilt blip so he does not read as a static image.
- **Hop.** Roughly every 15s he hops to the neighbouring paddock's lintel and
  back. The distance needs no measurement: his wrapper is 100% of the paddock's
  width, so `translateX(calc(-100% - <grid-gap>))` lands exactly on paddock 02.
  The hop keeps the idle pose and reads as a hop through its vertical arc; the
  motion is carried on the wrapper while arrival and breathing are carried on
  the bird, because two animations on one element cannot animate the same
  property — the last one declared silently wins.
- **Hover.** Hovering the Talk-Active paddock puts him in wings-up, via a
  descendant selector on the existing `:hover`. No JavaScript.

#### Constraints

- `pointer-events: none` — he must never intercept the paddock button, which is
  the entire interactive surface of a containment unit.
- `aria-hidden="true"` — he is decoration. The paddock already carries a full
  accessible name, and a mascot in the accessibility tree would only add noise.
- Under `prefers-reduced-motion: reduce` he is perched and still: no flight, no
  hop, no bob. This matches how `ParkScene.css` already suppresses the
  containment-deploy animation.
- **Airspace.** The grid gains top padding so Kato cannot collide with the
  header plaque at any width. The header is `width: fit-content` and centred,
  so the risk is real at mid-widths where the plaque is wide and the paddocks
  are narrow. This must be verified at 761px, 1024px, 1440px, and at
  `max-height: 720px`.

Kato stays scoped to the Park scene. He is not added to other scenes.

### 4. Awards: the Visitor Center

Awards get their own scene rather than a corner of the Park, for two reasons.
The Park stage is a single non-scrolling viewport already absorbing a fifth
paddock, and the site's own idiom is that a distinct kind of content gets a
distinct set piece.

The scene continues the same film rather than introducing a new one: past the
gate, past the paddocks, into the Visitor Center rotunda. The banner unfurls on
scroll-into-view.

#### Data

A new `awardSchema` in `src/data/schema.ts` and a new `src/data/awards.ts`:

```ts
export const awardSchema = z.object({
  title: z.string().min(1),
  event: z.string().min(1),
  host: z.string().min(1),
  date: z.string().min(1),
  team: z.string().min(1),
  members: z.array(z.string().min(1)).min(1),
  /** Title of the project this was won with; must match a projects entry. */
  projectTitle: z.string().min(1).nullable(),
  story: z.string().min(1),
  highlights: z.array(z.string().min(1)).min(1),
  logo: z.string().min(1),
})
```

`projectTitle` is the reference that lets the awards surface talk about a
project without the project talking about the award.

`index.ts` gains a referential check beside the existing `parseOrThrow` calls:
a non-null `projectTitle` that matches no entry in `projects` throws at module
load. Zod validates each collection in isolation and cannot catch a broken
cross-reference, so renaming a project without updating its award would
otherwise ship a dangling pointer. With the check it fails the build.

`logo: 'ristek'` already resolves through `getIcon()`; no new asset plumbing.

#### Content

The first and currently only entry:

- **title** — Best Presentation
- **event** — RISTEK Hackathon 2026
- **host** — Fakultas Ilmu Komputer, Universitas Indonesia
- **date** — 14 August 2026
- **team** — Team FAM
- **members** — Sultan Ibnu Mansiz, Farrel Athalla Muljawan, Erdafa Andikri,
  Ivan Jehuda Angi, Abhiseka Susanto
- **projectTitle** — Talk-Active

**story**

> Team FAM built Talk-Active over the course of the competition and presented
> it at the finals. The award was for the pitch itself, judged on the same kind
> of rubric the product exists to rehearse: a tool for defending claims under
> questioning, defended under questioning.

**highlights**

1. Best Presentation at the RISTEK Hackathon 2026 finals, Fasilkom UI
2. A five-person team; a 6:35 pitch with a 2:15 live demo driven from a
   separate operator machine
3. Judged against a published finals rubric covering problem, solution,
   innovation, technical depth, design, and Q&A
4. Demonstrated live on production, including the degraded offline path

#### Scene

`src/components/scenes/VisitorCenterScene.tsx` and `.css`, added to `App.tsx`
as a fifth `DeferredScene` using the same lazy-import and in-view gating as the
existing three. Nothing about the loading strategy is new.

The rotunda at night. The banner unfurls to read
**WHEN DINOSAURS RULED THE HACKATHON**. Below it, one glass specimen case per
award carrying the real facts on a museum label, laid out so a second and third
award drop in without a redesign. Each case names its project and links to the
live product.

Accessibility and motion follow the scene conventions already in the codebase:
a real `<h2>` with an `aria-labelledby` section, list semantics for the cases,
external links carrying `rel="noreferrer noopener"`, and under
`prefers-reduced-motion` the banner renders already unfurled with no fall.

## Testing

The house preference is integration over unit, so most of the weight is on
rendered-scene tests.

| File | Covers |
|------|--------|
| `scenes/ParkScene.test.tsx` | five featured paddocks; serials 01–05; Kato renders and is absent from the accessibility tree; Kato does not intercept the paddock click |
| `scenes/VisitorCenterScene.test.tsx` | heading; one case per award; project reference rendered; link `href`/`rel`/`target` |
| `data/index.test.ts` | the referential check rejects an award whose `projectTitle` matches no project |
| `data/schema.test.ts` | award shape accepted; empty `members` and empty `highlights` rejected |
| `scenes/projectMedia.test.ts` | `talkactive_project` resolves; `SHORT_TITLES` has an entry |

The existing ParkScene assertions already derive their counts from
`projectsData.filter(p => p.featured)`, so a fifth project does not break them.
Only the test's name — "shows four complete containment paddocks" — goes stale
and needs updating.

## Assets to produce

| File | Source | Notes |
|------|--------|-------|
| `src/assets/img/talkactive_project_landscape.webp` | `.lavish/updated-workspace.png` (1440×1407) | crop to 1.48, encode WebP |
| `src/assets/img/kato-poses.webp` | `kato-macaw-pose-sheet.svg` | 4 poses, one strip, target under 40 KB |

Both source files live in the Talk-Active repository at
`~/Documents/Universitas Indonesia/Non-Academics/hackathon-ristek-2026-fam`.

## Out of scope

- Recording the Talk-Active walkthrough video. The author will capture it with
  Cap; the media entry is written so the swap is a one-line change.
- Kato in any scene other than the Park.
- Any change to the four existing featured projects beyond their position in
  the regrid.
- Awards beyond the one won. The schema and layout accommodate more; no
  speculative entries are added.

## Decision to revisit in place

The banner reads WHEN DINOSAURS RULED THE HACKATHON, a pun on the film's
"WHEN DINOSAURS RULED THE EARTH". It is the one element tonally louder than the
rest of the site, which is otherwise dry and precise.

Decided in favour of the pun, on the grounds that the Visitor Center is the
scene where a win is being celebrated and a flat line would undersell it. The
alternative is the straight film line on the banner with the award confined to
the plaque below. This is a single string; if it reads wrong once rendered,
changing it costs nothing. Judge it on the built scene, not on the spec.
