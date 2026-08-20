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
      'RISTEK is the student tech collective at Fasilkom UI, and its hackathon ends with a live pitch to the judges. Five of us went in as Team FAM, shipped Talk-Active, and came out with Best Presentation.',
    highlights: [
      '6:35 pitch · 2:15 live demo',
      'Production demo · offline fallback included',
    ],
    photo: {
      asset: 'team-fam-best-presentation',
      alt: 'Five members of Team FAM holding the Best Presentation board after the RISTEK Hackathon 2026 finals',
      caption: 'Talk-Active · Team FAM · 14 August 2026',
      width: 720,
      height: 960,
    },
    lesson: {
      title: 'What we missed',
      body:
        'We polished the demo and underprepared the business case: TAM, SAM and SOM. Now the product and the argument for it get built together.',
    },
    logo: 'ristek',
  },
]
