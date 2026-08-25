import { describe, it, expect } from 'vitest'
import { card } from './card'
import { cardSchema } from './schema'

/**
 * card.ts is not parsed through Zod at runtime — see the note in that file. The
 * schema guarantee is enforced here and in scripts/validate-data.ts instead, so
 * a malformed card fails CI rather than shipping the validator to browsers.
 */
describe('card content', () => {
  it('satisfies the card schema', () => {
    expect(() => cardSchema.parse(card)).not.toThrow()
  })

  it('offers a reachable LinkedIn profile and a sendable address', () => {
    expect(card.linkedin.label).toBe('LinkedIn')
    expect(card.email.label).toBe('dafandikri@gmail.com')
    expect(card.linkedin.href).toMatch(/^https:\/\/www\.linkedin\.com\/in\/[\w-]+\/?$/)
    expect(card.email.href).toMatch(/^mailto:.+@.+\..+$/)
  })

  it('replaces the redundant self-link with the owner GitHub profile', () => {
    const linkedFields = card.footer.flat().filter((field) => field.href !== null)
    const github = linkedFields.find((field) => field.label === 'GitHub')

    expect(github?.href).toBe('https://github.com/dafandikri')
    expect(linkedFields.some((field) => field.href === 'https://dafandikri.dev')).toBe(false)
  })

  /*
   * The point is that nothing resolves relative to whatever path the visitor
   * happens to be on. A root-relative href satisfies that as completely as an
   * absolute one, and is the right form for a file this site serves itself —
   * hard-coding the production origin would send local and preview builds to
   * the live domain.
   */
  it('gives every footer link an unambiguous destination', () => {
    for (const field of card.footer.flat()) {
      if (field.href !== null) {
        expect(field.href).toMatch(/^(https:\/\/|\/)/)
      }
    }
  })

  it('keeps the footer short enough to sit on one printed rule', () => {
    // Four or more columns overflow the bottom rule at desktop widths; the
    // limit is on columns, not lines, since a column stacks.
    expect(card.footer.length).toBeLessThanOrEqual(3)
  })

  it('publishes the résumé from the card, since it is the whole landing scene', () => {
    const hrefs = card.footer.flat().map((field) => field.href)
    expect(hrefs).toContain('/cv-erdafa-andikri-portfolio-2026-08-22.pdf')
  })
})
