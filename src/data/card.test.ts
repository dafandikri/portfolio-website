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

  it('gives every footer link an absolute destination', () => {
    for (const field of card.footer) {
      if (field.href !== null) {
        expect(field.href).toMatch(/^https:\/\//)
      }
    }
  })

  it('keeps the footer short enough to sit on one printed rule', () => {
    // Five or more fields overflow the bottom rule at desktop widths.
    expect(card.footer.length).toBeLessThanOrEqual(4)
  })
})
