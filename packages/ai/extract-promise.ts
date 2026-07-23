import { generateObject } from 'ai'
import { z } from 'zod'
import { fastModel } from './models'
import { logger } from '@autostate/shared'

export const PromiseExtractionSchema = z.object({
  intent: z.enum(['promise_to_pay', 'dispute', 'cannot_pay', 'acknowledgement', 'other'])
    .describe('The primary intent of the customer message.'),
  date: z.string().nullable()
    .describe('The payment date promised by the customer, formatted as YYYY-MM-DD. Null if no date is promised or if they cannot pay.'),
  amount: z.number().nullable()
    .describe('The numeric amount the customer promised to pay. Null if no amount is specified.'),
  confidence: z.number().min(0).max(100)
    .describe('Confidence score of this extraction between 0 and 100.')
})

export type PromiseExtractionResult = z.infer<typeof PromiseExtractionSchema>

export interface ExtractPromiseOptions {
  model?: any
}

/**
 * Extracts payment promise details from a customer message using structured outputs.
 */
export async function extractPromise(
  messageText: string,
  options?: ExtractPromiseOptions
): Promise<PromiseExtractionResult> {
  const today = new Date().toISOString().split('T')[0]
  
  const prompt = `You are an accounts receivable AI assistant.
Your task is to extract payment promise details from the following customer message.
Today's date is ${today}. Resolve relative dates (e.g., "tomorrow", "next Friday") to YYYY-MM-DD based on today.
If the customer says they CANNOT pay (e.g., "I don't have money", "I can't pay", "I cannot pay"), set intent to "cannot_pay" and date/amount to null.
If the customer is making a promise to pay, set intent to "promise_to_pay".
If the customer is disputing the invoice, set intent to "dispute".
If the customer is just acknowledging, set intent to "acknowledgement".

Customer Message:
"${messageText}"`

  try {
    const { object } = await generateObject({
      model: options?.model ?? fastModel,
      schema: PromiseExtractionSchema,
      prompt
    })
    return object
  } catch (error) {
    logger.error({ error }, 'Failed to extract promise')
    return {
      intent: 'other',
      date: null,
      amount: null,
      confidence: 0
    }
  }
}
