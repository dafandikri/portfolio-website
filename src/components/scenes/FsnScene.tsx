import { useState, type CSSProperties } from 'react'
import { projectsData } from '../../data/projects'
import { useInView } from '../../hooks/useInView'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import './FsnScene.css'

/**
 * Scene three: "It's a UNIX system! I know this."
 *
 * Jurassic Park's file browser is the real `fsn` — flat-shaded boxes standing on
 * a wireframe grid, joined by thin risers, labelled in a mono face. Every project
 * is a box; picking one opens it.
 *
 * Built in CSS 3D rather than with a renderer. The look is rectangular prisms and
 * grid lines — no lighting, no curved geometry, no textures — so a WebGL context
 * would buy nothing the browser cannot already do, at roughly 45 KB gzip. Two
 * things fall out of that choice: the labels stay real DOM, so the projects are a
 * list to a screen reader instead of an opaque canvas, and the camera is a single
 * transform on one parent, which makes it scroll-scrubbable like every other
 * scene here.
 */

type Vars = CSSProperties & Record<`--${string}`, string | number>

/** Where each box stands on the plane, in grid cells from the centre. */
const PLOT: ReadonlyArray<{ col: number; row: number }> = [
  { col: -1.5, row: -1 },
  { col: -0.5, row: -1 },
  { col: 0.5, row: -1 },
  { col: 1.5, row: -1 },
  { col: -1.5, row: 0.35 },
  { col: -0.5, row: 0.35 },
  { col: 0.5, row: 0.35 },
  { col: 1.5, row: 0.35 },
]

export default function FsnScene() {
  const [sceneRef, hasEntered] = useInView<HTMLElement>('0px 0px -10%', true)
  const progressRef = useScrollProgress<HTMLDivElement>('--enter', 'pass')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const open = openIndex === null ? null : (projectsData[openIndex] ?? null)

  return (
    <section ref={sceneRef} className="scene scene--fsn" aria-labelledby="projects-heading">
      <h2 id="projects-heading" className="visually-hidden">
        Projects
      </h2>

      {hasEntered ? (
        <div className="fsn" ref={progressRef}>
          {/* Park signage, not a terminal prompt. */}
          <p className="fsn__quote" aria-hidden="true">
            Paddocks &middot; Select an enclosure
          </p>

          <div className="fsn__stage">
            <div className="fsn__world">
              <div className="fsn__grid" aria-hidden="true" />

              <ul className="fsn__nodes">
                {projectsData.map((project, i) => {
                  const plot = PLOT[i] ?? { col: 0, row: 0 }
                  const isOpen = openIndex === i
                  const style: Vars = {
                    '--col': plot.col,
                    '--row': plot.row,
                    // Staggered so the boxes rise in sequence, not as one slab.
                    '--rise': `${(i % 4) * 0.06 + (plot.row > 0 ? 0.1 : 0)}`,
                  }
                  return (
                    <li
                      key={project.title}
                      className={`fsn__node${isOpen ? ' is-open' : ''}`}
                      style={style}
                    >
                      {/* The riser: a box on a grid needs a leg, or it reads as
                          floating rather than standing. */}
                      <span className="fsn__riser" aria-hidden="true" />
                      <button
                        type="button"
                        className="fsn__box"
                        aria-expanded={isOpen}
                        onClick={() => setOpenIndex(isOpen ? null : i)}
                      >
                        <span className="fsn__box-face">
                          <span className="fsn__box-year">{project.year}</span>
                          <span className="fsn__box-title">{project.title}</span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* The readout. Deliberately below the grid rather than floating over
              it: an overlay would cover the very boxes you are choosing between. */}
          <div className="fsn__readout">
            {open ? (
              <article className="fsn__detail" key={open.title}>
                <h3 className="fsn__detail-title">{open.title}</h3>
                <p className="fsn__detail-text">{open.description}</p>
                <ul className="fsn__chips">
                  {open.techStack.map((tech) => (
                    <li key={tech} className="fsn__chip">
                      {tech}
                    </li>
                  ))}
                </ul>
                <p className="fsn__links">
                  {open.liveLink !== '#' && (
                    <a
                      className="fsn__link"
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
                      className="fsn__link"
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
              <p className="fsn__hint">Select an enclosure</p>
            )}
          </div>
        </div>
      ) : (
        <div className="fsn__placeholder" aria-hidden="true" />
      )}
    </section>
  )
}
