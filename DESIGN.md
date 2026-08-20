---
name: Erdafa Andikri — Portfolio
description: A scroll through four film sets, each one built rather than drawn.
colors:
  stock: "#ffffff"
  stock-shade: "#fbfaf9"
  ink: "#000000"
  amber: "#f0b51f"
  amber-lit: "#ffd465"
  hazard: "#dca719"
  bone: "#e8dcc4"
  bone-park: "#fff0d6"
  canvas: "#cdbd8c"
  timber: "#8a4b22"
  timber-lit: "#805026"
  timber-deep: "#32190a"
  timber-shadow: "#271308"
  interior: "#06100d"
  jungle-night: "#020807"
  circuit-red: "#ff2d1c"
  circuit-amber: "#ffb01f"
  circuit-green: "#35e06a"
typography:
  display:
    fontFamily: "Cormorant SC, Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(1.5rem, 4vw, 2.6rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "0.1em"
  headline:
    fontFamily: "Orbitron, Eurostile, Helvetica Neue, sans-serif"
    fontSize: "clamp(1.4rem, 4vw, 2.8rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0.1em"
  title:
    fontFamily: "Orbitron, Eurostile, Helvetica Neue, sans-serif"
    fontSize: "clamp(1.05rem, 2.6vw, 1.7rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0.03em"
  body:
    fontFamily: "Cormorant Garamond, Georgia, Times New Roman, serif"
    fontSize: "clamp(0.66rem, 1.15vw, 0.8rem)"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Orbitron, Eurostile, Helvetica Neue, sans-serif"
    fontSize: "clamp(0.42rem, 0.78vw, 0.55rem)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.25em"
components:
  paddock-plaque:
    backgroundColor: "{colors.timber-deep}"
    textColor: "{colors.bone-park}"
    typography: "{typography.label}"
    padding: "0.42rem 1rem 0.52rem"
  vitrine:
    backgroundColor: "{colors.interior}"
    textColor: "{colors.bone}"
    padding: "clamp(0.7rem, 1.7vw, 1.1rem)"
  banner:
    backgroundColor: "{colors.canvas}"
    textColor: "#23160b"
    typography: "{typography.display}"
    padding: "clamp(0.5rem, 1.6vh, 0.95rem) clamp(1rem, 4vw, 2.6rem) clamp(0.9rem, 2.4vh, 1.5rem)"
  link:
    textColor: "{colors.amber}"
    typography: "{typography.body}"
  link-hover:
    textColor: "{colors.amber-lit}"
---

# Design System: Erdafa Andikri — Portfolio

## Overview

**Creative North Star: "The Practical Effect"**

This site is a film built the way films were built before post-production: with
physical sets, real models, and tricks done in camera. It is not a portfolio
that references cinema — it is a walk through four standing sets, each fully
dressed, each belonging to a different picture.

The standard the codebase already holds itself to is stated in `GateScene.tsx`:
the CSS gate that preceded the current one *"could open, but it was never going
to look like the film — it was a drawing of a gate from memory. This is the
actual model."* That sentence is the design system. When something can be built,
it is built, not approximated. The gate is a real DAE model with its own
textures. The mascot is a real sprite cut from real artwork. The timber has
thickness because a shadow gives it thickness, not because a border suggests it.

Density is high and the surfaces are dark, wet and worn — closer to the source
films' production design than to their merchandise. Every object carries wear:
grain, hazard tape, scratched enamel, weld seams, canvas slub. Nothing is
flat-shaded, and nothing is a rectangle with a radius standing in for an object.

**Key Characteristics:**

- Objects are fabricated, never drawn. If it can be modelled, it is not faked.
- Depth is material. A shadow says what a thing is made of, not how high it floats.
- Each scene is its own world with its own light, palette and voice.
- Structure is diegetic: labels are plaques, lists are archives, awards are specimens.
- Motion is mechanical and rare. Things deploy, unfurl and settle; they do not float.

