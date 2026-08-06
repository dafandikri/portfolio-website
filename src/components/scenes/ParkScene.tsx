import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { projectsData } from '../../data/projects'
import type { Project } from '../../data/schema'
import { projectCardTitle, projectMedia, type ProjectMedia } from './projectMedia'
import './ParkScene.css'

type ContainmentStyle = CSSProperties & Record<`--${string}`, string>

export function ProjectMediaView({
  media,
  mode = 'preview',
}: {
  media: ProjectMedia | null
  mode?: 'preview' | 'detail'
}) {
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
    return (
      <video
        className={`park__media-file park__media-file--${mode}`}
        src={media.src}
        poster={media.poster}
        aria-label={media.label}
        autoPlay
        loop
        muted
        playsInline
        controls={mode === 'detail'}
        preload="metadata"
      />
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

function ProjectLinks({ project }: { project: Project }) {
  if (project.liveLink === '#' && project.repoLink === '#') return null

  return (
    <p className="park__links">
      {project.liveLink !== '#' && (
        <a className="park__link" href={project.liveLink} {...projectTarget(project.liveLink)}>
          {project.liveLabel}
        </a>
      )}
      {project.repoLink !== '#' && (
        <a className="park__link" href={project.repoLink} {...projectTarget(project.repoLink)}>
          Source
        </a>
      )}
    </p>
  )
}

const featuredProjects = projectsData.filter((project) => project.featured)
const archivedProjects = projectsData.filter((project) => !project.featured)

/**
 * Four full containment paddocks replace the old overlapping card hand.
 * Every featured project remains visible inside a timber-and-steel paddock.
 * The enclosures sit in the same lush visitor-park world as the rest of the
 * island rather than reading as windows inside a computer interface.
 */
export default function ParkScene() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const detailRef = useRef<HTMLElement>(null)
  const openProject = openIndex === null ? null : featuredProjects[openIndex]!
  const openMedia = openProject ? projectMedia(openProject.image) : null

  useEffect(() => {
    if (openIndex === null) return

    detailRef.current?.focus({ preventScroll: true })
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenIndex(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [openIndex])

  return (
    <section
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
          const media = projectMedia(project.image)
          const style: ContainmentStyle = { '--deploy-delay': `${index * 90}ms` }

          return (
            <li
              key={project.title}
              className={`park__containment${isOpen ? ' is-open' : ''}`}
              style={style}
            >
              <button
                type="button"
                className="park__containment-unit"
                aria-label={`${project.title}, paddock ${String(index + 1).padStart(2, '0')}`}
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(index)}
              >
                <span className="park__lintel">
                  <span className="park__hazard" aria-hidden="true" />
                  <span className="park__serial">Paddock {String(index + 1).padStart(2, '0')}</span>
                </span>

                <span className="park__cell">
                  <span className="park__media">
                    <ProjectMediaView media={media} />
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
                    {isOpen ? 'Access' : 'Secure'}
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
            </li>
          )
        })}
      </ul>

      <details className="park__archive">
        <summary>Archive enclosures <span>{String(archivedProjects.length).padStart(2, '0')}</span></summary>
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
        <article
          ref={detailRef}
          className="park__detail"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-detail-title"
          tabIndex={-1}
        >
          <button type="button" className="park__detail-close" onClick={() => setOpenIndex(null)}>
            Return to paddocks
          </button>

          <div className="park__detail-media">
            <p className="park__detail-feed-label">
              Paddock {String(openIndex + 1).padStart(2, '0')} // Full surveillance record
            </p>
            <div className="park__detail-viewport">
              <ProjectMediaView media={openMedia} mode="detail" />
              <span className="park__detail-scan" aria-hidden="true" />
            </div>
            {openMedia?.kind === 'image' && (
              <a className="park__media-expand" href={openMedia.src} target="_blank" rel="noreferrer noopener">
                Open walkthrough in a new tab
              </a>
            )}
          </div>

          <div className="park__detail-copy">
            <p className="park__detail-index">Containment file // Access granted · {openProject.year}</p>
            <h3 id="project-detail-title" className="park__detail-title">{openProject.title}</h3>
            <p className="park__detail-context">{openProject.context}</p>
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
      )}
    </section>
  )
}
