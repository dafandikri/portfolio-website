import CardScene from './components/scenes/CardScene'
import TimeCircuitsScene from './components/scenes/TimeCircuitsScene'

/**
 * A sequence of cult-film set pieces, each carrying real content.
 *
 * Scene one is the American Psycho card, unchanged. Scenes below it render the
 * portfolio data that has been sitting in src/data/ since the redesign.
 */
export default function App() {
  return (
    <main>
      <CardScene />
      <TimeCircuitsScene />
    </main>
  )
}
