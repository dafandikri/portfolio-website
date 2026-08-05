import { useState, type CSSProperties } from 'react'
import { projectsData } from '../../data/projects'
import { projectCardTitle, projectMedia, type ProjectMedia } from './projectMedia'
import './ParkScene.css'

type CardStyle = CSSProperties & Record<`--${string}`, string>

export function ProjectMediaView({ media }: { media: ProjectMedia | null }) {
  if (!media) {
    return (
      <span className="park__media-placeholder" aria-label="Project media not added yet">
        Media locked
      </span>
    )
  }

  if (media.kind === 'video') {
    return (
      <video
        className="park__media-file"
        src={media.src}
        poster={media.poster}
        aria-label={media.label}
        autoPlay
        loop
        muted
        playsInline
      />
    )
  }

  return <img className="park__media-file" src={media.src} alt={media.alt} loading="lazy" />
}

/**
 * Projects dealt into the gate after the camera crosses its threshold.
 *
 * This component mounts only when the dolly is complete, so its stagger runs on
 * its own clock: the visitor can stop scrolling and watch the entire hand land.
 */
export default function ParkScene() {
  const [openIndex, setOpenIndex] = useState(0)
  const open = projectsData[openIndex]!
  const middle = (projectsData.length - 1) / 2

  return (
    <section className="park" aria-labelledby="projects-heading">
      <header className="park__header">
        <p className="park__kicker">Isla Nublar // Asset Registry</p>
        <h2 id="projects-heading" className="park__heading">
          Projects
        </h2>
      </header>

      <ul className="park__hand">
        {projectsData.map((project, index) => {
          const offset = index - middle
          const isOpen = index === openIndex
          const media = projectMedia(project.image)
          const style: CardStyle = {
            '--angle': `${(offset * 4.2).toFixed(1)}deg`,
            '--deal-angle': `${(offset * 7.5).toFixed(1)}deg`,
            '--rise': `${Math.abs(offset) * 0.28}rem`,
            '--deal-delay': `${index * 64}ms`,
            zIndex: isOpen ? 30 : index + 1,
          }

          return (
            <li key={project.title} className={`park__card${isOpen ? ' is-open' : ''}`} style={style}>
              <button
                type="button"
                className="park__card-face"
                aria-label={`${project.title}, paddock ${String(index + 1).padStart(2, '0')}`}
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(index)}
              >
                <span className="park__media">
                  <ProjectMediaView media={media} />
                  <span className="park__scan" aria-hidden="true" />
                </span>
                <span className="park__card-meta">
                  <span className="park__paddock">Paddock {String(index + 1).padStart(2, '0')}</span>
                  <span className="park__lamp" aria-hidden="true" />
                </span>
                <span className="park__card-title">{projectCardTitle(project.title)}</span>
                <span className="park__year">{project.year}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <article className="park__detail" key={open.title} aria-live="polite">
        <p className="park__detail-index">Selected enclosure // {String(openIndex + 1).padStart(2, '0')}</p>
        <h3 className="park__detail-title">{open.title}</h3>
        <p className="park__detail-text">{open.description}</p>
        <ul className="park__chips" aria-label="Technology stack">
          {open.techStack.map((tech) => (
            <li key={tech} className="park__chip">
              {tech}
            </li>
          ))}
        </ul>
        <p className="park__links">
          {open.liveLink !== '#' && (
            <a
              className="park__link"
              href={open.liveLink}
              {...(open.liveLink.startsWith('http')
                ? { target: '_blank', rel: 'noreferrer noopener' }
                : {})}
            >
              Visit
            </a>
          )}
          {open.repoLink !== '#' && (
            <a
              className="park__link"
              href={open.repoLink}
              target="_blank"
              rel="noreferrer noopener"
            >
              Source
            </a>
          )}
        </p>
      </article>
    </section>
  )
}