## Colors

There is no single site palette. Each set is lit for its own film, and the only
value that crosses a set boundary is the amber of the Jurassic act.

### Primary

- **Containment Amber** (`{colors.amber}`): the single accent of the Jurassic
  act. Live status lamps, award titles, links, focus rings. It is the colour of
  a system that is powered on, so it appears only where something is live or
  actionable — never as decoration.
- **Hazard Yellow** (`{colors.hazard}`): reserved for the diagonal warning tape
  on paddock lintels. It is a sibling of the amber, not a substitute; it marks
  danger, not interactivity.

### Secondary

- **Time Circuit Red / Amber / Green** (`{colors.circuit-red}`,
  `{colors.circuit-amber}`, `{colors.circuit-green}`): the three seven-segment
  rows of the experience scene — Destination, Present, Last Departed. These are
  display phosphor colours and belong to that scene's instrument only. They must
  never be borrowed as status colours elsewhere.

### Neutral

- **Card Stock** (`{colors.stock}`) and **Ink** (`{colors.ink}`): the opening
  scene is printed black on white, on white. The card separates from the page by
  shadow and paper tooth alone, never by colour.
- **Bone** (`{colors.bone}`) and **Park Bone** (`{colors.bone-park}`): warm
  off-whites for text on dark sets. Text on a coloured ground is tinted from
  that ground's hue; grey text is not used anywhere on this site.
- **Canvas** (`{colors.canvas}`): unbleached painted-banner cloth.
- **Timber** family (`{colors.timber}`, `{colors.timber-lit}`,
  `{colors.timber-deep}`, `{colors.timber-shadow}`): the four tones any piece of
  park lumber needs — face, lit edge, shaded face, and the thickness beneath it.
- **Interior** (`{colors.interior}`) and **Jungle Night**
  (`{colors.jungle-night}`): the two grounds of the Jurassic act. Interior is
  the Visitor Center; Jungle Night is outside, under leaves.

### Named Rules

**The One Set Rule.** A colour belongs to the set it was lit for. Borrowing the
time-circuit green for a success state, or the containment amber for the card
scene, collapses two places into one and destroys the walk between them. The
only sanctioned crossing is amber between the paddocks and the Visitor Center,
because they are the same building's exterior and interior.

**The Powered-On Rule.** Amber marks what is live: a lamp, a link, a focus ring,
an award. If an element is not interactive and not a status, it does not get amber.

## Typography

**Display Font:** Cormorant SC (with Cormorant Garamond, Georgia, serif)
**Body Font:** Cormorant Garamond (with Georgia, Times New Roman, serif)
**Label/Technical Font:** Orbitron (with Eurostile, Helvetica Neue, sans-serif)

**Character:** Two voices that must never blend. Cormorant is letterpress — it
belongs to 1987 Manhattan and to anything printed or painted by hand. Orbitron
is machined — it belongs to instruments, dashboards and anything InGen
manufactured. A surface is set in one or the other depending on how the object
in front of you was made, not on where it sits in the hierarchy.

### Hierarchy

- **Display** (Cormorant SC, 500, `clamp(1.5rem, 4vw, 2.6rem)`, tracking 0.1em):
  the business card's name, and painted signage. Real small-caps glyphs only.
- **Headline** (Orbitron, 700, `clamp(1.4rem, 4vw, 2.8rem)`, tracking 0.1em,
  uppercase): scene titles — `PROJECT PADDOCKS`, `AWARDS`.
- **Title** (Orbitron, 700, `clamp(1.05rem, 2.6vw, 1.7rem)`, uppercase): the
  name of a single object — a project dossier, an award.
- **Body** (Cormorant Garamond on the card; Orbitron at
  `clamp(0.6rem, 1.02vw, 0.72rem)` on instrument sets, line-height 1.6):
  running prose. Keep measure to 65–75ch.
