import { card } from '../data/card'
import type { CardField } from '../data/schema'
import { useCardTilt } from '../hooks/useCardTilt'
import cardHandoffHand from '../assets/img/card-handoff-hand.webp'
import BloodDrop from './BloodDrop'
import './BusinessCard.css'

/**
 * A single printed field. Most are links — since the card is the whole site,
 * they are the only way off the page — but the location is ink only.
 */
function Field({ field, className }: { field: CardField; className: string }) {
  if (field.href === null) {
    return <span className={className}>{field.label}</span>
  }
  /*
   * A new tab for anything that isn't a page navigation we own. The CV is a
   * same-origin path but still a file the visitor is leaving the card to read —
   * navigating the tab away from a single-page site means losing it.
   */
  const external = field.href.startsWith('http') || field.href.endsWith('.pdf')
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
  // On the wrapper, not the card: the cast shadow lives here (it must not
  // rotate) and the rotation lives on the child, so the custom properties both
  // read have to be written above the pair of them.
  const tiltRef = useCardTilt<HTMLDivElement>()

  return (
    <div className="stage">
      <div className="card-delivery">
        <div className="card-drop" ref={tiltRef}>
          {/*
            Cast shadow planes. They share the card's rotation so their
            projections skew with it — a box-shadow could not, being painted from
            an axis-aligned border box.
          */}
          <div className="card-shadow" aria-hidden="true" />
          <div className="card-shadow card-shadow--contact" aria-hidden="true" />

          <article className="card">
            {/* Paper fibre and moving light. Decorative, so hidden from AT. */}
            <div className="card__grain" aria-hidden="true" />
            <div className="card__specular" aria-hidden="true" />

            <div className="card__face">
              <header className="card__head">
                <div className="card__contact">
                  <Field field={card.phone} className="card__meta card__reveal card__reveal--1" />
                  <Field field={card.email} className="card__meta card__reveal card__reveal--2" />
                </div>
                <div className="card__affiliation card__reveal card__reveal--3">
                  <p className="card__meta card__affiliation-name">{card.affiliation.name}</p>
                  <p className="card__meta card__affiliation-detail">{card.affiliation.detail}</p>
                </div>
              </header>

              <div className="card__identity">
                <BloodDrop />
                <h1 className="card__name card__reveal card__reveal--4">{card.name}</h1>
                <p className="card__role card__reveal card__reveal--5">{card.role}</p>
              </div>

              <footer className="card__footer card__reveal card__reveal--6">
                {card.footer.map((column) => (
                  <div className="card__footer-col" key={column[0]?.label}>
                    {column.map((field) => (
                      <Field key={field.label} field={field} className="card__meta" />
                    ))}
                  </div>
                ))}
              </footer>
            </div>
          </article>
        </div>
        <span className="card-handoff-hand" aria-hidden="true">
          <img
            className="card-handoff-hand__image"
            src={cardHandoffHand}
            alt=""
            draggable="false"
          />
        </span>
      </div>
    </div>
  )
}
