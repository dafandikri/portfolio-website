# Design — dafandikri.tech v2: The Card

**Date:** 2026-08-01
**Status:** Approved
**Supersedes:** the Windows 95 portfolio (preserved at tag `v1-win95`)

## Summary

Replace the Windows 95 portfolio with a single full-viewport screen containing one
3D business card, styled after the Pierce & Pierce cards from *American Psycho*.
The card drops in from above on load, tilts toward the pointer, and is the entire
site. Existing content data stays in the repo, unrendered, for later phases.

## Scope

**In scope (phase 1):** one screen, one card. No routes, no scroll, no other pages.

**Out of scope (later phases):** projects, blog, and experience rendering; routing;
any Letterboxd/TMDB integration.

`src/data/` (projects, experiences, skills + Zod schemas) is retained untouched.
It renders nowhere in phase 1 but survives for future work — this data survived the
redesign precisely because it sits behind schemas rather than CSS classes.

## Repository strategy

Same repository, not a new one. The domain, Vercel project, GitHub Actions, Docker
image, and k3s manifests are all wired to this repo and are stack-agnostic.

1. Tag current `main` as `v1-win95` and push the tag (Win95 site stays recoverable).
2. Branch `feat/bateman-card` off `main`.
3. Merge to `main` when done; Vercel auto-deploys to `dafandikri.tech`.

The Docker/k3s path needs no change — it serves whatever `dist/` contains.

## Tech stack

Unchanged: React 19, Vite, TypeScript, Vitest + RTL with coverage gate, ESLint,
GitHub Actions, Vercel, Docker/k3s. The redesign is entirely in the view layer.

### Removed

| Dependency | Reason |
|---|---|
| `bootstrap`, `@popperjs/core` | Entire design system replaced by hand-written CSS |
| `mermaid` | Used only by `src/pages/BlogPostPage.jsx`, which is deleted |
| `react-router-dom` | No routes in a one-screen site |
| `framer-motion` | The entrance is one element animating once — CSS keyframes suffice |

### Deleted files

- `src/components/` — all 8 components (`Contact`, `Hobbies`, `KnowEachOther`,
  `Layout`, `Navbar`, `ProfileCard`, `Project`, `Experience`, `TechStackDialog`,
  `SkillsetsDialog`) and their tests
- `src/pages/` — `HomePage`, `BlogListPage`, `BlogPostPage`
- `src/styles/w95.css`, `src/js/w95.js`, `src/App.css`
- `src/fonts/` — Win95 typefaces

### Retained

`src/data/*.ts` and its tests, `zod`, `react`, `react-dom`, `@vercel/analytics`,
`@vercel/speed-insights`, all CI/infra config.

### Config that must change in the same commit

`vitest.config.ts` hard-codes the four deleted component paths in its coverage
`include` list, and its branch-floor comment references `framer-motion` plumbing in
`Experience.tsx`. Neither TypeScript nor Vite will flag this, because config files
reference code by string rather than by symbol.

## Card content

Tone: deadpan dev parody. The card reads as sincere to someone who doesn't know the
film, and lands the joke for someone who does.

```
┌─────────────────────────────────────────────────┐
│ +62 …                    MERGES AND ACQUISITIONS│
│ dafandikri@gmail.com                            │
│                                                 │
│              E R D A F A  A N D I K R I         │
│                  Software Engineer              │
│                                                 │
│ DAFANDIKRI.TECH   GITHUB/DAFANDIKRI   JAKARTA ID│
└─────────────────────────────────────────────────┘
```

| Slot | Content | Rationale |
|---|---|---|
| Top left | Phone, then email | Matches the requested layout |
| Top right | `MERGES AND ACQUISITIONS` | Bateman's card puns "mergers and acquisitions" against "murders and executions"; the git-merge version is the developer equivalent |
| Center | `ERDAFA ANDIKRI` | Widely letterspaced small caps, the card's focal point |
| Below name | `Software Engineer` | Italic, the only non-small-caps line |
| Bottom rule | Site, GitHub, LinkedIn, location | The functional descendant of the movie card's "address · fax · telex" row |

Every field on the card is a real link: phone → `tel:`, email → `mailto:`, bottom
row → `href`. Since the card is the whole site, the links are the only way out.

## Material and typography

**Colour.** Bone, not white (`#EAE6DA`-ish — warm, faintly green-grey). Charcoal,
not black (`#2A2724`-ish), because letterpress ink on cotton never reads as pure
black. The page behind the card is a dark desaturated surface so the card reads as
an object on a desk rather than as a page.

**Deboss.** Two `text-shadow`s per glyph — light below-right, dark above-left. This
is the inverse of a conventional emboss and is what reads as *pressed into* paper.

**Typeface.** `Cormorant SC` for every small-caps field and `Cormorant Garamond`
italic for the role line. Both are self-hosted woff2, latin subset, ~24 KB each,
preloaded. They live in `public/fonts/` rather than `src/`, because Vite hashes
CSS-referenced assets and a hashed URL cannot be named in a static preload tag.

Genuine small-caps glyphs are non-negotiable here. `font-variant-caps: small-caps`
against a font that lacks true SC glyphs makes the browser *synthesise* them by
scaling capitals down, which thins the strokes and looks visibly wrong at card
sizes. Google Fonts was probed directly during design: `EB Garamond SC` **does not
exist** (the request 404s and falls back to Open Sans), while `Cormorant SC` and
`Cormorant Garamond` both ship real woff2. They are the same superfamily, designed
together, so they harmonise by construction.

