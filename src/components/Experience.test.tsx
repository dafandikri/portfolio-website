import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Experience from './Experience'

vi.mock('../assets', () => ({
  getIcon: () => 'mock-icon.png',
}))

describe('<Experience />', () => {
  it('renders the default (2024) entry and achievements', () => {
    render(<Experience />)
    expect(
      screen.getByText(/PT International Biometrics Indonesia/),
    ).toBeInTheDocument()
    expect(screen.getByText('Key Achievements:')).toBeInTheDocument()
  })

  it('selects the first entry of a year when its button is clicked', async () => {
    const user = userEvent.setup()
    render(<Experience />)
    await user.click(screen.getByRole('button', { name: /2026/ }))
    expect(screen.getByText(/Systatum/)).toBeInTheDocument()
  })

  it('reveals a dropdown for years with multiple entries and selects one', async () => {
    const user = userEvent.setup()
    render(<Experience />)
    await user.hover(screen.getByRole('button', { name: /2025/ }))
    const augustEntry = await screen.findByText('August 2025')
    await user.click(augustEntry)
    expect(screen.getAllByText(/VICII/).length).toBeGreaterThan(0)
  })

  it('handles hover, unhover and unmount without leaking timers', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Experience />)
    const btn2025 = screen.getByRole('button', { name: /2025/ })
    await user.hover(btn2025)
    expect(await screen.findByText('July 2025')).toBeInTheDocument()
    await user.unhover(btn2025) // schedules the delayed close
    await user.hover(btn2025) // re-enter cancels the scheduled close
    unmount() // cleanup effect clears any pending timer
  })
})
