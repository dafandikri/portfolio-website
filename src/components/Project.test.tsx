import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Project from './Project'
import { projects } from '../data'

vi.mock('../assets', () => ({
  getImage: () => 'mock-image.png',
  getIcon: () => 'mock-icon.png',
}))

const totalPages = Math.ceil(projects.length / 2)

describe('<Project />', () => {
  it('renders the first page of projects with a page indicator', () => {
    render(<Project />)
    expect(screen.getAllByText(/SIRA/).length).toBeGreaterThan(0)
    expect(screen.getByText(`Page 1 of ${totalPages}`)).toBeInTheDocument()
  })

  it('advances to the next page on Next click', async () => {
    const user = userEvent.setup()
    render(<Project />)
    await user.click(screen.getByText('Next →'))
    expect(screen.getByText(`Page 2 of ${totalPages}`)).toBeInTheDocument()
  })

  it('wraps to the last page when clicking Previous on page 1', async () => {
    const user = userEvent.setup()
    render(<Project />)
    await user.click(screen.getByText('← Previous'))
    expect(screen.getByText(`Page ${totalPages} of ${totalPages}`)).toBeInTheDocument()
  })

  it('renders the "Coming Soon" placeholder for projects without an image', async () => {
    const user = userEvent.setup()
    render(<Project />)
    // pages 3+ contain image-less projects (JagaRaga, etc.)
    await user.click(screen.getByText('Next →'))
    await user.click(screen.getByText('Next →'))
    expect(screen.getAllByText('Coming Soon').length).toBeGreaterThan(0)
  })
})
