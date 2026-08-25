import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { projectsData } from '../../data/projects'
import type { Project } from '../../data/schema'
import { useInView } from '../../hooks/useInView'
import boulderCoachLogo from '../../assets/img/favicon/boulder-coach.svg'
import interbioLogo from '../../assets/img/favicon/interbio.png'
import siraLogo from '../../assets/img/favicon/sira.png'
import talkActiveLogo from '../../assets/img/favicon/talkactive.png'
import KatoPerch from '../KatoPerch'
import { projectCardTitle, projectMedia, type ProjectMedia } from './projectMedia'
import './ParkScene.css'

type ContainmentStyle = CSSProperties & Record<`--${string}`, string>

export function ProjectMediaView({
  media,
  mode = 'preview',
  active = true,
  startAt = 0,
}: {
  media: ProjectMedia | null
  mode?: 'preview' | 'detail'
  active?: boolean
  startAt?: number
}) {
  const [videoRef, inView] = useInView<HTMLVideoElement>('240px')
  const [videoStatus, setVideoStatus] = useState<'loading' | 'playing' | 'paused' | 'error'>('loading')
  const autoPlayAttemptedRef = useRef(false)

  useEffect(() => {
    if (media?.kind !== 'video') return
    const video = videoRef.current
    if (!video) return

    const shouldPlay = mode === 'detail' || (active && inView)
    if (shouldPlay) return
    // A preview that leaves the viewport is deliberately unloaded. Reset only
    // that automatic attempt so it can start again on re-entry; detail mode
    // never reaches this branch, so a visitor's explicit pause is respected.
    autoPlayAttemptedRef.current = false
    if (!video.currentSrc && !video.getAttribute('src')) return
    video.pause()
    video.removeAttribute('src')
    video.load()
  }, [active, inView, media, mode, videoRef])

  useEffect(() => {
    if (media?.kind !== 'video') return
    autoPlayAttemptedRef.current = false
    setVideoStatus('loading')
  }, [media, mode])

  if (!media) {
    return (
      <span className="park__media-placeholder" aria-label="Project media not added yet">
        Feed unavailable
      </span>
    )
  }

  if (mode === 'preview' && media.kind === 'image') {
    return (
      <img
        className="park__media-file park__media-file--preview"
        src={media.src}
        alt=""
        loading="lazy"
        decoding="async"
      />
    )
  }

  if (media.kind === 'video') {
    const shouldLoad = mode === 'detail' || (active && inView)
    /* The optimized recording has the same duration as the HD source and is
       small enough to begin inside the dossier instead of leaving its poster
       on screen while several megabytes arrive. The full recording remains a
       direct link below the player. */
    const source = media.previewSrc ?? media.src

    return (
      <>
        <video
          ref={videoRef}
          className={`park__media-file park__media-file--${mode}`}
          src={shouldLoad ? source : undefined}
          poster={media.poster}
          aria-label={media.label}
          autoPlay
          loop
          muted
          playsInline
          controls={mode === 'detail'}
          controlsList={mode === 'detail' ? 'nofullscreen noremoteplayback' : undefined}
          disablePictureInPicture={mode === 'detail'}
          disableRemotePlayback={mode === 'detail'}
          preload={mode === 'detail' ? 'auto' : 'none'}
          onLoadedMetadata={(event) => {
            if (mode === 'detail' && startAt > 0) event.currentTarget.currentTime = startAt
          }}
          onCanPlay={(event) => {
            if (autoPlayAttemptedRef.current) return
            autoPlayAttemptedRef.current = true
            void event.currentTarget.play().catch(() => setVideoStatus('paused'))
          }}
          onPlaying={() => setVideoStatus('playing')}
          onPause={() => setVideoStatus('paused')}
          onError={() => setVideoStatus('error')}
        />

        {mode === 'detail' && videoStatus !== 'playing' ? (
          <button
            type="button"
            className="park__media-play"
            aria-label={videoStatus === 'error' ? 'Walkthrough video unavailable' : 'Play project walkthrough'}
            disabled={videoStatus === 'error'}
            onClick={() => {
              const video = videoRef.current
              if (!video) return
              void video.play().catch(() => setVideoStatus('error'))
            }}
          >
            {videoStatus === 'loading'
              ? 'Loading walkthrough…'
              : videoStatus === 'error'
                ? 'Video unavailable'
                : 'Play walkthrough'}
          </button>
        ) : null}
      </>
    )
  }

  return (
    <img
      className={`park__media-file park__media-file--${mode}`}
      src={media.src}
      alt={media.alt}
      loading="eager"
      decoding="async"
    />
  )
}

function projectTarget(link: string) {
  return link.startsWith('http') ? { target: '_blank', rel: 'noreferrer noopener' } : {}
}

