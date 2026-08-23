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
    stage: 'Final pitch',
    members: [
      'Sultan Ibnu Mansiz',
      'Farrel Athalla Muljawan',
      'Erdafa Andikri',
      'Ivan Jehuda Angi',
      'Abhiseka Susanto',
    ],
    projectTitle: 'Talk-Active',
    story:
      'RISTEK is the student tech collective at Fasilkom UI, and its hackathon ends with a live pitch to the judges. Five of us went in as Team FAM against 37 teams, shipped Talk-Active, and came out with Best Presentation.',
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
      focusY: 62,
    },
    lesson: {
      title: 'What we missed',
      body:
        'We polished the demo and underprepared the business case: TAM, SAM and SOM. Now the product and the argument for it get built together.',
    },
    logo: 'ristek',
  },
  {
    title: 'Tech Wizard Award',
    event: 'PPL x Propensi 2026',
    host: 'Fakultas Ilmu Komputer, Universitas Indonesia',
    date: '4 June 2026',
    team: 'Kelompok C2',
    stage: 'Project exhibition',
    teamSize: 9,
    projectTitle: 'SIRA — Smart Invoice Reminder AI',
    story:
      'PPL is the software engineering project course at Fasilkom UI: one client, one semester, one system you actually have to hand over. Nine of us built SIRA as Kelompok C2 and took the Tech Wizard Award at the exhibition that closes it.',
    highlights: [
      'One semester · one real client',
      'Judged on engineering, not on the pitch',
    ],
    photo: {
      asset: 'team-sira-tech-wizard',
      alt: 'Kelompok C2 holding the Proyek Perangkat Lunak award certificate for SIRA at the PPL x Propensi exhibition',
      caption: 'SIRA · Kelompok C2 · 4 June 2026',
      width: 720,
      height: 960,
    },
    lesson: {
      title: 'What carried it',
      body:
        'The award went to the build, not the demo. A semester of tests, reviews and a clean handover is what a client can keep using after the team leaves.',
    },
    logo: 'sira',
  },
]
