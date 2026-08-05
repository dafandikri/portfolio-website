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

  it('offers a dialable phone number and a sendable address', () => {
    expect(card.phone.href).toMatch(/^tel:\+?[\d]+$/)
    expect(card.email.href).toMatch(/^mailto:.+@.+\..+$/)
  })

  /*
   * The point is that nothing resolves relative to whatever path the visitor
   * happens to be on. A root-relative href satisfies that as completely as an
   * absolute one, and is the right form for a file this site serves itself —
   * hard-coding the production origin would send local and preview builds to
   * the live domain.
   */
  it('gives every footer link an unambiguous destination', () => {
    for (const field of card.footer) {
      if (field.href !== null) {
        expect(field.href).toMatch(/^(https:\/\/|\/)/)
      }
    }
  })

  it('keeps the footer short enough to sit on one printed rule', () => {
    // Five or more fields overflow the bottom rule at desktop widths.
    expect(card.footer.length).toBeLessThanOrEqual(4)
  })
})
