# Design — The Scene Sequence

**Date:** 2026-08-03
**Status:** Phases 1–2 built; Phase 3 approved
**Extends:** [2026-08-01 business card redesign](./2026-08-01-business-card-redesign-design.md)

## Summary

The site becomes a sequence of cult-film set pieces. The American Psycho business
card is scene one and stays exactly as built; scrolling reveals further scenes,
each rendering real portfolio content rather than decoration.

## The organising rule

**A film earns a scene only if its iconography maps onto content we actually
have.** This is what separates a portfolio from a demo reel.

| Film | Iconography | Maps to | Verdict |
|---|---|---|---|
| American Psycho | The business card | Name, contact, affiliation | **Built** |
| Back to the Future | Time-circuit display (DESTINATION / PRESENT / LAST DEPARTED) | `experiences.ts` — 5 roles, 2023→2026, month-labelled | **Built** |
| Jurassic Park | Film gate + paddock warning signs | `projects.ts` (8 projects) | **Built** |
| Bouldering | Coloured holds around a climbing photo | `Boulder Coach` project, personal register | **Build** |
| Fight Club, Titanic, Independence Day, Toy Story, Disney | — | Nothing | **Cut** |

The four cut films have no content behind them. Building them would mean five
scenes of filler, which turns an impressive portfolio into a showreel that tells a
recruiter nothing. They can always be revisited if content appears that fits.

**The existing `src/data/` is kept, not scrapped.** It is precisely what makes a
set piece mean something: without it the time circuits have nothing to display.

## Decomposition

This is several projects. Each phase ships on its own and leaves the site working.

| Phase | Scope | New dependencies |
|---|---|---|
| **1 — built** | Scroll shell + Back to the Future scene | None |
| **2 — built** | Jurassic Park gate + automatic project hand | Three.js, lazy-loaded |
| **3** | Bouldering scene | None, or light 3D |

Phase 1 bundles the shell with the first scene deliberately — a scroll
architecture with nothing to scroll to is not shippable.

Ordering is forced by dependency: the shell must exist before any scene, and the
two no-dependency scenes come before the one that costs 150 KB, so the bundle
stays flat as long as possible.

## Phase 2 — Jurassic Park gate + project paddocks

The transition uses the licensed reference gate model rather than a CSS drawing.
Although the DAE exports as one merged mesh, its central doorway triangles are
partitioned at load time into 272 triangles per door leaf plus the static
stonework. Each leaf is moved onto its real outside hinge and swings inward under
scroll before the camera dollies through. Three.js, the model, and its textures
remain isolated in the lazy gate chunk.

The dinosaur never enters frame. A short off-screen roar is represented by
pressure fronts, dust, and a restrained camera jolt before the doors move. This
keeps the creature implied without asking CSS or an unsuitable full-body asset
to draw a convincing close-up.

The gate uses the complete material set supplied with the licensed model: albedo,
ambient occlusion, normal, roughness, metallic and emissive maps. ACES tone
mapping, a cool directional key with one shadow map, and eight warm local point
lights replace the original flat ambient wash. Each pylon carries three face
torches and one cap brazier; the visible flames flicker independently while their
point lights put real distance falloff across the stone.

Beyond the gate, projects arrive as an accessible hand of miniature dinosaur
containment cells. They are explicitly **not cards**: the button itself paints
no rectangle, and each object is assembled from a thick overhead lintel, two
concrete/steel pylons, a recessed chamber, seven vertical prison bars, welded
cross rails, a protruding lock box, keypad, and heavy lower footing. Project
media lives deep inside the chamber rather than being printed onto a surface.

The hand mounts on the same scroll frame that the camera finishes its dolly,
then plays out on its own CSS clock—no additional wheel movement is required.
Balatro supplies only the overlap, fan angles, staggered fade/deal, overshoot and
selection pop; Jurassic Park supplies the object and interface language. The
control-room heading fades in first, each cell rises from the gate darkness and
pops beyond full size before settling, and the interface completes with the
project interaction.

The initial state is the complete closed paddock row with no arbitrary default
selection. Choosing a cell is an explicit entry: the chosen enclosure shifts to
the centre and toward the camera, its barred gate swings inward, the other cells
darken and recede, and a full containment dossier expands through the opening.
`Return to paddocks` restores the complete hand. On narrow screens a separate
41vw edge-focus range keeps even the first and last enclosure centred during
entry. Each chamber accepts either an image or a muted looping video through
`projectMedia.ts`; missing media remains an honest locked feed rather than a
fabricated screenshot.

The gate model credit is a compact `i` control at the frame edge, synchronized
to the gate shot rather than merely present in its DOM. It fades from 0 to full
strength over scroll progress 0.01–0.08, remains available through the roar,
door swing and most of the dolly, then fades out over 0.60–0.68 before the
containment interface arrives. At zero strength it becomes `inert`, is removed
from pointer and keyboard interaction, and closes an expanded disclosure. The
expanded control carries title, creator, source, licence, and an adaptation
notice; the same details are repeated in `docs/ATTRIBUTIONS.md` for repository
readers.

### Phase 2 realism revision verification

- Real Chromium/WebGL2 at 1440×900 shows all eight flames in the closed and open
  shots. The restrained exposure leaves normal-map relief, rough stone, wooden
  door grain and local torch falloff visible instead of clipping the whole gate
  to orange-white.
- At the dolly endpoint the first cell was captured during its overshoot at
  297.1 px wide and then at its settled 259.7 px width without another scroll
  event. Its CSS timeline begins at zero opacity with blur, crosses 1.12 scale,
  compresses to 0.96, and settles at 1. This verifies the requested fade/pop is
  a real temporal beat rather than an always-visible transform.
