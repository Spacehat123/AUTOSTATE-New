import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseReply } from './reply-parser'
import * as ai from 'ai'

// Mock the 'ai' module
vi.mock('ai', () => {
  return {
    generateText: vi.fn()
  }
})

describe('Reply Parser', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('Parses "Will pay next Tuesday" as promise_to_pay', async () => {
    vi.mocked(ai.generateText).mockResolvedValueOnce({
      text: JSON.stringify({
        intent: 'promise_to_pay',
        date: '2023-11-07',
        amount: null,
        confidence: 0.95
      })
    } as any)

    const result = await parseReply('Will pay next Tuesday', 'John Doe')
    
    expect(result.intent).toBe('promise_to_pay')
    expect(result.confidence).toBe(0.95)
  })

  it('Parses "I already paid" as acknowledgement', async () => {
    vi.mocked(ai.generateText).mockResolvedValueOnce({
      text: JSON.stringify({
        intent: 'acknowledgement',
        date: null,
        amount: null,
        confidence: 0.9
      })
    } as any)

    const result = await parseReply('I already paid', 'John Doe')
    
    expect(result.intent).toBe('acknowledgement')
  })

  it('Parses "OK" as acknowledgement', async () => {
    vi.mocked(ai.generateText).mockResolvedValueOnce({
      text: JSON.stringify({
        intent: 'acknowledgement',
        date: null,
        amount: null,
        confidence: 0.8
      })
    } as any)

    const result = await parseReply('OK', 'John Doe')
    
    expect(result.intent).toBe('acknowledgement')
  })

  it('Handles malformed JSON safely without throwing', async () => {
    vi.mocked(ai.generateText).mockResolvedValueOnce({
      text: 'This is not valid JSON and will throw an error when parsing'
    } as any)

    const result = await parseReply('Malformed message', 'John Doe')
    
    expect(result).toEqual({
      intent: 'other',
      date: null,
      amount: null,
      confidence: 0
    })
  })
})
