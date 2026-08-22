import type { Contact } from './schema'

/**
 * The end-credit block: the only place the site collects every way to reach a
 * person, and the last thing a visitor sees.
 *
 * Ordered by how a stranger actually makes contact rather than by how the
 * owner ranks the services. A recruiter writes or opens LinkedIn; a peer opens
 * the source; the CV is the artifact either of them forwards to someone else.
 *
 * `role` is the slate field name. Terse and literal on purpose: a field on a
 * real slate says PROD or TAKE, and a control that names its own destination
 * is also the thing a visitor can scan without reading the value first.
 *
 * The phone number that used to sit on the card is deliberately absent. Nothing
 * here should invite a call from a stranger who has not written first.
 */
export const contact: readonly Contact[] = [
  {
    role: 'Email',
    label: 'dafandikri@gmail.com',
    href: 'mailto:dafandikri@gmail.com',
    external: false,
  },
  {
    role: 'LinkedIn',
    label: 'linkedin.com/in/dafandikri',
    href: 'https://www.linkedin.com/in/dafandikri/',
    external: true,
  },
  {
    role: 'GitHub',
    label: 'github.com/dafandikri',
    href: 'https://github.com/dafandikri',
    external: true,
  },
  {
    role: 'Resume',
    label: 'Curriculum vitae (PDF)',
    href: '/cv-erdafa-andikri-portfolio-2026-08-22.pdf',
    external: false,
  },
]