- **Label** (Orbitron, `clamp(0.42rem, 0.78vw, 0.55rem)`, tracking 0.25em,
  uppercase): stencilled markings — `PADDOCK 03`, `FIELD RECORD`,
  `SPECIMEN ON FILE`, serials and location tags.

### Named Rules

**The One Place Rule.** Scenes do not share typefaces. `tokens.css` states the
reason directly: the card's Garamond belongs to 1987 Manhattan, and borrowing it
for a DeLorean dashboard would make both scenes read as the same place. Before
using a face in a new scene, ask which set fabricated the object.

**The Painted Exception.** The one sanctioned crossing is the Visitor Center
banner, which is set in Cormorant SC inside an otherwise Orbitron act. It earns
this because it is the only object in the park painted by hand rather than
manufactured. Machined lettering on painted canvas would be the wrong material.

**The Real Glyph Rule.** Small caps come from Cormorant SC's own glyphs, never
from `font-variant-caps` on a family that lacks them — synthesised small caps
thin the strokes visibly at these sizes.

## Layout

Each scene is a **fixed-height stage**: `position: absolute; inset: 0`, filling
one viewport with no internal scroll, composed with flexbox and centred. The
page is a sequence of these stages; scrolling moves between sets rather than
through content.

Scenes are code-split and gated on approach. `App.tsx` wraps each in a
`DeferredScene` that reserves full height and only requests the scene's
JavaScript when the visitor is within one viewport of it, which is what keeps
the landing instant while Three.js lives two scenes down.

Grids are asymmetric where the content is asymmetric. The paddock grid runs six
tracks with each unit spanning two, so five enclosures sit three-over-two with
the bottom row centred — a centring that two or three tracks cannot express
without a wrapper element.

Below **760px** every stage releases: grids collapse to one column, stages gain
`overflow-y: auto`, and fixed compositions become scrolling ones. A secondary
breakpoint at `max-height: 720px` tightens vertical rhythm for short laptop
displays.

Content columns import their data from the raw data modules
(`../../data/projects`), never the validating barrel (`../../data`) — the barrel
pulls Zod and every content file into the scene's chunk. This is a layout
concern because it is the difference between a 3 kB scene and an 84 kB one.

## Elevation & Depth

This system does not have an elevation scale. It has **materials**.

A shadow here describes what an object is made of and how thick it is, not how
high it floats above a surface. A single piece of park timber carries three
shadows doing three different physical jobs simultaneously, and removing any one
of them makes it read as a coloured rectangle.

### Shadow Vocabulary

- **Thickness** (`box-shadow: 0 0.38rem 0 {colors.timber-shadow}`): a hard,
  zero-blur offset in the object's own darkened tone. This is the edge of the
  material seen from slightly above — not a neobrutalist costume.
- **Cast** (`box-shadow: 0 0.62rem 0.8rem rgba(5, 14, 6, 0.68)`): the soft
  shadow the object throws onto whatever is behind it.
- **Lit edge** (`box-shadow: inset 0 -2px rgba(28, 12, 5, 0.58)` or
  `inset 0 1px rgba(255, 218, 145, 0.25)`): the highlight or shading where the
  light strikes a face.

### Named Rules

**The Material Rule.** A shadow says what a thing is made of, not how high it
floats. Before adding one, name the physical fact it encodes — thickness, cast,
or lit edge. A shadow that encodes none of those is decoration and does not ship.

**The Three-Shadow Test.** A fabricated object generally needs thickness, cast
and lit edge together. One soft shadow alone will read as a UI card, which is the
failure mode this system exists to avoid.

## Shapes

Corners are **irregular on purpose**. Fabricated objects use asymmetric
`border-radius` with slash syntax (`0.62rem 0.55rem 0.42rem 0.5rem / 48% 42% 38%
45%`) so no two corners of a timber beam match, and `clip-path` polygons with
non-parallel edges so a plaque reads as cut rather than as a rounded rectangle.