interface ProjectLogo {
  src: string
  label: string
}

const PROJECT_LOGOS: Readonly<Partial<Record<string, ProjectLogo>>> = {
  sira_project: { src: siraLogo, label: 'SIRA' },
  boulder_project: { src: boulderCoachLogo, label: 'Boulder Coach' },
  talkactive_project: { src: talkActiveLogo, label: 'Talk-Active' },
  portfolio_project: { src: '/favicon.svg', label: 'Erdafa Andikri portfolio' },
  interbio_project: { src: interbioLogo, label: 'Interbio' },
}

function ProjectLogoPlaque({ project, placement }: {
  project: Project
  placement: 'paddock' | 'detail'
}) {
  const logo = PROJECT_LOGOS[project.image]
  if (!logo) return null

  const className = `park__project-logo park__project-logo--${placement} ${
    project.liveLink === '#' ? 'park__project-logo--static' : 'park__project-logo--linked'
  }`
  const image = <img src={logo.src} alt={project.liveLink === '#' ? `${logo.label} logo` : ''} />

  /* SIRA is a real product identity but its deployment is intentionally private.
     Keeping the plaque as a span communicates the identity without inventing a
     public destination. Every live product gets a native sibling anchor. */
  if (project.liveLink === '#') {
    return <span className={className} title={`${logo.label} · private product`}>{image}</span>
  }

  return (
    <a
      className={className}
      href={project.liveLink}
      {...projectTarget(project.liveLink)}
      aria-label={`Visit ${logo.label} (opens in a new tab)`}
      title={`Visit ${logo.label}`}
    >
      {image}
    </a>
  )
}

function ProjectLinks({ project }: { project: Project }) {
  /* The identity plaque is the one live-product destination in both views.
     Repeating the same URL as “Open live app” beneath it made the dossier offer
     two controls for one action. This row now exists only for source access. */
  if (project.repoLink === '#') return null

  return (
    <p className="park__links">
      <a className="park__link" href={project.repoLink} {...projectTarget(project.repoLink)}>
        <svg className="park__source-icon" viewBox="0 0 18 18" aria-hidden="true">
          <path d="m6.2 4.2-4 4.8 4 4.8M11.8 4.2l4 4.8-4 4.8M10.5 2.5l-3 13" />
        </svg>
        Source
      </a>
    </p>
  )
}

const featuredProjects = projectsData.filter((project) => project.featured)
const archivedProjects = projectsData.filter((project) => !project.featured)
export const PADDOCK_OPEN_MS = 120

/**
 * Four full containment paddocks replace the old overlapping card hand.
 * Every featured project remains visible inside a timber-and-steel paddock.
 * The enclosures sit in the same lush visitor-park world as the rest of the
 * island rather than reading as windows inside a computer interface.
 */
