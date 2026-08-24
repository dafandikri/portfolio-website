import { useEffect, useRef, useState } from 'react'
import { card } from '../data/card'
import type { CardField } from '../data/schema'
import { useCardTilt } from '../hooks/useCardTilt'
import cardHandoffHand from '../assets/img/card-handoff-hand.webp'
import walnutDesk from '../assets/img/american-psycho-walnut-desk.webp'
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

interface BusinessCardProps {
  onReady?: () => void
}

const BACKDROP_READY = 1
const HAND_READY = 2
const ALL_OPENING_ASSETS_READY = BACKDROP_READY | HAND_READY

export default function BusinessCard({ onReady }: BusinessCardProps) {
  const [readyAssets, setReadyAssets] = useState(0)
  const [delivered, setDelivered] = useState(false)
  const readyAssetsRef = useRef(0)
  const openingReady = readyAssets === ALL_OPENING_ASSETS_READY

  /* Animation events are standard in Safari, but this fail-open timer prevents
     a throttled or interrupted entrance from ever leaving the native links
     behind the temporary delivery layer. */
  useEffect(() => {
    if (!openingReady || delivered) return
    const fallback = window.setTimeout(() => setDelivered(true), 1500)
    return () => window.clearTimeout(fallback)
  }, [delivered, openingReady])

  // The tilt is measured on the wrapper, not the card: the cast shadow lives
  // here (it must not rotate) and the rotation lives on the child, so the
  // pointer has to be read above the pair of them.
  //
  // The values are published one level higher still, on the stage, because the
  // desk behind the card is the stage's own child and a custom property only
  // inherits downward — a value written on the wrapper is unreachable from the
  // ground the card is lying on.
  const stageRef = useRef<HTMLDivElement>(null)
  const tiltRef = useCardTilt<HTMLDivElement>(openingReady, stageRef)

  const markAssetReady = (bit: number) => {
    const previous = readyAssetsRef.current
    const next = previous | bit
    if (next === previous) return
    readyAssetsRef.current = next
    setReadyAssets(next)
    if (next === ALL_OPENING_ASSETS_READY) onReady?.()
  }

  const markLoaded = (bit: number) => () => markAssetReady(bit)

  const markFailed = (bit: number) => () => {
    // A failed decorative image must not leave the whole interface frozen.
    markAssetReady(bit)
  }

  return (
    <div
      className={`stage${openingReady ? ' stage--ready' : ''}`}
      aria-busy={!openingReady}
      ref={stageRef}
    >
      <img
        className="stage__backdrop"
        src={walnutDesk}
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchPriority="high"
        onLoad={markLoaded(BACKDROP_READY)}
        onError={markFailed(BACKDROP_READY)}
      />
      <div
        className={`card-delivery${delivered ? ' card-delivery--landed' : ''}`}
        onAnimationEnd={(event) => {
          /* Descendant blood animations bubble through this wrapper. Match the
             wrapper's two possible arrival clocks by name so only delivery
             completion may retire its transform layer. */
          if (
            event.animationName === 'card-delivery-arrive' ||
            event.animationName === 'card-settle'
          ) {
            setDelivered(true)
          }
        }}
      >
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
                  <Field field={card.linkedin} className="card__meta card__reveal card__reveal--1" />
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
            decoding="async"
            fetchPriority="high"
            onLoad={markLoaded(HAND_READY)}
            onError={markFailed(HAND_READY)}
          />
        </span>
      </div>
    </div>
  )
}
