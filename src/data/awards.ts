import type { Award } from './schema'

/**
 * Awards. Edit THIS file to add a result.
 * Validated at load time against awardsSchema (see ./index.ts), including a
 * check that every `projectTitle` names a real project.
 *
 * This is the only place competition results belong. A project's own entry
 * describes the product and nothing else; an award reaches across to it.
 */
export const awardsData: Award[] = [
  {
    title: 'Best Presentation',
    event: 'RISTEK Hackathon 2026',
    host: 'Fakultas Ilmu Komputer, Universitas Indonesia',
    date: '14 August 2026',
    team: 'Team FAM',
    members: [
      'Sultan Ibnu Mansiz',
      'Farrel Athalla Muljawan',
      'Erdafa Andikri',
      'Ivan Jehuda Angi',
      'Abhiseka Susanto',
    ],
    projectTitle: 'Talk-Active',
    story:
      'Team FAM built Talk-Active over the course of the competition and presented it at the finals. The award was for the pitch itself, judged on the same kind of rubric the product exists to rehearse: a tool for defending claims under questioning, defended under questioning.',
    highlights: [
      'Best Presentation at the RISTEK Hackathon 2026 finals, Fasilkom UI',
      'A five-person team; a 6:35 pitch with a 2:15 live demo driven from a separate operator machine',
      'Judged against a published finals rubric covering problem, solution, innovation, technical depth, design and Q&A',
      'Demonstrated live on production, including the degraded offline path',
    ],
    logo: 'ristek',
  },
]
