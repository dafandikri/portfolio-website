import { awardsData } from '../../data/awards'
import { projectsData } from '../../data/projects'
import ristekLogo from '../../assets/img/favicon/ristek.png'
import teamFamPhoto from '../../assets/img/awards/team-fam-best-presentation.webp'
import './VisitorCenterScene.css'

const AWARD_LOGOS: Readonly<Record<string, string>> = {
  ristek: ristekLogo,
}

const AWARD_PHOTOS: Readonly<Record<string, string>> = {
  'team-fam-best-presentation': teamFamPhoto,
}

const SCRATCHES = [1, 2, 3] as const

function ScarField({ direction }: { direction: 'rise' | 'fall' }) {
  return (
    <span className={`x-transition__scar-field x-transition__scar-field--${direction}`}>
      {SCRATCHES.map((scar) => (
        <span
          key={scar}
          className={`x-transition__scar x-transition__scar--${scar}`}
          data-gouge={scar}
        />
      ))}
    </span>
  )
}

/**
 * Printed directly over the live paddock DOM. Keeping the wash, dots and
 * gouges inside the project frame is what makes that scene become the comic
 * page instead of cutting to a look-alike background.
 */
export function PaddockSurfaceTransition() {
  return (
    <div className="x-transition__surface" aria-hidden="true">
      <span className="x-transition__paper-wash" />
      <span className="x-transition__halftone" data-halftone="paddock" />
      <ScarField direction="rise" />
      <ScarField direction="fall" />
    </div>
  )
}

/**
 * The printed achievement spread revealed behind the scratched paddock.
 *
 * GateScene owns the shared scroll clock so this layer can sit behind the live
 * project frame throughout the strike instead of entering as a second scene.
 */
export default function VisitorCenterScene({ interactive = true }: { interactive?: boolean }) {
  return (
    <section
      className="scene scene--archive"
      aria-labelledby="awards-heading"
      aria-hidden={!interactive}
    >
      <div className="x-archive">
        <div
          className="x-archive__shell"
          data-reveal-layer="award"
          inert={!interactive}
        >
          <header className="x-archive__header">
            <div>
              <p className="x-archive__kicker">Field file · Class X</p>
              <h2 id="awards-heading" className="x-archive__heading" aria-label="Awards">
                Awards <span aria-hidden="true">/ 01</span>
              </h2>
            </div>
            <p className="x-archive__deck">
              The product was ready. The business case wasn&rsquo;t.
            </p>
          </header>

          <ul className="x-archive__records" aria-label="Awards">
            {awardsData.map((award, index) => {
              const project = projectsData.find((candidate) => candidate.title === award.projectTitle)
              const lessonId = `award-lesson-${index}`

              return (
                <li key={`${award.event}-${award.title}`} className="x-archive__record">
                  {award.photo ? (
                    <figure className="x-archive__evidence">
                      <img
                        src={AWARD_PHOTOS[award.photo.asset]}
                        alt={award.photo.alt}
                        width={award.photo.width}
                        height={award.photo.height}
                        decoding="async"
                      />
                      <figcaption>{award.photo.caption}</figcaption>
                    </figure>
                  ) : null}

                  <article className="x-archive__brief">
                    <div className="x-archive__identity">
                      <img src={AWARD_LOGOS[award.logo]} alt="" />
                      <div>
                        <p className="x-archive__event">{award.event} · Final pitch</p>
                        <h3>{award.title}</h3>
                        <p className="x-archive__meta">{award.host} · {award.date}</p>
                      </div>
                    </div>

                    <p className="x-archive__story">{award.story}</p>

                    {award.lesson ? (
                      <aside className="x-archive__lesson" aria-labelledby={lessonId}>
                        <p>Pitch lesson</p>
                        <h4 id={lessonId}>{award.lesson.title}</h4>
                        <p>{award.lesson.body}</p>
                      </aside>
                    ) : null}

                    <ul className="x-archive__facts" aria-label="Pitch facts">
                      {award.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                    </ul>

                    <footer className="x-archive__footer">
                      {project ? (
                        <a
                          className="x-archive__link"
                          href={project.liveLink}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-label={`View ${project.title} (opens in a new tab)`}
                        >
                          View {project.title}
                        </a>
                      ) : null}

                      <details className="x-archive__credits">
                        <summary>{award.team} · {award.members.length} members</summary>
                        <p>{award.members.join(' · ')}</p>
                      </details>
                    </footer>
                  </article>
                </li>
              )
            })}
          </ul>

          {/* Credits the motif the visitor just watched tear the paddock open.
              DESIGN.md rules out character artwork between Projects and Awards,
              so the nod is typographic and stays out of the headline block. */}
          <aside className="x-archive__marginalia">
            <p className="x-archive__marginalia-label">Margin note</p>
            <p>Six cuts, two passes. Wolverine&rsquo;s work, hence Class X.</p>
          </aside>
        </div>
      </div>
    </section>
  )
}
