import boulderProject from '../../assets/img/boulder_project.webp'
import interbioProject from '../../assets/img/interbio_project.webp'
import portfolioProject from '../../assets/img/portfolio_project.webp'
import siraProject from '../../assets/img/sira_project.webp'

export type ProjectMedia =
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'video'; src: string; poster?: string; label: string }

/**
 * Media stays separate from portfolio copy so replacing a still with an MP4 or
 * WebM never changes the project schema. Add a `video` entry here and the card
 * renderer automatically switches to a muted, looping preview.
 */
const PROJECT_MEDIA: Readonly<Record<string, ProjectMedia>> = {
  sira_project: {
    kind: 'image',
    src: siraProject,
    alt: 'SIRA invoice risk dashboard',
  },
  boulder_project: {
    kind: 'image',
    src: boulderProject,
    alt: 'Boulder Coach training dashboard',
  },
  portfolio_project: {
    kind: 'image',
    src: portfolioProject,
    alt: 'Portfolio website interface',
  },
  interbio_project: {
    kind: 'image',
    src: interbioProject,
    alt: 'Interbio website redesign',
  },
}

export function projectMedia(key: string): ProjectMedia | null {
  return PROJECT_MEDIA[key] ?? null
}

const SHORT_TITLES: Readonly<Record<string, string>> = {
  'SIRA — Smart Invoice Reminder AI': 'SIRA',
  'Boulder Coach': 'Boulder Coach',
  'Portfolio Website': 'Portfolio',
  'Interbio.id Website': 'Interbio.id',
  JagaRaga: 'JagaRaga',
  Solemates: 'Solemates',
  GeoBikunAlert: 'GeoBikun',
  DepeFood: 'DepeFood',
}

export function projectCardTitle(title: string): string {
  return SHORT_TITLES[title] ?? title
}
