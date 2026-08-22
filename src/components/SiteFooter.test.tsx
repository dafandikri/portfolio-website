import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import SiteFooter from './SiteFooter'
import { contact } from '../data/contact'
import { contactsSchema } from '../data/schema'

afterEach(cleanup)

describe('SiteFooter', () => {
  it('validates the contact block against its schema', () => {
    expect(contactsSchema.safeParse(contact).success).toBe(true)
  })

  it('is a landmark with an accessible name', () => {
    render(<SiteFooter />)

    expect(screen.getByRole('contentinfo', { name: 'Erdafa Andikri' })).toBeInTheDocument()
  })

  it('shows every route out of the site at once, none behind a toggle', () => {
    const { container } = render(<SiteFooter />)

    // Recognition over recall: a visitor should not have to open anything.
    expect(container.querySelectorAll('.slate__row')).toHaveLength(contact.length)
    expect(container.querySelector('details')).toBeNull()
    for (const line of contact) {
      expect(screen.getByRole('link', { name: new RegExp(line.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }))
        .toHaveAttribute('href', line.href)
    }
  })

  it('names each field the way a slate does, against its value', () => {
    const { container } = render(<SiteFooter />)

    const roles = [...container.querySelectorAll('.slate__row .slate__field')]
      .map((n) => n.textContent)
    expect(roles).toEqual(contact.map((line) => line.role))
  })

  it('opens external destinations safely and announces that they leave', () => {
    render(<SiteFooter />)

    for (const line of contact.filter((c) => c.external)) {
      const link = screen.getByRole('link', { name: new RegExp(line.label.replace(/\./g, '\\.')) })
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noreferrer noopener')
      expect(within(link).getByText(/opens in a new tab/)).toBeInTheDocument()
    }
  })

  it('keeps same-tab destinations out of the new-tab contract', () => {
    render(<SiteFooter />)

    const email = screen.getByRole('link', { name: /dafandikri@gmail\.com/ })
    expect(email).not.toHaveAttribute('target')
    expect(email.getAttribute('href')).toMatch(/^mailto:/)
  })

  it('names the CV as a PDF so the visitor knows what they are opening', () => {
    render(<SiteFooter />)

    const cv = screen.getByRole('link', { name: /Curriculum vitae \(PDF\)/ })
    expect(cv.getAttribute('href')).toMatch(/\.pdf$/)
  })

  it('builds the slate rather than drawing a label of one', () => {
    const { container } = render(<SiteFooter />)

    // Two halves of one stick plus the pin they turn on.
    expect(container.querySelector('.slate__arm')).not.toBeNull()
    expect(container.querySelector('.slate__jaw')).not.toBeNull()
    expect(container.querySelector('.slate__hinge')).not.toBeNull()
    expect(container.querySelectorAll('.slate__teeth')).toHaveLength(2)
    // The clapper is scenery; it must not reach a screen reader.
    expect(container.querySelector('.slate__clap')).toHaveAttribute('aria-hidden', 'true')
  })

  it('does not publish a phone number', () => {
    const { container } = render(<SiteFooter />)

    expect(container.innerHTML).not.toMatch(/tel:/)
  })
})
