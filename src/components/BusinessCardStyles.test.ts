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
    const link = blockOf('a.card__meta')
    const hitSurface = blockOf('a.card__meta::before')

    expect(link).toContain('font-weight: 600')
    expect(link).toContain('text-decoration-line: underline')
    expect(hitSurface).toContain('position: absolute')
    expect(hitSurface).toContain('block-size: 44px')
    expect(hitSurface).toContain('pointer-events: auto')
    expect(hitSurface).toContain('cursor: pointer')
  })

  it('makes link hover and keyboard focus visibly distinct without shifting layout', () => {
    const hover = blockOf('a.card__meta:hover')
    const focus = blockOf('a.card__meta:focus-visible')

    expect(hover).toContain('text-decoration-color: currentColor')
    expect(hover).toContain('text-decoration-thickness: 0.13em')
    expect(focus).toContain('outline: 2px solid var(--ink-soft)')
    expect(focus).toContain('text-decoration-color: currentColor')
  })

  it('preserves the desktop Bateman composition on narrow screens', () => {
    const narrow = css.slice(css.indexOf('@media (max-width: 36rem)'))

    expect(narrow).toContain('--card-w: min(92vw, 40rem)')
    expect(narrow).toContain('aspect-ratio: var(--card-ratio)')
    expect(narrow).toContain('grid-template-columns: minmax(0, 1fr) minmax(0, 2.25fr) minmax(0, 1fr)')
    expect(narrow).not.toContain('aspect-ratio: 3.5 / 2.6')
  })

  it('uses a symmetric Bateman grid with left, centre and right text alignment', () => {
    const head = blockOf('.card__head')
    const contact = blockOf('.card__contact')
    const affiliation = blockOf('.card__affiliation')
    const footer = blockOf('.card__footer')
    const footerColumn = blockOf('.card__footer-col')

    expect(head).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))')
    expect(contact).toContain('align-items: flex-start')
    expect(contact).toContain('text-align: left')
    expect(affiliation).toContain('align-items: flex-end')
    expect(affiliation).toContain('text-align: right')
    expect(footer).toContain('grid-template-columns: minmax(0, 1fr) minmax(0, 2.25fr) minmax(0, 1fr)')
    expect(footer).toContain('align-items: end')
    expect(footerColumn).toContain('--line-lead: 0em')
    expect(footerColumn).toContain('align-items: center')
  })
})
