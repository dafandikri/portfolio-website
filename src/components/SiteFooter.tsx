import { contact } from '../data/contact'
import './SiteFooter.css'

/**
 * End credits.
 *
 * The site is a print of five sets, so it closes the way a print closes. The
 * credit block is a description list, not a heading with labels above it: in
 * real credits the role is the information — "Directed by" tells you what the
 * person did — and a term/value pair is what that is.
 *
 * Every route out of the site lives here and is visible at once. A recruiter
 * who scrolled this far should not have to open anything to find an address.
 */
export default function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="credits" aria-labelledby="credits-heading">
      <div className="credits__reel" aria-hidden="true" />

      <div className="credits__sheet">
        <h2 id="credits-heading" className="credits__title">
          Erdafa Andikri
        </h2>

        <dl className="credits__list">
          {contact.map((line) => (
            <div key={line.href} className="credits__line">
              <dt className="credits__role">{line.role}</dt>
              <dd className="credits__value">
                <a
                  className="credits__link"
                  href={line.href}
                  {...(line.external
                    ? { target: '_blank', rel: 'noreferrer noopener' }
                    : {})}
                >
                  {line.label}
                  {line.external ? (
                    <svg
                      className="credits__away"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3.2 8.8 8.8 3.2" />
                      <path d="M4.4 3.2h4.4v4.4" />
                    </svg>
                  ) : null}
                  {line.external ? (
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  ) : null}
                </a>
              </dd>
            </div>
          ))}
        </dl>

        <p className="credits__colophon">
          Built by hand in Jakarta. Five sets, one print.
          <span className="credits__rule" aria-hidden="true" />
          <span className="credits__year">{year}</span>
        </p>
      </div>
    </footer>
  )
}