**Geometry.** The true business-card ratio, 3.5 × 2 in (1.75:1), `clamp()`-sized and
capped at roughly 640 px wide.

## Rendering approach

Layered CSS with baked grain and a cursor-tracked specular sweep. Chosen over pure
CSS (too flat to read as stock) and over WebGL (which would cost text selection,
SEO, screen-reader access, and clickable `mailto:`/`tel:` links on a card whose
entire purpose is contact information).

Layer stack, bottom to top:

1. Bone base colour
2. Baked `feTurbulence` grain as a data-URI (baked once, not filtered live, because
   live SVG filters on large elements are expensive on low-end mobile)
3. Debossed text
4. Specular sweep — a radial gradient whose centre tracks the pointer
5. Edge and thickness — inset plus drop shadow

All five rotate together inside one 3D transform, so grain and highlight move *with*
the tilt rather than sliding across a static surface.

## Motion

**Entrance.** The card falls from above the viewport to centre over ~900 ms on an
ease-out curve with a small overshoot and settle. Its shadow tightens and darkens on
the same timeline — that is what sells the descent as distance rather than a slide.
On landing, fields reveal in stagger ~60 ms apart: phone → email → industry → name →
role → bottom row. Idle drift then begins.

**Tilt.** `pointermove` is normalised to −1…1 across the card's bounding box, driving
`rotateX`/`rotateY` capped at ~10–12°, with the specular gradient's centre tracking
the inverse. Values are written to CSS custom properties (`--rx`, `--ry`, `--mx`,
`--my`) inside `requestAnimationFrame` — never React state, which would re-render on
every mouse move. Pointer Events cover mouse and touch with one handler.

**Touch.** The card drifts on a slow loop by default so it never looks dead; dragging
tilts it live and releasing springs it back to idle. No `deviceorientation`, and
therefore no iOS motion-permission dialog — that prompt would fire before the visitor
has seen anything worth granting it for, and a denial is permanent.

**Reduced motion.** Under `prefers-reduced-motion`, the card fades in with no drop,
no drift, and no tilt; the hook attaches no pointer listener at all.

## Structure

```
src/
  App.tsx                 renders <BusinessCard/>, nothing else
  components/
    BusinessCard.tsx      markup + link semantics
    BusinessCard.css
  hooks/
    useCardTilt.ts        pointer → CSS vars, rAF, idle, reduced-motion
  data/
    card.ts               NEW: card fields, Zod-validated
    …existing files untouched
  styles/
    tokens.css            bone, ink, type scale, ratios
```

Hover deepens the deboss rather than underlining or changing colour — an underline
would break the print illusion instantly. Keyboard focus draws a ring styled as a
debossed rule rather than a browser-blue outline.

## Testing

`card.ts` is the one content file **not** parsed through Zod at runtime. It is a
typed literal, so the compiler already rejects malformed versions and CI re-checks
it against `cardSchema`; parsing it again in the visitor's browser could only ever
succeed, at the cost of shipping the whole validation runtime to render six
strings. Removing that one runtime parse took the bundle from 248 KB to 183 KB
(74.6 → 57.9 KB gzipped). The other content files keep their runtime parse, since
they are not yet rendered and the barrel is only used by scripts.

Fits the existing Vitest/RTL setup and coverage ratchet:

- `card.ts` satisfies its schema, and joins `scripts/validate-data.ts`
- `BusinessCard` renders every field *from data* rather than hardcoded strings
- `tel:`, `mailto:`, and `href` values are correct; links reachable by role and name
- `useCardTilt` attaches no pointer listener under `prefers-reduced-motion`
- the pointer→CSS-var maths is extracted as a pure function and tested directly

Not tested: shadow values, animation timing.

## Metadata

`public/og-card.png` is a 1200×630 screenshot of the live card, captured over CDP.
`public/favicon.svg` is a vector of the card on its dark desk, so it stays crisp at
every tab size. Title, description, and `theme-color` rewritten; the Win95-era
preloads, Bootstrap CDN tags, and inlined critical CSS come out of `index.html`.

## Verification notes

Headless Chrome's `--virtual-time-budget` advances JS timers but **not** the
compositor's animation clock, so a screenshot taken that way shows the card with
`animation-fill-mode: both` pinned at `opacity: 0` and no text at all. This looks
exactly like a catastrophic layout bug and is not one. Verify animated states over
CDP with real wall-clock delay instead.

The tilt was confirmed in a real browser by dispatching a pointer at 85%/15% across
the card and reading back `--rx: -7.49deg`, `--ry: -7.68deg`, `--mx: 84.91%`,
`--my: 15.94%` with a live `matrix3d` — negative on both axes, highlight under the
cursor, and a measured box ratio of 1.7502.

## Known follow-ups

- The `fetch-reviews` and `build-with-reviews` scripts and the TMDB env var become
  dead weight once nothing renders Letterboxd data. Script file left in place but
  dropped from the build path.
- Real phone number and LinkedIn handle need filling into `src/data/card.ts`.
- `public/images/` holds 23 MB of Win95-era screenshots that nothing references.
  Left in place pending a decision; recoverable from tag `v1-win95` if removed.
