import { awardsData } from '../../data/awards'
import { projectsData } from '../../data/projects'
import ristekLogo from '../../assets/img/favicon/ristek.png'
import './VisitorCenterScene.css'

/**
 * Award marks, imported directly rather than through the shared asset barrel.
 * `getIcon` reaches the whole registry, which pulled every icon on the site
 * into this scene's chunk and made an awards page heavier than the 3D gate.
 * One award needs one logo.
 */
const AWARD_LOGOS: Readonly<Record<string, string>> = {
  ristek: ristekLogo,
}

/**
 * Past the gate, past the paddocks, into the Visitor Center.
 *
 * Awards get their own scene rather than a ribbon on a paddock. A result is a
 * different kind of fact from a product description, and this site's idiom is
 * that a different kind of content gets its own set piece.
 *
 * It continues the same film rather than introducing another: same island,
 * next room. That is why it keeps the paddocks' machined typeface — with one
 * exception noted in the stylesheet.
 */
export default function VisitorCenterScene() {
  return (
    <section className="rotunda" aria-labelledby="awards-heading">
      <div className="rotunda__atrium" aria-hidden="true" />

      <header className="rotunda__header">
        <p className="rotunda__kicker">Isla Nublar · Visitor Center</p>
        <h2 id="awards-heading" className="rotunda__heading">Awards</h2>
      </header>

      <p className="rotunda__banner">
        <span className="rotunda__banner-text">When Dinosaurs Ruled The Hackathon</span>
      </p>

      <ul className="rotunda__cases" aria-label="Awards">
        {awardsData.map((award) => {
          const project = projectsData.find((candidate) => candidate.title === award.projectTitle)

          return (
            <li key={`${award.event}-${award.title}`} className="rotunda__case">
              <div className="rotunda__vitrine">
                {/* Not lazy: this scene is already gated on approaching the
                    viewport, and a second deferral leaves the case empty at
                    first paint — which is exactly when it is being looked at. */}
                <div className="rotunda__specimen">
                  <img className="rotunda__logo" src={AWARD_LOGOS[award.logo]} alt="" />
                </div>
                <div className="rotunda__mount">
                  <p className="rotunda__event">{award.event}</p>
                  <h3 className="rotunda__award">{award.title}</h3>
                  <p className="rotunda__host">{award.host}</p>
                  <p className="rotunda__date">Finals · {award.date}</p>
                </div>
                <span className="rotunda__glass" aria-hidden="true" />
              </div>

              <div className="rotunda__label">
                <p className="rotunda__story">{award.story}</p>

                <p className="rotunda__section-label">Field record</p>
                <ul className="rotunda__highlights">
                  {award.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                </ul>

                <div className="rotunda__footer">
                  {project ? (
                    <p className="rotunda__project">
                      <span className="rotunda__section-label">Specimen on file</span>
                      <a
                        className="rotunda__link"
                        href={project.liveLink}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {project.title}
                      </a>
                    </p>
                  ) : null}

                  <p className="rotunda__team">
                    <span className="rotunda__section-label">{award.team}</span>
                    <span className="rotunda__members">{award.members.join(' · ')}</span>
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