export default function ParkScene() {
  const [openingIndex, setOpeningIndex] = useState<number | null>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [detailStartAt, setDetailStartAt] = useState(0)
  const detailRef = useRef<HTMLElement>(null)
  const openingTimerRef = useRef<number | null>(null)
  const openingVideoRef = useRef<HTMLVideoElement | null>(null)
  const openingTriggerRef = useRef<HTMLButtonElement | null>(null)
  const hadOpenPaddockRef = useRef(false)
  const openProject = openIndex === null ? null : featuredProjects[openIndex]!
  const openMedia = openProject ? projectMedia(openProject.image) : null

  const clearOpeningTimer = () => {
    if (openingTimerRef.current === null) return
    window.clearTimeout(openingTimerRef.current)
    openingTimerRef.current = null
  }

  const closePaddock = () => {
    clearOpeningTimer()
    setOpeningIndex(null)
    setOpenIndex(null)
  }

  const inspectPaddock = (index: number, button: HTMLButtonElement) => {
    if (openingIndex !== null || openIndex !== null) return

    const selectedMedia = projectMedia(featuredProjects[index]!.image)
    if (selectedMedia?.kind === 'video') {
      // Begin filling the HTTP cache while the physical gate opens. On a cold
      // visit this turns the transition time into useful loading time instead
      // of showing a frozen first frame after the dossier appears.
      void fetch(selectedMedia.previewSrc ?? selectedMedia.src, { cache: 'force-cache' })
        .catch(() => undefined)
    }

    openingTriggerRef.current = button
    openingVideoRef.current = button.querySelector('video')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      setDetailStartAt(openingVideoRef.current?.currentTime ?? 0)
      setOpenIndex(index)
      return
    }

    setOpeningIndex(index)
    openingTimerRef.current = window.setTimeout(() => {
      setDetailStartAt(openingVideoRef.current?.currentTime ?? 0)
      setOpenIndex(index)
      setOpeningIndex(null)
      openingTimerRef.current = null
    }, PADDOCK_OPEN_MS)
  }

  useEffect(() => {
    if (openIndex === null) return

    detailRef.current?.focus({ preventScroll: true })
    const containDialogFocus = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (openingTimerRef.current !== null) {
          window.clearTimeout(openingTimerRef.current)
          openingTimerRef.current = null
        }
        setOpeningIndex(null)
        setOpenIndex(null)
        return
      }

      if (event.key !== 'Tab' || !detailRef.current) return
      const focusable = Array.from(detailRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])',
      )).filter((element) => !element.hasAttribute('inert'))
      if (focusable.length === 0) {
        event.preventDefault()
        detailRef.current.focus({ preventScroll: true })
        return
      }

      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      if (event.shiftKey && (document.activeElement === first || document.activeElement === detailRef.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', containDialogFocus)
    return () => window.removeEventListener('keydown', containDialogFocus)
  }, [openIndex])

  useEffect(() => {
    if (openIndex === null) return

    const body = document.body
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    const lockedProperties = [
      'position',
      'top',
      'right',
      'left',
      'width',
      'overflow',
      'overscroll-behavior',
      'padding-right',
    ] as const
    const previousBodyStyles = lockedProperties.map((property) => ({
      property,
      value: body.style.getPropertyValue(property),
      priority: body.style.getPropertyPriority(property),
    }))

    /* Freezing the body keeps the dossier anchored to the selected paddock.
       Overflow alone is not enough on touch browsers, where the page can still
       rubber-band into the overlapping Awards runway behind the modal. */
    body.style.setProperty('position', 'fixed')
    body.style.setProperty('top', `${-scrollY}px`)
    body.style.setProperty('left', `${-scrollX}px`)
    body.style.setProperty('right', '0')
    body.style.setProperty('width', '100%')
    body.style.setProperty('overflow', 'hidden')
    body.style.setProperty('overscroll-behavior', 'none')

    const viewportWidth = document.documentElement.clientWidth
    const scrollbarWidth = viewportWidth > 0 ? Math.max(0, window.innerWidth - viewportWidth) : 0
    if (scrollbarWidth > 0) {
      const bodyPadding = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0
      body.style.setProperty('padding-right', `${bodyPadding + scrollbarWidth}px`)
    }

    return () => {
      previousBodyStyles.forEach(({ property, value, priority }) => {
        if (value) body.style.setProperty(property, value, priority)
        else body.style.removeProperty(property)
      })
      /* Hash navigation has its own cinematic easing. Dossier cleanup is not
         navigation: restore the locked paddock frame synchronously so closing
         never looks like a second page scroll. */
      const root = document.documentElement
      const previousScrollBehavior = root.style.getPropertyValue('scroll-behavior')
      const previousScrollBehaviorPriority = root.style.getPropertyPriority('scroll-behavior')
      root.style.setProperty('scroll-behavior', 'auto', 'important')
      window.scrollTo(scrollX, scrollY)
      if (previousScrollBehavior) {
        root.style.setProperty(
          'scroll-behavior',
          previousScrollBehavior,
          previousScrollBehaviorPriority,
        )
      } else {
        root.style.removeProperty('scroll-behavior')
      }
    }
  }, [openIndex])

  useEffect(() => {
    if (openIndex !== null) {
      hadOpenPaddockRef.current = true
      return
    }
    if (!hadOpenPaddockRef.current) return
    hadOpenPaddockRef.current = false
    openingTriggerRef.current?.focus({ preventScroll: true })
  }, [openIndex])

  useEffect(() => () => {
    if (openingTimerRef.current !== null) window.clearTimeout(openingTimerRef.current)
  }, [])

  return (
    <section
      id="projects"
      className={`park${openProject ? ' is-inspecting' : ''}`}
      aria-labelledby="projects-heading"
    >
      <header className="park__header">
        <p className="park__kicker">Isla Nublar · Night Containment Zone</p>
        <h2 id="projects-heading" className="park__heading" aria-label="Projects">
          Project Paddocks
        </h2>
      </header>

      <ul className="park__grid" aria-label="Featured project paddocks">
        {featuredProjects.map((project, index) => {
          const isOpen = openIndex === index
          const isOpening = openingIndex === index
          const media = projectMedia(project.image)
          const style: ContainmentStyle = { '--deploy-delay': `${index * 90}ms` }

          return (
            <li
              key={project.title}
              className={`park__containment${isOpen ? ' is-open' : ''}${isOpening ? ' is-opening' : ''}`}
              style={style}
            >
              <button
                type="button"
                className="park__containment-unit"
                aria-label={`${project.title}, project ${String(index + 1).padStart(2, '0')}`}
                aria-expanded={isOpen || isOpening}
                aria-busy={isOpening}
                onClick={(event) => inspectPaddock(index, event.currentTarget)}
              >
                <span className="park__lintel">
                  <span className="park__hazard" aria-hidden="true" />
                  <span className="park__serial">Project {String(index + 1).padStart(2, '0')}</span>
                </span>

                <span className="park__cell">
                  <span className="park__media">
                    <ProjectMediaView media={media} active={openIndex === null} />
                    <span className="park__scan" aria-hidden="true" />
                    <span className="park__feed" aria-hidden="true">Surveillance feed</span>
                  </span>
                  <span className="park__fence" aria-hidden="true">
                    {Array.from({ length: 9 }, (_, bar) => <i key={bar} />)}
                    <b />
                    <b />
                  </span>
                </span>

                <span className="park__control-box">
                  <span className="park__status">
                    <span className="park__lamp" aria-hidden="true" />
                    {isOpening ? 'Opening' : isOpen ? 'Access' : 'Secure'}
                  </span>
                  <span className="park__keypad" aria-hidden="true">
                    {Array.from({ length: 6 }, (_, key) => <i key={key} />)}
                  </span>
                </span>

                <span className="park__sill">
                  <span className="park__plaque-copy">
                    <strong>{projectCardTitle(project.title)}</strong>
                    <small>{project.context}</small>
                  </span>
                  <span className="park__year">{project.year}</span>
                </span>

                <span className="park__pylons" aria-hidden="true"><i /><i /></span>
              </button>
              <ProjectLogoPlaque project={project} placement="paddock" />
              {/* Rendered after the button on purpose: the hover rule that
                  changes his pose uses a general sibling combinator. */}
              {project.title === 'Talk-Active' && <KatoPerch />}
            </li>
          )
        })}
      </ul>

      <details className="park__archive">
        <summary>Archive projects <span>{String(archivedProjects.length).padStart(2, '0')}</span></summary>
        <ul>
          {archivedProjects.map((project) => (
            <li key={project.title}>
              <strong>{project.title}</strong>
              <small>{project.year} · {project.context}</small>
            </li>
          ))}
        </ul>
      </details>

      {openProject && openIndex !== null && (
        <>
          <button
            type="button"
            className="park__detail-backdrop"
            aria-label="Close project details"
            tabIndex={-1}
            onClick={closePaddock}
          />
          <article
            ref={detailRef}
            className="park__detail"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-detail-title"
            tabIndex={-1}
          >
            <button type="button" className="park__detail-close" onClick={closePaddock}>
              Return to paddocks
            </button>

            <div className="park__detail-media">
              <p className="park__detail-feed-label">
                Project {String(openIndex + 1).padStart(2, '0')} // Full surveillance record
              </p>
              <div className="park__detail-viewport">
                <ProjectMediaView media={openMedia} mode="detail" startAt={detailStartAt} />
                <span className="park__detail-scan" aria-hidden="true" />
              </div>
              {openMedia ? (
                <a
                  className="park__media-expand"
                  href={openMedia.src}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={openMedia.kind === 'video'
                    ? 'Open HD walkthrough video in a new tab'
                    : 'Open full project preview in a new tab'}
                >
                  {openMedia.kind === 'video' ? (
                    <svg className="park__media-link-icon" viewBox="0 0 18 18" aria-hidden="true">
                      <rect x="1.8" y="3" width="14.4" height="12" rx="1.5" />
                      <path className="park__media-play-glyph" d="m7.4 6.4 4.4 2.6-4.4 2.6Z" />
                    </svg>
                  ) : (
                    <svg className="park__media-link-icon" viewBox="0 0 18 18" aria-hidden="true">
                      <path d="M7 3H3v4M11 3h4v4M7 15H3v-4M11 15h4v-4" />
                    </svg>
                  )}
                  {openMedia.kind === 'video' ? 'HD video' : 'Full preview'}
                </a>
              ) : null}
            </div>

            <div className="park__detail-copy">
              <div className="park__detail-heading-row">
                <div>
                  <p className="park__detail-index">Containment file // Access granted · {openProject.year}</p>
                  <h3 id="project-detail-title" className="park__detail-title">{openProject.title}</h3>
                  <p className="park__detail-context">{openProject.context}</p>
                </div>
                <ProjectLogoPlaque project={openProject} placement="detail" />
              </div>
              <p className="park__detail-text">{openProject.description}</p>
              <p className="park__detail-section-label">Field notes</p>
              <ul className="park__features" aria-label="Project features">
                {openProject.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <ul className="park__chips" aria-label="Technology stack">
                {openProject.techStack.map((tech) => <li key={tech} className="park__chip">{tech}</li>)}
              </ul>
              <ProjectLinks project={openProject} />
            </div>
          </article>
        </>
      )}
    </section>
  )
}
