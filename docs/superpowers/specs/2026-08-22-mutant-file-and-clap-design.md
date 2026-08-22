# The mutant file, the zoom, and a clapper that closes

Design for four changes to the awards scene and the slate, agreed 22 Aug 2026.

## Why

Three complaints, one shared cause: motion that is *described* rather than
*built*. The archive arrived by scaling 0.82 → 1, which is a nudge the eye reads
as scrolling. The slate's clapper rotated flat with no perspective, so it was a
picture of a clap. And the awards spread was a printed page in a scene whose
whole argument is that its objects are real — the gate is a Collada model, the
card is stock with thickness.

## Scope

1. **Zoom through the tear.** After the six gouges complete the X, the camera
   travels through it into the file rather than the file sliding in.
2. **A file that opens.** The archive becomes a hinged dossier that opens to a
   two-page spread, one award per page.
3. **A clapper that closes.** The slate's arm swings in 3D from its hinge.
4. **A scroll hint that lasts.** Present whenever scrolling is still required.

## Decisions

- **The claw tear survives.** It is the reason for the zoom, not a competitor to
  it. Confirmed against the alternative of replacing it.
- **CSS 3D, not three.js.** The award text stays real HTML: selectable,
  searchable, reachable by screen reader, and present for the crawler-facing
  files generated from the same data. A three.js book would make the text a
  texture and cost a second WebGL context on a page that already ships two.
- **Two-page spread; arrows only above two awards.** Navigation for pages that
  do not exist is worse than no navigation.

## Constraints

- `prefers-reduced-motion` renders the file already open, with no zoom and no
  clap. This is a durable product constraint, not a nicety.
- Scroll-driven motion uses `animation-timeline: view()`, matching the slate.
  Where unsupported, the animation has no duration and settles on its end state,
  so the content is always visible.
- The archive stays in document flow. It was moved there to fix a defect where a
  second award was clipped by a pinned 100svh stage with nothing scrollable; a
  zoom must not reintroduce a fixed-height container.
- The One Set Rule holds: the file is the archive's own world, and borrows no
  palette or typeface from the paddocks or the card.

## Structure

```
.scene--archive            document flow, owns the zoom
└─ .x-file                 perspective + preserve-3d
   ├─ .x-file__cover       hinged left, rotateY(-180deg) to open
   └─ .x-file__spread      two pages side by side
      ├─ .x-file__page     one award
      └─ .x-file__page
```

Pagination state lives in the component when awards exceed two; below that the
spread is static and no controls render.

## Testing

- The file's contents are reachable with the cover closed (the open state is
  decorative; the content is not gated on it).
- Arrows are absent at two awards and present above two.
- Every award still renders, with its stage, team and photograph.
- Reduced motion renders the open state.
- Visual: the zoom, the open, and the clap inspected at desktop and mobile in
  one batched round.

## Out of scope

Redesigning the award record's internals, the paddock scene, or the card.
