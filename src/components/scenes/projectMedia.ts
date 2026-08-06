import siraProjectLandscape from '../../assets/img/sira_project_landscape.webp'

export type ProjectMedia =
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'video'; src: string; poster?: string; label: string }

/**
 * Media stays separate from portfolio copy so replacing a still with an MP4 or
 * WebM never changes the project schema. Walkthroughs play directly inside the
 * closed paddocks, then mount at their full aspect ratio in the selected record.
 */
const PROJECT_MEDIA: Readonly<Record<string, ProjectMedia>> = {
  sira_project: {
    kind: 'video',
    src: '/sira-promo-2k-60fps.mp4',
    poster: siraProjectLandscape,
    label: 'SIRA product walkthrough',
  },
  boulder_project: {
    kind: 'image',
    src: '/Cap%202026-08-06%20at%2014.13.53.gif',
    alt: 'Boulder Coach complete product walkthrough',
  },
  portfolio_project: {
    kind: 'image',
    src: '/Cap%202026-08-06%20at%2014.00.45.gif',
    alt: 'Personal portfolio website complete walkthrough',
  },
  interbio_project: {
    kind: 'image',
    src: '/Cap%202026-08-06%20at%2015.08.58.gif',
    alt: 'Archived 2024 Interbio website redesign walkthrough',
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
