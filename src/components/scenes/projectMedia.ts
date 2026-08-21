import siraProjectLandscape from '../../assets/img/sira_project_landscape.webp'
import boulderProjectLandscape from '../../assets/img/boulder_project_landscape.webp'
import portfolioProjectLandscape from '../../assets/img/portfolio_project_landscape.webp'
import interbioProjectLandscape from '../../assets/img/interbio_project_landscape.webp'
import talkactiveProjectLandscape from '../../assets/img/talkactive_project_landscape.webp'

export type ProjectMedia =
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'video'; src: string; previewSrc?: string; poster?: string; label: string }

/**
 * Media stays separate from portfolio copy so replacing a still with an MP4 or
 * WebM never changes the project schema. Walkthroughs play directly inside the
 * closed paddocks, then mount at their full aspect ratio in the selected record.
 */
const PROJECT_MEDIA: Readonly<Record<string, ProjectMedia>> = {
  sira_project: {
    kind: 'video',
    src: '/sira-promo-2k-60fps.mp4',
    previewSrc: '/sira-preview.mp4',
    poster: siraProjectLandscape,
    label: 'SIRA product walkthrough',
  },
  boulder_project: {
    kind: 'video',
    src: '/boulder-coach-walkthrough.mp4',
    previewSrc: '/boulder-coach-preview.mp4',
    poster: boulderProjectLandscape,
    label: 'Boulder Coach complete product walkthrough',
  },
  // A still, not a clip: the walkthrough has not been recorded yet. Swapping
  // this one entry to `kind: 'video'` later changes nothing else.
  talkactive_project: {
    kind: 'image',
    src: talkactiveProjectLandscape,
    alt: 'Talk-Active rehearsal workspace showing a current project, its evaluator rubric and the next practice session',
  },
  portfolio_project: {
    kind: 'video',
    src: '/portfolio-walkthrough.mp4',
    previewSrc: '/portfolio-preview.mp4',
    poster: portfolioProjectLandscape,
    label: 'Personal portfolio website complete walkthrough',
  },
  interbio_project: {
    kind: 'video',
    src: '/interbio-walkthrough.mp4',
    previewSrc: '/interbio-preview.mp4',
    poster: interbioProjectLandscape,
    label: 'Archived 2024 Interbio website redesign walkthrough',
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
