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
  linkedin: { label: 'linkedin.com/in/dafandikri', href: 'https://www.linkedin.com/in/dafandikri/' },
  email: { label: 'dafandikri@gmail.com', href: 'mailto:dafandikri@gmail.com' },

  affiliation: {
    name: 'Universitas Indonesia',
    detail: 'Majoring in Computer Science',
  },

  name: 'Erdafa Andikri',
  role: 'Software Engineer',

  footer: [
    [
      { label: 'dafandikri.dev', href: 'https://dafandikri.dev' },
      /*
       * Stacked under the domain: the card is the whole landing scene, so this
       * is the only route to the CV for a recruiter who never scrolls — which is
       * most of them.
       *
       * `public/` is published verbatim, so the filename becomes a URL anyone
       * can read. This one is safe to expose because it names no employer —
       * an earlier draft was titled for the company it was tailored to, which
       * would have leaked that targeting to every other reader.
       */
      { label: 'Résumé', href: '/cv-erdafa-andikri-portfolio-2026-08-22.pdf' },
    ],
    [
      {
        label:
          'Solution Engineer Intern @ InterBio Technologies, Prev Start-Ups & Government Institutions',
        href: null,
      },
    ],
    [{ label: 'Jakarta, Indonesia', href: null }],
  ],
}
