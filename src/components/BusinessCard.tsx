import { card } from '../data/card'
import type { CardField } from '../data/schema'
import { useCardTilt } from '../hooks/useCardTilt'
import './BusinessCard.css'

/**
 * A single printed field. Most are links — since the card is the whole site,
 * they are the only way off the page — but the location is ink only.
 */
function Field({ field, className }: { field: CardField; className: string }) {
  if (field.href === null) {
    return <span className={className}>{field.label}</span>
  }
  const external = field.href.startsWith('http')
  return (
    <a
      className={className}
      href={field.href}
      {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
    >
      {field.label}
    </a>
  )
}

export default function BusinessCard() {
  const tiltRef = useCardTilt<HTMLElement>()

  return (
    <div className="stage">
      <div className="card-drop">
        <article className="card" ref={tiltRef}>
          {/* Paper fibre and moving light. Decorative, so hidden from AT. */}
          <div className="card__grain" aria-hidden="true" />
          <div className="card__specular" aria-hidden="true" />

          <div className="card__face">
            <header className="card__head">
              <div className="card__contact">
                <Field field={card.phone} className="card__meta card__reveal card__reveal--1" />
                <Field field={card.email} className="card__meta card__reveal card__reveal--2" />
              </div>
              <p className="card__industry card__reveal card__reveal--3">{card.industry}</p>
            </header>

            <div className="card__identity">
              <h1 className="card__name card__reveal card__reveal--4">{card.name}</h1>
              <p className="card__role card__reveal card__reveal--5">{card.role}</p>
            </div>

            <footer className="card__footer card__reveal card__reveal--6">
              {card.footer.map((field) => (
                <Field key={field.label} field={field} className="card__meta" />
              ))}
            </footer>
          </div>
        </article>
      </div>
    </div>
  )
}
