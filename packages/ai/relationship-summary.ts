import { generateText } from 'ai'
import { summaryModel } from './models'

// Simplified types since we only need string representations for the AI prompt
export interface SummaryInvoice {
  amount: number | { toNumber: () => number }
  status: string
  createdAt: Date
  dueDate: Date
  paidDate: Date | null
}

export interface SummaryMessage {
  direction: string
  type: string
  timestamp: Date
  content: string
}

export interface SummaryPromise {
  status: string
  expectedDate: Date
  createdAt: Date
}

export interface RelationshipSummaryParams {
  customerName: string
  invoices: SummaryInvoice[]
  messages: SummaryMessage[]
  promises: SummaryPromise[]
}

function toNumber(val: number | { toNumber: () => number }): number {
  return typeof val === 'number' ? val : val.toNumber()
}

/**
 * Uses the high-quality summary model to generate a 2-3 sentence insight
 * into a customer's historical payment behaviour.
 */
export async function generateRelationshipSummary(
  params: RelationshipSummaryParams
): Promise<string> {
  const { customerName, invoices, messages, promises } = params

  if (invoices.length === 0) {
    return 'Not enough data yet. This customer has no invoice history.'
  }

  // Pre-process data into readable text for the LLM
  const invoicesData = invoices.map(inv => {
    return `- [${inv.status}] Amount: ₹${toNumber(inv.amount).toLocaleString('en-IN')}, Due: ${inv.dueDate.toISOString().split('T')[0]}, Paid: ${inv.paidDate ? inv.paidDate.toISOString().split('T')[0] : 'N/A'}`
  }).join('\n')

  const messagesData = messages.slice(0, 15).map(msg => {
    return `- [${msg.timestamp.toISOString().split('T')[0]}] [${msg.direction}] [${msg.type}]: ${msg.content}`
  }).join('\n') || 'No communication history.'

  const promisesData = promises.map(p => {
    return `- Promise made on ${p.createdAt.toISOString().split('T')[0]} to pay by ${p.expectedDate.toISOString().split('T')[0]}. Status: ${p.status}`
  }).join('\n') || 'No promises recorded.'

  const prompt = `You are an expert accounts receivable analyst.
Your task is to write a 2-3 sentence behavioral summary of a customer's payment habits.

CUSTOMER NAME: ${customerName}

--- INVOICE HISTORY ---
${invoicesData}

--- RECENT COMMUNICATION ---
${messagesData}

--- PAYMENT PROMISES ---
${promisesData}

INSTRUCTIONS:
1. Write exactly 2 to 4 sentences.
2. Be factual, direct, and professional. Avoid legal jargon or overly aggressive language.
3. Focus on patterns: Do they pay on time? If they pay late, how many days late on average?
4. Mention their reliability: Do they keep their promises to pay? Do they ignore messages?
5. Do NOT include greetings, headers, or any extra text. Return ONLY the summary paragraph.`

  try {
    const { text } = await generateText({
      model: summaryModel, // We use the higher-quality model here for better nuance
      prompt
    })

    return text.trim()
  } catch (error) {
    console.error('[AI Summary Generator] Failed to generate summary:', error)
    return 'AI summary is temporarily unavailable due to a service error.'
  }
}
