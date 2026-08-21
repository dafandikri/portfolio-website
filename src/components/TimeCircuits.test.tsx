import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { timeline } from '../data/timeline'
import TimeCircuits from './TimeCircuits'
import { readoutFromStop } from '../data/timeline'

describe('TimeCircuits', () => {
  it('maps real timeline dates into destination, present and departed rows', () => {
    const destination = timeline[1]!
    const present = timeline[0]!
    const departed = timeline[2]!
    const { container } = render(
      <TimeCircuits destination={readoutFromStop(destination)} present={readoutFromStop(present)} departed={readoutFromStop(departed)} />,
    )

    expect(screen.getByText('Destination Time')).toBeInTheDocument()
    expect(screen.getByText('Present Time')).toBeInTheDocument()
    expect(screen.getByText('Last Time Departed')).toBeInTheDocument()

    /*
     * Expectations are read out of the same records the component was handed,
     * not written down as literals. Hard-coding "AUG 2025" made this test fail
     * every time a job was added to the CV, which tells you nothing about
     * whether the panel maps its three rows correctly — which is all it is for.
     */
    const label = (stop: (typeof timeline)[number]) =>
      `${stop.month ?? ''} ${stop.year ?? ''}`.trim()

    const rows = container.querySelectorAll('.circuits__row')
    expect(within(rows[0] as HTMLElement).getByText(label(destination))).toBeInTheDocument()
    expect(within(rows[1] as HTMLElement).getByText(label(present))).toBeInTheDocument()
    expect(within(rows[2] as HTMLElement).getByText(label(departed))).toBeInTheDocument()
    expect(rows[0]?.querySelector(`[data-display="${destination.year}"]`)).not.toBeNull()
  })

  it('leaves unknown columns unlit and names an empty departed row', () => {
    const stop = timeline.at(-1)!
    const { container } = render(
      <TimeCircuits destination={readoutFromStop(stop)} present={readoutFromStop(timeline[0]!)} departed={null} />,
    )

    expect(screen.getByText('Not set')).toBeInTheDocument()
    const destination = container.querySelector('.circuits__row--destination')!
    expect(destination.querySelector('.circuits__month')?.textContent).toBe('\u00a0')
    expect(destination.querySelector('[data-display="2023"]')).not.toBeNull()
  })
})
