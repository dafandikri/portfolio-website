import type { Card } from './schema'

/**
 * The business card — as of v2 this is the entire site, so every word here is
 * user-facing and every `href` is one of the only ways off the page.
 *
 * The layout mirrors the Pierce & Pierce cards from American Psycho: contact
 * details top left, trade top right, name centred, title beneath it, and a dense
 * rule of small caps along the bottom where the movie's cards print the street
 * address, fax, and telex.
 *
 * Unlike the other content files this one is not parsed through Zod at runtime.
 * It is a typed literal, so the compiler already rejects a malformed version,
 * and card.test.ts plus scripts/validate-data.ts re-check it against cardSchema
 * in CI. Parsing it again in the visitor's browser could only ever succeed, at
 * the cost of shipping the whole validation runtime to render six strings.
 */
export const card: Card = {
  phone: { label: '+62 821 2277 6141', href: 'tel:+6282122776141' },
  email: { label: 'dafandikri@gmail.com', href: 'mailto:dafandikri@gmail.com' },

  // Bateman's card reads "MERGERS AND ACQUISITIONS", which the film sets against
  // his "murders and executions". A developer merges branches.
  industry: 'Merges and Acquisitions',

  name: 'Erdafa Andikri',
  role: 'Software Engineer',

  footer: [
    { label: 'dafandikri.tech', href: 'https://dafandikri.tech' },
    { label: 'github/dafandikri', href: 'https://github.com/dafandikri' },
    // PLACEHOLDER — confirm the handle resolves before shipping.
    { label: 'linkedin/dafandikri', href: 'https://linkedin.com/in/dafandikri' },
    { label: 'Jakarta, ID', href: null },
  ],
}
