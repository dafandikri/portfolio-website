import { useScrollProgress } from '../hooks/useScrollProgress'
import { contact } from '../data/contact'
import { card } from '../data/card'
import './SiteFooter.css'

/**
 * The slate.
 *
 * The site is a sequence of film sets, so it closes on the object that marks a
 * take rather than on a paragraph about closing. This is built, not drawn: a
 * hinged clapper arm over a chalked board, with real geometry and a hinge that
 * swings once when the board comes into view.
 *
 * A slate is also, structurally, exactly what a contact block is — a column of
 * field names against values. That is why the object earns its place instead of
 * decorating one: the form already matches the content.
 */
export default function SiteFooter() {
  const year = new Date().getFullYear()
  /* The strike is scrubbed from the slate's travel through the viewport. It was
     built on a view() timeline, which is unavailable in enough browsers that the
     board simply rendered shut and never clapped at all. */
  const enterRef = useScrollProgress<HTMLElement>('--enter', 'pass')

  return (
    <footer ref={enterRef} className="slate" aria-labelledby="slate-heading">
      <div className="slate__board">
        {/*
          The clapper: two halves of one stick. The arm swings down onto the
          fixed jaw, and both carry the same stripe geometry so the teeth
          interlock when it closes rather than merely overlapping.
        */}
        <div className="slate__clap" aria-hidden="true">
          <div className="slate__arm">
            <span className="slate__teeth" />
          </div>
          <div className="slate__jaw">
            <span className="slate__teeth" />
          </div>
          <span className="slate__hinge" />
        </div>

        <div className="slate__face">
          <div className="slate__head">
            <p className="slate__field">Prod.</p>
            <h2 id="slate-heading" className="slate__production">
              {card.name}
            </h2>
            <p className="slate__field slate__field--right">Date</p>
            <p className="slate__stamp">{year}</p>
          </div>

          <dl className="slate__rows">
            {contact.map((line) => (
              <div key={line.href} className="slate__row">
                <dt className="slate__field">{line.role}</dt>
                <dd className="slate__value">
                  <a
                    className="slate__link"
                    href={line.href}
                    {...(line.external
                      ? { target: '_blank', rel: 'noreferrer noopener' }
                      : {})}
                  >
                    {line.label}
                    {line.external ? (
                      <svg
                        className="slate__away"
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

          <p className="slate__tail">
            <span className="slate__field">Loc.</span>
            <span>Jakarta, Indonesia</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
