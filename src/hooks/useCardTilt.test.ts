import { describe, it, expect } from 'vitest'
import {
  pointerToOffset,
  offsetToTilt,
  specularFromOffset,
  MAX_TILT_DEG,
  isInteractivePointerTarget,
} from './useCardTilt'

/**
 * The tilt maths is pure, so it is tested here without a DOM, a pointer, or a
 * running animation frame. The hook's DOM behaviour is covered against the real
 * component in BusinessCard.test.tsx.
 */
const BOX = { left: 0, top: 0, width: 100, height: 100 }
const tiltAt = (x: number, y: number, box = BOX) => offsetToTilt(pointerToOffset(x, y, box))

describe('pointerToOffset', () => {
  it('reads dead centre as no offset', () => {
    const { cx, cy } = pointerToOffset(50, 50, BOX)
    expect(cx).toBeCloseTo(0)
    expect(cy).toBeCloseTo(0)
  })

  it('accounts for a card that is not at the viewport origin', () => {
    const { cx, cy } = pointerToOffset(250, 150, { left: 200, top: 100, width: 100, height: 100 })
    expect(cx).toBeCloseTo(0)
    expect(cy).toBeCloseTo(0)
  })

  it('clamps a pointer that runs past the card', () => {
    const { cx, cy } = pointerToOffset(9999, -9999, BOX)
    expect(cx).toBe(1)
    expect(cy).toBe(-1)
  })

  it('does not divide by zero on a card with no measured size', () => {
    const { cx, cy } = pointerToOffset(10, 10, { left: 0, top: 0, width: 0, height: 0 })
    expect(Number.isFinite(cx)).toBe(true)
    expect(Number.isFinite(cy)).toBe(true)
  })
})

describe('offsetToTilt', () => {
  it('sits flat when the pointer is dead centre', () => {
    expect(tiltAt(50, 50).deg).toBeCloseTo(0)
  })

  it('rotates about a unit axis, so the angle alone sets the lean', () => {
    for (const [x, y] of [[100, 0], [0, 100], [50, 0], [72, 91]]) {
      const { ax, ay } = tiltAt(x!, y!)
      expect(Math.hypot(ax, ay)).toBeCloseTo(1)
    }
  })

  it('keeps the rotation axis square to the pointer direction', () => {
    // A pure lean has no in-plane roll: the axis must be perpendicular to the
    // offset. rotateX+rotateY fails exactly here, which is why the card used to
    // read as spun flat rather than tilted once the pointer neared a corner.
    for (const [x, y] of [[100, 0], [0, 100], [88, 12], [20, 95]]) {
      const { cx, cy } = pointerToOffset(x!, y!, BOX)
      const { ax, ay } = offsetToTilt({ cx, cy })
      expect(ax * cx + ay * cy).toBeCloseTo(0)
    }
  })

  it('pushes the edge under the pointer away rather than lifting it', () => {
    // CSS 3D points Y downward, so a positive rotation about +X brings the
    // bottom edge forward and pushes the top edge back. A cursor high on the
    // card must therefore produce a positive rotation about +X.
    const high = tiltAt(50, 0)
    expect(high.ax * high.deg).toBeGreaterThan(0)
    const low = tiltAt(50, 100)
    expect(low.ax * low.deg).toBeLessThan(0)
    const right = tiltAt(100, 50)
    expect(right.ay * right.deg).toBeGreaterThan(0)
    const left = tiltAt(0, 50)
    expect(left.ay * left.deg).toBeLessThan(0)
  })

  it('reaches the maximum tilt at an edge', () => {
    expect(tiltAt(100, 50).deg).toBeCloseTo(MAX_TILT_DEG)
  })

  it('does not tilt further at a corner, which reaches further than an edge', () => {
    expect(tiltAt(100, 0).deg).toBeCloseTo(MAX_TILT_DEG)
  })

  it('never exceeds the maximum tilt when the pointer runs past the card', () => {
    expect(tiltAt(9999, -9999).deg).toBeLessThanOrEqual(MAX_TILT_DEG)
  })

  it('holds a defined axis when there is no direction to lean in', () => {
    const { ax, ay, deg } = offsetToTilt({ cx: 0, cy: 0 })
    expect(deg).toBe(0)
    expect(Math.hypot(ax, ay)).toBeCloseTo(1)
  })
})

describe('specularFromOffset', () => {
  it('puts the highlight under the pointer', () => {
    const { mx, my } = specularFromOffset(pointerToOffset(100, 0, BOX))
    expect(mx).toBeCloseTo(1)
    expect(my).toBeCloseTo(0)
  })

  it('centres the highlight on a flat card', () => {
    const { mx, my } = specularFromOffset({ cx: 0, cy: 0 })
    expect(mx).toBeCloseTo(0.5)
    expect(my).toBeCloseTo(0.5)
  })

  it('stays on the card face however far the pointer runs', () => {
    const { mx, my } = specularFromOffset({ cx: 40, cy: -40 })
    expect(mx).toBeGreaterThanOrEqual(0)
    expect(mx).toBeLessThanOrEqual(1)
    expect(my).toBeGreaterThanOrEqual(0)
    expect(my).toBeLessThanOrEqual(1)
  })
})

describe('interactive pointer targets', () => {
  it('recognises a link and anything nested inside it', () => {
    const link = document.createElement('a')
    const label = document.createElement('span')
    link.append(label)

    expect(isInteractivePointerTarget(link)).toBe(true)
    expect(isInteractivePointerTarget(label)).toBe(true)
  })

  it('freezes before the pointer reaches either printed link column', () => {
    const contact = document.createElement('div')
    const footerRow = document.createElement('div')
    const footer = document.createElement('div')
    contact.className = 'card__contact'
    footer.className = 'card__footer-col'
    footerRow.append(footer)

    expect(isInteractivePointerTarget(contact)).toBe(true)
    expect(isInteractivePointerTarget(footer)).toBe(true)
  })

  it('leaves plain card stock available to drive the tilt', () => {
    expect(isInteractivePointerTarget(document.createElement('div'))).toBe(false)
    expect(isInteractivePointerTarget(null)).toBe(false)
  })
})
