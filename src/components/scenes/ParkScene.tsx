import { useState } from 'react'
import { projectsData } from '../../data/projects'
import { useInView } from '../../hooks/useInView'
import './ParkScene.css'

/**
 * Inside the park: the projects, as paddock signage.
 *
 * This began as the `fsn` file browser from the film's control room, and it
 * never fitted. A wireframe grid of nodes reads as a terminal wherever you put
 * it, and recolouring it amber only made an amber terminal. The signifier had to
 * go, not its palette — so the projects are now the thing a visitor to the park
 * would actually stand in front of: a riveted warning plate on a fence, hazard
 * striping, a stencilled paddock number, and a status lamp that lights when the
 * enclosure is selected.
 *
 * Flat rather than in perspective, deliberately. The signs have to be readable
 * and clickable, and a receding plane makes the far ones both smaller and harder
 * to hit for no gain in meaning.
 */

/** Paddock numbers are stencilled, so they need to be fixed-width. */
function paddockNumber(index: number): string {
  return String(index + 1).padStart(2, '0')
}

export default function ParkScene() {
  const [sceneRef, hasEntered] = useInView<HTMLElement>('0px 0px -10%', true)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const open = openIndex === null ? null : (projectsData[openIndex] ?? null)

  return (
    <section ref={sceneRef} className="scene scene--park" aria-labelledby="projects-heading">
      <h2 id="projects-heading" className="visually-hidden">
        Projects
      </h2>

      {hasEntered ? (
        <div className="park">
          <p className="park__eyebrow" aria-hidden="true">
            <span className="park__stripe" />
            Paddocks
            <span className="park__stripe" />
          </p>

          <ul className="park__signs">
            {projectsData.map((project, i) => {
              const isOpen = openIndex === i
              return (
                <li key={project.title} className={`park__slot${isOpen ? ' is-open' : ''}`}>
                  <button
                    type="button"
                    className="park__sign"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                  >
                    {/* Hazard striping, the universal grammar of "do not enter". */}
                    <span className="park__hazard" aria-hidden="true" />

                    <span className="park__head">
                      <span className="park__paddock">
                        Paddock {paddockNumber(i)}
                      </span>
                      <span className="park__lamp" aria-hidden="true" />
                    </span>

                    <span className="park__title">{project.title}</span>
                    <span className="park__year">{project.year}</span>

                    {/* Rivets, one per corner: what makes a rectangle a plate. */}
                    <span className="park__rivets" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                      <i />
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="park__readout">
            {open ? (
              <article className="park__detail" key={open.title}>
                <h3 className="park__detail-title">{open.title}</h3>
                <p className="park__detail-text">{open.description}</p>
                <ul className="park__chips">
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
                      Live
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
            ) : (
              <p className="park__hint">Select an enclosure</p>
            )}
          </div>

          {/* Required by the model licence, not decoration. */}
          <p className="park__credit">
            Gate model and materials from{' '}
            <a
              className="park__credit-link"
              href="https://skfb.ly/oLJFH"
              target="_blank"
              rel="noreferrer noopener"
            >
              &ldquo;Jurassic Park Gate&rdquo;
            </a>{' '}
            by Mathzilla5335,{' '}
            <a
              className="park__credit-link"
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noreferrer noopener license"
            >
              CC BY 4.0
            </a>
          </p>
        </div>
      ) : (
        <div className="park__placeholder" aria-hidden="true" />
      )}
    </section>
  )
}
