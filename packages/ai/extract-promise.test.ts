import { describe, it, expect, vi, beforeEach } from 'vitest'
import { extractPromise } from './extract-promise'
import * as ai from 'ai'

// Mock the 'ai' module
vi.mock('ai', () => {
  return {
    generateObject: vi.fn()
  }
})

describe('extractPromise', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('Parses a standard promise to pay', async () => {
    vi.mocked(ai.generateObject).mockResolvedValueOnce({
      object: {
        intent: 'promise_to_pay',
        date: '2023-11-07',
        amount: 500,
        confidence: 95
      }
    } as any)

    const result = await extractPromise('I will pay 500 next Tuesday')
    
    expect(result.intent).toBe('promise_to_pay')
    expect(result.date).toBe('2023-11-07')
    expect(result.amount).toBe(500)
    expect(result.confidence).toBe(95)
  })

  it('Handles "I cannot pay" edge case', async () => {
    vi.mocked(ai.generateObject).mockResolvedValueOnce({
      object: {
        intent: 'cannot_pay',
        date: null,
        amount: null,
        confidence: 99
      }
    } as any)

    const result = await extractPromise('I cannot pay right now, I lost my job.')
    
    expect(result.intent).toBe('cannot_pay')
    expect(result.date).toBeNull()
    expect(result.amount).toBeNull()
  })

  it('Falls back to safe defaults on error', async () => {
    vi.mocked(ai.generateObject).mockRejectedValueOnce(new Error('AI failed'))

    const result = await extractPromise('Some message')
    
    expect(result).toEqual({
      intent: 'other',
      date: null,
      amount: null,
      confidence: 0
    })
  })
})
