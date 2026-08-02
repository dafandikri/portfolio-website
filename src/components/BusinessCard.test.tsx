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
    expect(screen.getByText(card.affiliation.name)).toBeInTheDocument()
    expect(screen.getByText(card.affiliation.detail)).toBeInTheDocument()
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
    const wrapper = container.querySelector<HTMLElement>('.card-drop')
    expect(wrapper).not.toBeNull()

    await nextFrame()
    await nextFrame()

    // Written straight to the node by the rAF loop. If these were React state
    // the component would re-render on every pointer move.
    expect(wrapper!.style.getPropertyValue('--rx')).toMatch(/deg$/)
    expect(wrapper!.style.getPropertyValue('--mx')).toMatch(/%$/)
    expect(wrapper!.style.getPropertyValue('--sx')).toMatch(/px$/)
  })

  it('writes the tilt above both the shadow and the rotation', async () => {
    const { container } = render(<BusinessCard />)
    const wrapper = container.querySelector<HTMLElement>('.card-drop')

    await nextFrame()
    await nextFrame()

    /*
     * The cast shadow sits on .card-drop and the rotation on .card. Custom
     * properties only inherit downward, so writing them to .card would leave
     * the shadow unable to read them — which is the bug where the card tilted
     * and its shadow stayed put.
     */
    expect(wrapper!.contains(container.querySelector('.card'))).toBe(true)
    expect(container.querySelector<HTMLElement>('.card')!.style.getPropertyValue('--rx')).toBe('')
  })

  it('leaves the card completely still under prefers-reduced-motion', async () => {
    stubMatchMedia(true)
    const { container } = render(<BusinessCard />)
    const wrapper = container.querySelector<HTMLElement>('.card-drop')

    await nextFrame()
    await nextFrame()

    // No loop started, so nothing was ever written.
    expect(wrapper!.style.getPropertyValue('--rx')).toBe('')
    expect(wrapper!.style.getPropertyValue('--mx')).toBe('')
    expect(wrapper!.style.getPropertyValue('--sx')).toBe('')
  })
})
