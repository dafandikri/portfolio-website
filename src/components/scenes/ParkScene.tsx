import { useState, type CSSProperties } from 'react'
import { projectsData } from '../../data/projects'
import { projectCardTitle, projectMedia, type ProjectMedia } from './projectMedia'
import './ParkScene.css'

type ContainmentStyle = CSSProperties & Record<`--${string}`, string>

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
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const open = openIndex === null ? null : projectsData[openIndex]!
  const middle = (projectsData.length - 1) / 2
  const focus = openIndex === null || middle === 0 ? 0 : (middle - openIndex) / middle
  const handStyle: ContainmentStyle = {
    '--focus-shift': `${(focus * 27).toFixed(1)}vw`,
    '--focus-shift-mobile': `${(focus * 41).toFixed(1)}vw`,
  }

  return (
    <section
      className={`park${openIndex === null ? '' : ' is-inspecting'}`}
      aria-labelledby="projects-heading"
    >
      <header className="park__header">
        <p className="park__kicker">Isla Nublar // Containment Control</p>
        <h2 id="projects-heading" className="park__heading" aria-label="Projects">
          Paddocks
        </h2>
      </header>

      <ul className="park__hand" style={handStyle}>
        {projectsData.map((project, index) => {
          const offset = index - middle
          const isOpen = openIndex !== null && index === openIndex
          const media = projectMedia(project.image)
          const style: ContainmentStyle = {
            '--angle': `${(offset * 4.2).toFixed(1)}deg`,
            '--deal-angle': `${(offset * 7.5).toFixed(1)}deg`,
            '--rise': `${Math.abs(offset) * 0.28}rem`,
            '--deal-delay': `${index * 64}ms`,
            zIndex: isOpen ? 30 : index + 1,
          }

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
                  <span className="park__serial">
                    Paddock {String(index + 1).padStart(2, '0')}
                  </span>
                </span>
                <span className="park__cell">
                  <span className="park__media">
                    <ProjectMediaView media={media} />
                    <span className="park__scan" aria-hidden="true" />
                    <span className="park__feed" aria-hidden="true">
                      Live feed
                    </span>
                  </span>
                  <span className="park__fence" aria-hidden="true">
                    {Array.from({ length: 7 }, (_, bar) => (
                      <i key={bar} />
                    ))}
                    <b />
                    <b />
                  </span>
                </span>
                <span className="park__control-box">
                  <span className="park__status">
                    <span className="park__lamp" aria-hidden="true" />
                    {isOpen ? 'Tracking' : 'Secure'}
                  </span>
                  <span className="park__keypad" aria-hidden="true">
                    {Array.from({ length: 6 }, (_, key) => (
                      <i key={key} />
                    ))}
                  </span>
                </span>
                <span className="park__sill">
                  <span className="park__plaque-title">{projectCardTitle(project.title)}</span>
                  <span className="park__year">{project.year}</span>
                </span>
                <span className="park__pylons" aria-hidden="true">
                  <i />
                  <i />
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {open && openIndex !== null && (
        <article className="park__detail" key={open.title} aria-live="polite">
          <button
            type="button"
            className="park__detail-close"
            onClick={() => setOpenIndex(null)}
          >
            Return to paddocks
          </button>
          <p className="park__detail-index">
            Containment file // {String(openIndex + 1).padStart(2, '0')} · Access granted
          </p>
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
      )}
    </section>
  )
}
