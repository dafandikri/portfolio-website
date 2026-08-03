import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { timeline } from '../data/timeline'
import TimeCircuits from './TimeCircuits'

describe('TimeCircuits', () => {
  it('maps real timeline dates into destination, present and departed rows', () => {
    const destination = timeline[1]!
    const present = timeline[0]!
    const departed = timeline[2]!
    const { container } = render(
      <TimeCircuits destination={destination} present={present} departed={departed} />,
    )

    expect(screen.getByText('Destination Time')).toBeInTheDocument()
    expect(screen.getByText('Present Time')).toBeInTheDocument()
    expect(screen.getByText('Last Time Departed')).toBeInTheDocument()

    const rows = container.querySelectorAll('.circuits__row')
    expect(within(rows[0] as HTMLElement).getByText('AUG 2025')).toBeInTheDocument()
    expect(within(rows[1] as HTMLElement).getByText('JAN 2026')).toBeInTheDocument()
    expect(within(rows[2] as HTMLElement).getByText('JUL 2025')).toBeInTheDocument()
    expect(rows[0]?.querySelector('[data-display="2025"]')).not.toBeNull()
  })

  it('leaves unknown columns unlit and names an empty departed row', () => {
    const stop = timeline.at(-1)!
    const { container } = render(
      <TimeCircuits destination={stop} present={timeline[0]!} departed={null} />,
    )

    expect(screen.getByText('Not set')).toBeInTheDocument()
    const destination = container.querySelector('.circuits__row--destination')!
    expect(destination.querySelector('.circuits__month')?.textContent).toBe('\u00a0')
    expect(destination.querySelector('[data-display="2023"]')).not.toBeNull()
  })
})
