import { generateText } from 'ai'
import { fastModel } from './models'

export interface ParsedReply {
  intent: 'promise_to_pay' | 'dispute' | 'acknowledgement' | 'other'
  date: string | null
  amount: number | null
  confidence: number
}

/**
 * Uses the fast AI model to extract intent, dates, and amounts from an
 * incoming customer message.
 */
export async function parseReply(
  message: string,
  customerName: string
): Promise<ParsedReply> {
  const today = new Date().toISOString().split('T')[0]

  const prompt = `You are an accounts receivable assistant. A customer named ${customerName} sent this message:
"${message}"
Parse the intent. Respond ONLY with valid JSON matching this exact schema, and nothing else (no markdown blocks, no explanation):
{ "intent": "promise_to_pay"|"dispute"|"acknowledgement"|"other", "date": "YYYY-MM-DD"|null, "amount": number|null, "confidence": number }
Today's date is ${today}. If the customer mentions relative dates like "next Tuesday" or "tomorrow", resolve it to the actual YYYY-MM-DD date based on today. If they mention an amount like "10k" or "10,000", output it as a plain number (e.g., 10000).`

  try {
    const { text } = await generateText({
      model: fastModel,
      prompt
    })

    // Remove any markdown code block formatting if the model ignored instructions
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()

    const parsed = JSON.parse(cleanText) as ParsedReply

    // Basic runtime validation
    if (!['promise_to_pay', 'dispute', 'acknowledgement', 'other'].includes(parsed.intent)) {
      throw new Error('Invalid intent parsed')
    }

    return {
      intent: parsed.intent,
      date: parsed.date ?? null,
      amount: parsed.amount ?? null,
      confidence: parsed.confidence ?? 0
    }
  } catch (error) {
    console.error('[AI Reply Parser] Failed to parse reply:', error)
    // Always fall back safely if JSON parse fails or model hallucinates
    return {
      intent: 'other',
      date: null,
      amount: null,
      confidence: 0
    }
  }
}
