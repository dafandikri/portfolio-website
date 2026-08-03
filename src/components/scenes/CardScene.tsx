import BusinessCard from '../BusinessCard'
import ScrollCue from '../ScrollCue'

/** Scene one: the finished American Psycho card and its quiet scroll cue. */
export default function CardScene() {
  return (
    <section className="scene scene--card" aria-label="Business card introduction">
      <BusinessCard />
      <ScrollCue />
    </section>
  )
}
