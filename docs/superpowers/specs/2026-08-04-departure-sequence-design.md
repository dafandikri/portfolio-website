# Design — The Departure Sequence

**Date:** 2026-08-04
**Status:** Approved
**Supersedes the scene-two treatment in:** [2026-08-03 scene sequence](./2026-08-03-scene-sequence-design.md)

## Why this exists

Phase 1 shipped a working time-circuits readout: correct data, correct colours,
lazily mounted, verified in a real browser. But it is a *component*, not a *scene*.
The card earns its impact from choreography — a fall, a settle, a reveal, a
punchline — and the timeline currently has none of that. It states facts.

This spec replaces the transition and the scene around the panel. The panel and
its data mapping are kept; everything around them becomes cinema.

## The sequence

### Act I — Departure

The card scene darkens. Before it is fully black, **two parallel fire trails
ignite** where the wheels were, exactly as the DeLorean leaves them.

The trails **race away toward a vanishing point** on the horizon, converging in
perspective. At the point they meet, a **single hard flash** — very short, very
bright, the whole frame blowing out for a beat.

### Act II — The plate

Out of the flash, the **OUTATIME licence plate tumbles** through frame like a
tossed coin, turning over itself, catching light on each face, and settles.

### Act III — Arrival

The **flux capacitor** pulses into view — the Y of three arms firing in sequence.

Then the readouts. **Time circuits at the top** of the frame. A **second display
at the bottom** carrying the role title, so the two readouts bracket the content
the way the dashboard brackets the windscreen.

### Act IV — The magnetic timeline

The roles run **past → present** as a scroll-driven carousel that is *magnetic*:
it settles onto one role at a time rather than drifting between them.

Each role shows a **concise** summary only. Detail lives in the résumé; the scene's
job is to be legible at a glance, not to reproduce a CV. A role can be opened for
a slightly longer description, then closes again.

## How "magnetic" is built

**CSS scroll-snap, not scroll-jacking.** This is the load-bearing decision.

Awwwards-style sites routinely capture the wheel to fake magnetism, which breaks
keyboard scrolling, trackpad momentum, screen readers and find-in-page. Native
scroll-snap produces the same magnetic settle while leaving every input working.

`scroll-snap-type: y proximity` on the document, with `scroll-snap-align` only on
the elements that should catch. Two consequences that matter:

- **`proximity`, not `mandatory`.** Mandatory can trap a visitor between snap
  points when content is taller than the viewport. Proximity settles when you are
  close and otherwise leaves you alone.
- **Opt-in per element.** Because only elements carrying `scroll-snap-align`
  catch, the card scene and the departure sequence stay free-scrolling; only the
  role stops are magnetic.

## Rendering

No 3D library. Everything here is CSS perspective, gradients and SVG:

| Element | Technique |
|---|---|
| Fire trails | Two elements in a shared `perspective`, receding to a vanishing point; gradient body, `feTurbulence` displacement for flame edge |
| Horizon flash | A radial burst scaled up over ~140 ms, then gone |
| Licence plate | `rotateX`/`rotateY` tumble under perspective, with face shading per quarter-turn |
| Flux capacitor | SVG Y, three arms firing in sequence |
| Readouts | The existing `TimeCircuits` and `SevenSegment`, unchanged |

The bundle stays free of Three.js. The Jurassic Park scene is still where that
cost lands.

## Reduced motion

The entire departure is motion for its own sake, so under
`prefers-reduced-motion: reduce` it does not play: no trails, no flash, no tumble.
The scene cuts straight to the circuits with the timeline intact, and scroll-snap
is disabled so nothing moves the viewport unexpectedly.

A flash is also the one element here with a genuine safety dimension. It is a
single short burst, never repeated and never strobing, and it is suppressed
entirely under reduced motion.

## Testing

- Every role still renders, and the panel still maps destination / present /
  departed correctly
- The departure sequence is `aria-hidden` throughout — it carries no information
- Roles expand and collapse by keyboard, not only by pointer
- Under reduced motion, no flash element is rendered at all

Not tested: flame shape, tumble timing, snap positions.
