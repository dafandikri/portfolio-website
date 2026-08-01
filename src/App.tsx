import BusinessCard from './components/BusinessCard'

/**
 * v2 is a single screen holding a single card. No router, no routes — the card
 * is the site. Content in src/data/ beyond card.ts is retained for later phases
 * but renders nowhere yet.
 */
export default function App() {
  return <BusinessCard />
}
