import type { Contact } from './schema'

/**
 * The end-credit block: the only place the site collects every way to reach a
 * person, and the last thing a visitor sees.
 *
 * Ordered by how a stranger actually makes contact rather than by how the
 * owner ranks the services. A recruiter writes or opens LinkedIn; a peer opens
 * the source; the CV is the artifact either of them forwards to someone else.
 *
 * The phone number that used to sit on the card is deliberately absent. Nothing
 * here should invite a call from a stranger who has not written first.
 */
export const contact: readonly Contact[] = [
  {
    role: 'Written to',
    label: 'dafandikri@gmail.com',
    href: 'mailto:dafandikri@gmail.com',
    external: false,
  },
  {
    role: 'Connected with',
    label: 'linkedin.com/in/dafandikri',
    href: 'https://www.linkedin.com/in/dafandikri/',
    external: true,
  },
  {
    role: 'Read in full',
    label: 'github.com/dafandikri',
    href: 'https://github.com/dafandikri',
    external: true,
  },
  {
    role: 'Printed as',
    label: 'Curriculum vitae (PDF)',
    href: '/cv-erdafa-andikri-portfolio-2026-08-22.pdf',
    external: false,
  },
]
