import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fullTitle, timeline } from '../data/timeline'
import ExperienceDeck from './ExperienceDeck'

afterEach(cleanup)

describe('ExperienceDeck company links', () => {
  it('prints every role on its card before a visitor selects it', () => {
    render(<ExperienceDeck selectedId="" onSelect={vi.fn()} />)

    for (const stop of timeline) {
      const button = screen.getByRole('button', { name: fullTitle(stop.entry) })
      expect(within(button).getByText(stop.entry.role)).toBeVisible()
    }
  })

  it('renders each requested company as a native external link beside, not inside, its card button', () => {
    render(<ExperienceDeck selectedId="" onSelect={vi.fn()} />)

    const expectedLogoFiles: Readonly<Record<string, string>> = {
      '2026-06': 'totm.png',
      '2026-01': 'systatum.png',
      '2025-07': 'kementrans.png',
      '2025-08': 'vicii-transparent.png',
      '2024-06': 'interbio.png',
      '2023-01': 'ristek.png',
    }
    const linkedStops = timeline.filter((stop) => stop.entry.company !== undefined)
    expect(linkedStops).toHaveLength(6)

    for (const stop of linkedStops) {
      const company = stop.entry.company!
      const linkName = company.linkName ?? company.name
      const button = screen.getByRole('button', { name: fullTitle(stop.entry) })
      const card = button.closest('.deck__card')!
      const link = within(card as HTMLElement).getByRole('link', {
        name: `Visit ${linkName} (opens in a new tab)`,
      })

      expect(button.contains(link)).toBe(false)
      expect(link).toHaveAttribute('href', company.href)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link.getAttribute('rel')).toContain('noopener')
      expect(link).toHaveTextContent(company.label)

      const logo = link.querySelector('img')
      expect(logo).not.toBeNull()
      expect(logo).toHaveAttribute('alt', '')
      expect(logo).toHaveAttribute('aria-hidden', 'true')
      expect(logo?.getAttribute('src')).toContain(expectedLogoFiles[stop.entry.id])
    }
  })

  it('keeps company navigation independent from selecting an experience card', () => {
    const onSelect = vi.fn()
    render(<ExperienceDeck selectedId="" onSelect={onSelect} />)

    const stop = timeline.find((candidate) => candidate.entry.company !== undefined)!
    const company = stop.entry.company!
    const linkName = company.linkName ?? company.name
    const button = screen.getByRole('button', { name: fullTitle(stop.entry) })
    const card = button.closest('.deck__card') as HTMLElement
    const link = within(card).getByRole('link', {
      name: `Visit ${linkName} (opens in a new tab)`,
    })
    link.addEventListener('click', (event) => event.preventDefault(), { once: true })

    fireEvent.click(link)
    expect(onSelect).not.toHaveBeenCalled()

    fireEvent.click(button)
    expect(onSelect).toHaveBeenCalledOnce()
    expect(onSelect).toHaveBeenCalledWith(stop.entry.id)
  })
})
