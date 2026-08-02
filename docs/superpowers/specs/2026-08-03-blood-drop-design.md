# Design — The Blood Drop

**Date:** 2026-08-03
**Status:** Built
**Extends:** [2026-08-01 business card redesign](./2026-08-01-business-card-redesign-design.md)

## Summary

A drop of blood falls onto the card and soaks into the paper below the name. The
card is a straight-faced parody of Patrick Bateman's business card, and this is
the punchline it has been building toward.

## Why a falling drop

Three forms were considered: a bloody thumbprint, a falling drop, and a dragged
smear.

The **thumbprint** is conceptually the strongest — it implies a person with blood
on their hands handled the card — but it is fundamentally a static image whose
only motion is a brief fade, and the ridge detail is hard to draw convincingly at
card scale. The **smear** is the most dramatic but large enough to compete with
the footer, reading as a ruined card rather than a designed one.

The **drop** won because it is inherently animated, and because it echoes the
card's own entrance: the card falls and lands, then a drop falls and lands. The
same gesture, escalated. Its spreading also reuses the paper physics the card
already establishes.

## Timing

Keyed to the card's existing choreography. The card settles at 1000 ms and its
fields finish revealing near 1860 ms, so the drop is held until 2000 ms. Landing
it earlier would turn the punchline into decoration — the card has to read as
sincere before the joke can arrive.

| Time | Event |
|---|---|
| 2000–2340 ms | Drop descends on an ease-*in* curve, stretching as it accelerates |
| ~2340 ms | Impact: the drop squashes flat and hands off to the pool |
| 2300–3120 ms | Pool blooms outward from a point |
| 3120–6320 ms | Slow wick: the pool creeps ~6% wider as the stock keeps absorbing |

The fall uses `cubic-bezier(0.55, 0, 1, 0.45)`. An ease-*out* here would read as
the drop being lowered rather than falling.

## Material

**Colour.** Deep `#5E0202` at the core through `#760A04` to a browner, thinner
`#5C1608` at the rim. Not the red people reach for: fresh blood on white paper is
nowhere near `#F00`, and it oxidises browner as it spreads and dries. This is the
same lesson the card already learned twice — ink is not black, bone is not white.

**Blending.** `mix-blend-mode: multiply`, so the paper grain reads *through* the
stain. Painted opaquely it would sit on the card like a decal.

**Edge.** `feTurbulence` + `feDisplacementMap` roughen the outline. A smooth-edged
red shape reads as a sticker laid on the card; liquid soaking into cotton stock
creeps unevenly along the fibres. The same noise primitive drives the paper grain,
so the two materials agree with each other.

**Shape and fill are separate.** The mass is three overlapping lobes rather than
one ellipse, because a single ellipse survives displacement still looking like an
ellipse — a wax seal rather than a spill. But filling each lobe with its own
gradient puts three gradient centres where they overlap, and the displacement map
then drags those internal seams into what look like holes in the stain. The lobes
are therefore a `<mask>`, through which one gradient-filled rect is painted: a
single continuous fill with no interior edges for the noise to expose.

A few sparse, asymmetric satellite specks sell the impact.

## Placement

Anchored to `.card__identity` rather than to the card edge, so it tracks the name.
Centred under the name but nudged off dead-centre, because a falling drop would
not land perfectly aligned.

On narrow screens the footer wraps to three stacked lines and eats most of the
band the stain sits in; at desktop proportions it drips onto the domain. It
therefore shrinks and tucks up close under the role line below 36rem.

## Structure

`BloodDrop.tsx` + `BloodDrop.css`, a self-contained decorative unit with no logic
and no dependencies. Kept out of `BusinessCard.css`, which is already ~390 lines.

## Accessibility

The whole thing is `aria-hidden` — it is decorative and conveys nothing a screen
reader needs.

Under `prefers-reduced-motion` the drop never falls and the pool simply fades in.
The stain is character; only the motion is enhancement, so removing the motion
should not remove the joke.

## Testing

Covered against the real component: the blood is `aria-hidden`, sits inside both
`.card__identity` and `.card`, and carries both stages (`.blood__drip` and
`.blood__pool`). Animation timing and colour values are not tested — they are
craft, and asserting them would only make the tests brittle.
