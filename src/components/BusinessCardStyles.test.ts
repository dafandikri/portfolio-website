import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync('src/components/BusinessCard.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

function blockOf(selector: string): string {
  const start = css.indexOf(`${selector} {`)
  expect(start).toBeGreaterThanOrEqual(0)
  const rest = css.slice(start)
  return rest.slice(0, rest.indexOf('}'))
}

describe('business-card Safari interaction layers', () => {
  it('retires the delivery transform before enabling its native links', () => {
    const delivery = blockOf('.card-delivery')
    const landed = blockOf('.stage--ready .card-delivery.card-delivery--landed')

    expect(delivery).not.toContain('transform-style: preserve-3d')
    expect(delivery).toContain('pointer-events: none')
    expect(landed).toContain('animation: none')
    expect(landed).toContain('transform: none')
    expect(landed).toContain('pointer-events: auto')
  })

  it('keeps perspective on the card and shadow planes direct parent', () => {
    const stage = blockOf('.stage')
    const drop = blockOf('.card-drop')
    const card = blockOf('.card')

    expect(stage).not.toContain('perspective:')
    expect(drop).toContain('perspective: calc(var(--card-w) * 1.35)')
    expect(drop).toContain('transform-style: flat')
    expect(drop).not.toContain('transform-style: preserve-3d')
    expect(card).not.toContain('will-change: transform')
  })

  it('gives every printed link an exact non-layout 44px hit surface', () => {
    const hitSurface = blockOf('a.card__meta::before')

    expect(hitSurface).toContain('position: absolute')
    expect(hitSurface).toContain('block-size: 44px')
    expect(hitSurface).toContain('pointer-events: auto')
    expect(hitSurface).toContain('cursor: pointer')
  })
})
