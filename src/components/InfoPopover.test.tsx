import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import InfoPopover from './InfoPopover'

afterEach(cleanup)

describe('InfoPopover', () => {
  it('keeps its panel mounted through both pop-in and fade-out states', () => {
    const { container } = render(
      <InfoPopover
        className="credit"
        panelClassName="credit__panel"
        label="Asset credit"
        visible
      >
        <p>Creator and license</p>
      </InfoPopover>,
    )
    const root = container.querySelector('.credit')!
    const panel = container.querySelector('.credit__panel')!
    const trigger = screen.getByRole('button', { name: 'Asset credit' })

    expect(root).toHaveClass('is-visible')
    expect(root).not.toHaveClass('is-open')
    expect(panel).toHaveAttribute('aria-hidden', 'true')

    fireEvent.click(trigger)
    expect(root).toHaveClass('is-open')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(panel).toHaveAttribute('aria-hidden', 'false')

    fireEvent.click(trigger)
    expect(root).not.toHaveClass('is-open')
    expect(panel).toBeInTheDocument()
    expect(panel).toHaveAttribute('aria-hidden', 'true')
  })

  it('closes with Escape and whenever its moving prop leaves the frame', () => {
    const { container, rerender } = render(
      <InfoPopover className="credit" panelClassName="panel" label="Credit" visible>
        <p>License</p>
      </InfoPopover>,
    )
    const trigger = screen.getByRole('button', { name: 'Credit' })
    fireEvent.click(trigger)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(container.querySelector('.credit')).not.toHaveClass('is-open')

    fireEvent.click(trigger)
    rerender(
      <InfoPopover className="credit" panelClassName="panel" label="Credit" visible={false}>
        <p>License</p>
      </InfoPopover>,
    )
    expect(container.querySelector('.credit')).not.toHaveClass('is-open')
    expect(container.querySelector('.credit')).toHaveAttribute('inert')
  })
})