Banners hang: the bottom edge is a `clip-path` chevron
(`polygon(0 0, 100% 0, 100% 84%, 50% 100%, 0 84%)`) so the cloth sags between
its fixings.

Uniform radii appear only on genuinely manufactured parts — keypads, status
lamps, control boxes.

## Components

### Scene stage

- **Shape:** full-viewport, `position: absolute; inset: 0`, `overflow: hidden`.
- **Background:** a photographic plate or a layered gradient ground, plus a
  vignette pseudo-element and a floor or horizon band.
- **Behaviour:** mounts through `DeferredScene`; animates in once, then rests.

### Containment paddock (signature)

- **Shape:** `aspect-ratio: 1.48`, irregular timber radii, `overflow: visible`.
- **Structure:** hazard lintel with serial, media cell behind welded bars, lock
  box with status lamp and keypad, carved sill plaque, ground pylons.
- **Colour:** timber family for the frame, `{colors.amber}` for the live lamp,
  `{colors.hazard}` for the warning tape.
- **States:** hover and focus lift the unit (`translateY(-0.28rem) scale(1.018)`)
  with a smooth ease-out; focus draws a 2px amber outline offset outside the
  frame. Opening runs a 120ms gate cycle before the dossier mounts.

### Vitrine (signature)

- **Shape:** rectangular case, 1px bone border at 22% opacity, no radius.
- **Structure:** specimen area above with a lit pool beneath the object, plinth
  label below, raking highlight across the glass front.
- **Colour:** `{colors.interior}` ground, `{colors.amber}` under-light,
  `{colors.bone}` text.

### Banner (signature)

- **Shape:** chevron-hemmed cloth, no radius.
- **Type:** Display face only — this is the Painted Exception.
- **Motion:** unfurls once on scene entry from `scaleY(0.03)` with exponential
  ease-out; already visible when motion is reduced.

### Links

- **Default:** `{colors.amber}`, underline offset `0.2em`, 1px thickness.
- **Hover / focus:** `{colors.amber-lit}`; focus adds a 2px amber outline at 3px
  offset. Every interactive element keeps a visible focus ring.

### Archive strip

- A `<details>` element with a count badge, holding non-featured work as plain
  rows. Deliberately quieter than the paddocks: it is storage, not display.

## Do's and Don'ts

### Do:

- **Do** build the object. A real model, a real sprite sheet, a real texture
  beats a CSS approximation of one, and the codebase has already made that trade
  once for the gate.
- **Do** give every fabricated surface thickness, cast and lit edge together.
- **Do** tint secondary text from its ground's hue and keep body text at or above
  4.5:1 contrast.
- **Do** theme the browser surfaces — scrollbars (`scrollbar-color`), selection,
  and focus rings all ship with defaults that belong to no design system.
- **Do** import scene data from the raw data modules, not the validating barrel.
- **Do** let each scene keep its own light, palette and typeface.
- **Do** keep motion mechanical and singular: one authored moment per scene,
  exponential ease-out, and a `prefers-reduced-motion` path that renders the
  finished state.

### Don't:

- **Don't** reach for the template portfolio, the SaaS dashboard, or generic dark
  mode. These are the three confirmed anti-references: a hero-plus-feature-cards
  layout, a sidebar with stat tiles and sparklines, and a near-black page with a
  single acid accent and glassmorphism. None of them contain a subject.
- **Don't** borrow a colour or a typeface across scenes. See The One Set Rule and
  The One Place Rule; the two sanctioned exceptions are named there.
- **Don't** use grey for secondary text.
- **Don't** use amber for anything that is neither live nor interactive.
- **Don't** put a coloured border heavier than 1px on a card, list item or callout.
- **Don't** add motion to make polish visible. The containment deploy keeps its
  overshoot because a gate slamming into place should be felt; nothing else on
  the site earns overshoot.
- **Don't** lazy-load an asset inside a scene that is already gated on approach —
  the second deferral leaves the surface empty exactly when it is being looked at.