- At 1440×900 all eight structural cells render in the closed row with no page
  overflow. Entering edge paddock 08 centres it at x=706.1 against a 720 px
  viewport centre, swings its gate to `rotateY(-72deg)`, and expands an 896 px
  dossier below it.
- At 390×844 all eight cells render with `scrollWidth === innerWidth === 390`.
  Entering edge paddock 08 centres it at x=181.8 against a 195 px viewport
  centre; the dossier remains inside 9.4–380.6 px, and the selected cell no
  longer covers the heading.
- With `prefers-reduced-motion: reduce`, all eight cells are immediately static,
  the roar is absent, and the gate-only credit control is inert because the gate
  shot is skipped; the persistent repository attribution remains available.
- Browser measurement confirms the credit `i` at opacity 0/inert at progress 0,
  opacity 0.402 and interactive at 0.04, opacity 1 at 0.12–0.50, opacity 0.493
  at 0.64, and opacity 0/inert/closed at 0.68 when the project scene mounts.
- TypeScript, ESLint, data validation, production build, and 90 tests pass.
  Coverage is 90.51% statements, 79.09% branches, 93.02% functions, and 92.66%
  lines. The lazy gate chunk, including Three.js and the containment hand, is
  629.61 KB / 158.46 KB gzip.

---

# Phase 1 — Scroll shell + Back to the Future

## Scroll architecture

Native scrolling only. No scroll-jacking, no hijacked wheel events, no
scroll-snap forcing. Awwwards-style sites routinely capture the scroll and it
breaks keyboard navigation, screen readers, trackpad momentum, and browser find —
the site would look impressive and be hostile to use.

`body { overflow: hidden }` comes off. Each scene is a `<section>` at
`min-height: 100svh`. The card keeps its existing entrance untouched.

**A scroll affordance is required.** The card currently *is* the site; nothing
signals there is more. Without a cue, most visitors will read the card and leave,
and the rest of the work is never seen. A quiet mark below the card, appearing
after the blood settles so it does not interrupt the joke.

## Performance

`useCardTilt` currently runs its `requestAnimationFrame` loop forever. Once the
card can be scrolled away, that is a loop animating an offscreen element — wasted
battery on every device. The hook gains an in-view check and parks itself when the
card is not visible.

Scenes below the fold mount lazily via `IntersectionObserver`, so the card's
time-to-interactive is unchanged no matter how many scenes are added later. The
timeline uses a negative bottom root margin (`0px 0px -12%`): because scene two
starts exactly at the first viewport's edge, a positive prefetch margin would
count it as visible on initial load and quietly turn the lazy mount eager.

## The Back to the Future scene

The DeLorean's time circuits are a flat panel: three stacked rows — red
DESTINATION TIME, green PRESENT TIME, amber LAST TIME DEPARTED — each split into
MONTH / DAY / YEAR / HOUR / MIN columns of segmented digits.

This is CSS and SVG. The panel, not the car, is the part that carries content, so
the scene needs no 3D at all.

**Mapping.** Each entry in `experiences.ts` is a destination. The five roles run
from RISTEK (2023) to Systatum (January 2026). As the scene scrolls, the
DESTINATION row steps through them and the role's title and detail render beside
the panel. PRESENT TIME holds the current role; LAST TIME DEPARTED holds the
previous one — which is exactly how the prop behaves, and exactly how a career
timeline reads.

**Motion.** Digits flicker and settle when the destination changes, as the prop
does. Under `prefers-reduced-motion` they cut straight to their value.

## Data

`experiences.ts` already carries `monthLabel`, `title`, `date`, `description`,
`achievements`, and `logo` per entry, validated by `experienceEntrySchema`. The
scene consumes it as-is. Month labels must parse to a month and year for the
segmented columns; entries whose label is a bare year (the 2023 RISTEK entry) fall
back to displaying the year alone rather than inventing a month.

## Structure

```
src/
  components/
    scenes/
      CardScene.tsx        wraps the existing BusinessCard
      TimeCircuitsScene.tsx
    TimeCircuits.tsx       the panel itself
    SevenSegment.tsx       one physical seven-segment digit/column
    ScrollCue.tsx          delayed affordance below the card
  hooks/
    useInView.ts           IntersectionObserver, shared
```

`BusinessCard` is not modified beyond being wrapped — the card is finished and
should stay that way.

## Testing

- Every experience entry renders a destination row
- Month labels parse, and a bare-year label degrades to the year without inventing
  a month
- `useCardTilt` attaches no loop while the card is out of view
- Scenes below the fold do not mount until observed

Not tested: LED colours, flicker timing, scroll positions.

## Phase 1 verification

- TypeScript, ESLint, data validation and production build pass.
- 62 tests pass across 11 files.
- Coverage: 96.25% statements, 86.04% branches, 96% functions, 98.2% lines.
- Production bundle: 193.48 KB / 61.66 KB gzip for app JavaScript. The first
  implementation imported the all-data Zod barrel and reached 81.54 KB gzip;
  rendering now imports the typed experience literal directly while CI retains
  the Zod parse, avoiding projects, skills and the validator in the browser.
- Real Chromium at 1440×900: five roles render; scrolling to July 2025 changes
  DESTINATION to `JUL 2025`, keeps PRESENT at `JAN 2026`, and changes LAST TIME
  DEPARTED to `JUN 2024`.
- Real Chromium at 390×844: the panel is 350 px inside a 390 px scene, all five
  roles mount after scrolling, and there is no horizontal overflow.
- Before any scroll, the real browser reports zero `.circuits-stop` nodes;
  after entering scene two it reports all five. This verifies the lazy mount
  against actual layout rather than only a mocked observer.
