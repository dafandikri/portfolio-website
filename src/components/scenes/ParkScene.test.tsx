import { act, cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { projectsData } from '../../data/projects'
import { stubIntersectionObserver } from '../../test/setup'
import ParkScene from './ParkScene'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

/** Mount the scene and bring it into view, which is what deals the signs. */
function enter() {
  const observers = stubIntersectionObserver()
  const result = render(<ParkScene />)
  const scene = result.container.querySelector('.scene--park')!
  act(() => observers[0]?.trigger(scene, true, 1))
  return result
}

describe('ParkScene', () => {
  it('does not mount the signs until the scene approaches', () => {
    const observers = stubIntersectionObserver()
    const { container } = render(<ParkScene />)

    // The heading is always there; the signs are the below-fold cost.
    expect(screen.getByRole('heading', { level: 2, name: 'Projects' })).toBeInTheDocument()
    expect(container.querySelectorAll('.park__sign')).toHaveLength(0)

    act(() =>
      observers[0]?.trigger(container.querySelector('.scene--park')!, true, 1),
    )
    expect(container.querySelectorAll('.park__sign')).toHaveLength(projectsData.length)
  })

  it('gives every project a sign that is reachable as a button', () => {
    enter()
    for (const project of projectsData) {
      expect(screen.getByRole('button', { name: new RegExp(project.title, 'i') })).toBeVisible()
    }
  })

  it('opens an enclosure and closes it again on a second press', () => {
    const { container } = enter()
    const target = projectsData[0]!
    const sign = screen.getByRole('button', { name: new RegExp(target.title, 'i') })

    expect(screen.getByText('Select an enclosure')).toBeInTheDocument()

    act(() => sign.click())
    expect(sign).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('heading', { level: 3, name: target.title })).toBeInTheDocument()
    expect(screen.getByText(target.description)).toBeInTheDocument()
    expect(container.querySelectorAll('.park__chip')).toHaveLength(target.techStack.length)

    // Pressing the open one again is a toggle, not a no-op.
    act(() => sign.click())
    expect(sign).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('Select an enclosure')).toBeInTheDocument()
  })

  it('prints a link only where the project actually has one', () => {
    enter()

    // "#" is the data's way of saying "nothing to link to yet", and a link that
    // goes nowhere is worse than no link.
    const withoutLinks = projectsData.find((p) => p.liveLink === '#' && p.repoLink === '#')
    const withRepo = projectsData.find((p) => p.repoLink !== '#')

    if (withoutLinks) {
      act(() => screen.getByRole('button', { name: new RegExp(withoutLinks.title, 'i') }).click())
      expect(screen.queryByRole('link', { name: 'Live' })).toBeNull()
      expect(screen.queryByRole('link', { name: 'Source' })).toBeNull()
    }

    if (withRepo) {
      act(() => screen.getByRole('button', { name: new RegExp(withRepo.title, 'i') }).click())
      const source = screen.getByRole('link', { name: 'Source' })
      expect(source).toHaveAttribute('href', withRepo.repoLink)
      expect(source).toHaveAttribute('target', '_blank')
      expect(source.getAttribute('rel')).toContain('noopener')
    }
  })

  it('opens an off-site live link in a new tab and keeps a routed one in place', () => {
    enter()
    const external = projectsData.find((p) => p.liveLink.startsWith('http'))
    const routed = projectsData.find((p) => p.liveLink !== '#' && !p.liveLink.startsWith('http'))

    if (external) {
      act(() => screen.getByRole('button', { name: new RegExp(external.title, 'i') }).click())
      expect(screen.getByRole('link', { name: 'Live' })).toHaveAttribute('target', '_blank')
    }

    if (routed) {
      act(() => screen.getByRole('button', { name: new RegExp(routed.title, 'i') }).click())
      // A same-site route must not open a second tab.
      expect(screen.getByRole('link', { name: 'Live' })).not.toHaveAttribute('target')
    }
  })

  it('credits the CC BY gate model, which the licence requires', () => {
    const { container } = enter()
    const credit = container.querySelector('.park__credit')!
    expect(within(credit as HTMLElement).getByText(/Mathzilla5335/)).toBeInTheDocument()
    expect(container.querySelectorAll('.park__credit-link[rel~="license"]').length).toBeGreaterThan(
      0,
    )
  })
})
