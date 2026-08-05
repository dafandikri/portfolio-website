import boulderProject from '../../assets/img/boulder_project.webp'
import boulderProjectLandscape from '../../assets/img/boulder_project_landscape.webp'
import interbioProject from '../../assets/img/interbio_project.webp'
import interbioProjectLandscape from '../../assets/img/interbio_project_landscape.webp'
import portfolioProject from '../../assets/img/portfolio_project.webp'
import portfolioProjectLandscape from '../../assets/img/portfolio_project_landscape.webp'
import siraProject from '../../assets/img/sira_project.webp'
import siraProjectLandscape from '../../assets/img/sira_project_landscape.webp'

export type ProjectMedia =
  | { kind: 'image'; src: string; fullSrc?: string; alt: string }
  | { kind: 'video'; src: string; poster?: string; label: string }

/**
 * Media stays separate from portfolio copy so replacing a still with an MP4 or
 * WebM never changes the project schema. The enclosure uses a purpose-made 16:9
 * crop while `fullSrc` preserves the original tall project record.
 */
const PROJECT_MEDIA: Readonly<Record<string, ProjectMedia>> = {
  sira_project: {
    kind: 'image',
    src: siraProjectLandscape,
    fullSrc: siraProject,
    alt: 'SIRA invoice risk dashboard',
  },
  boulder_project: {
    kind: 'image',
    src: boulderProjectLandscape,
    fullSrc: boulderProject,
    alt: 'Boulder Coach training dashboard',
  },
  portfolio_project: {
    kind: 'image',
    src: portfolioProjectLandscape,
    fullSrc: portfolioProject,
    alt: 'Portfolio website interface',
  },
  interbio_project: {
    kind: 'image',
    src: interbioProjectLandscape,
    fullSrc: interbioProject,
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
