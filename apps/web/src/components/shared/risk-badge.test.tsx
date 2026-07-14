import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { RiskBadge } from './risk-badge'

describe('RiskBadge', () => {
  it('renders score 20 as Low risk', () => {
    const { container } = render(<RiskBadge score={20} />)
    expect(screen.getByText('Low')).toBeInTheDocument()
    // Test for the color classes
    expect(container.firstChild).toHaveClass('text-green-400')
  })

  it('renders score 50 as Medium risk', () => {
    const { container } = render(<RiskBadge score={50} />)
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('text-yellow-400')
  })

  it('renders score 90 as High risk', () => {
    const { container } = render(<RiskBadge score={90} />)
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('text-red-400')
  })

  it('renders score 0 without error', () => {
    const { container } = render(<RiskBadge score={0} />)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('Low')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('text-green-400')
  })

  it('renders score 100 without error', () => {
    const { container } = render(<RiskBadge score={100} />)
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('text-red-400')
  })
})
