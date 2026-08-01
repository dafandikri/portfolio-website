import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import BusinessCard from './BusinessCard'
import { card } from '../data/card'
import { stubMatchMedia } from '../test/setup'

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)))

afterEach(() => {
  cleanup()
  stubMatchMedia(false)
})

describe('BusinessCard', () => {
  it('prints every field from the data file rather than hardcoded copy', () => {
    render(<BusinessCard />)

    expect(screen.getByRole('heading', { level: 1, name: card.name })).toBeInTheDocument()
    expect(screen.getByText(card.role)).toBeInTheDocument()
    expect(screen.getByText(card.industry)).toBeInTheDocument()
    expect(screen.getByText(card.phone.label)).toBeInTheDocument()
    expect(screen.getByText(card.email.label)).toBeInTheDocument()
    for (const field of card.footer) {
      expect(screen.getByText(field.label)).toBeInTheDocument()
    }
  })

  it('makes the phone dialable and the email sendable', () => {
    render(<BusinessCard />)

    expect(screen.getByRole('link', { name: card.phone.label })).toHaveAttribute(
      'href',
      card.phone.href,
    )
    expect(screen.getByRole('link', { name: card.email.label })).toHaveAttribute(
      'href',
      card.email.href,
    )
    expect(card.phone.href?.startsWith('tel:')).toBe(true)
    expect(card.email.href?.startsWith('mailto:')).toBe(true)
  })

  it('links every footer field that has a destination and leaves the rest as ink', () => {
    render(<BusinessCard />)

    for (const field of card.footer) {
      const node = screen.getByText(field.label)
      if (field.href === null) {
        expect(node.tagName).toBe('SPAN')
      } else {
        expect(node.tagName).toBe('A')
        expect(node).toHaveAttribute('href', field.href)
      }
    }
  })

  it('opens outbound links safely in a new tab', () => {
    render(<BusinessCard />)

    for (const field of card.footer) {
      if (field.href?.startsWith('http')) {
        const link = screen.getByRole('link', { name: field.label })
        expect(link).toHaveAttribute('target', '_blank')
        expect(link.getAttribute('rel')).toContain('noopener')
      }
    }
  })

  it('hides the decorative paper layers from assistive technology', () => {
    const { container } = render(<BusinessCard />)

    for (const cls of ['.card__grain', '.card__specular']) {
      expect(container.querySelector(cls)).toHaveAttribute('aria-hidden', 'true')
    }
  })

  it('drives the tilt through CSS custom properties, not React state', async () => {
    const { container } = render(<BusinessCard />)
    const cardEl = container.querySelector<HTMLElement>('.card')
    expect(cardEl).not.toBeNull()

    await nextFrame()
    await nextFrame()

    // Written straight to the node by the rAF loop. If these were React state
    // the component would re-render on every pointer move.
    expect(cardEl!.style.getPropertyValue('--rx')).toMatch(/deg$/)
    expect(cardEl!.style.getPropertyValue('--mx')).toMatch(/%$/)
  })

  it('leaves the card completely still under prefers-reduced-motion', async () => {
    stubMatchMedia(true)
    const { container } = render(<BusinessCard />)
    const cardEl = container.querySelector<HTMLElement>('.card')

    await nextFrame()
    await nextFrame()

    // No loop started, so nothing was ever written.
    expect(cardEl!.style.getPropertyValue('--rx')).toBe('')
    expect(cardEl!.style.getPropertyValue('--mx')).toBe('')
  })
})
