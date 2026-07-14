import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CurrencyDisplay } from './currency-display'

describe('CurrencyDisplay', () => {
  it('renders full amount with Indian commas (52,00,000)', () => {
    render(<CurrencyDisplay value={5200000} compact={false} />)
    expect(screen.getByText(/52,00,000/)).toBeInTheDocument()
  })

  it('renders compact amount (52L)', () => {
    render(<CurrencyDisplay value={5200000} compact={true} />)
    expect(screen.getByText(/52L/)).toBeInTheDocument()
  })

  it('renders 0 without crashing', () => {
    render(<CurrencyDisplay value={0} compact={false} />)
    expect(screen.getByText(/0/)).toBeInTheDocument()
  })

  it('renders compact amount (1L)', () => {
    render(<CurrencyDisplay value={100000} compact={true} />)
    expect(screen.getByText(/1L/)).toBeInTheDocument()
  })
})
