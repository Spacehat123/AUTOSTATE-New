import { generateText } from 'ai'
import { fastModel } from './models'

export interface MessageGenerationParams {
  customerName: string
  outstandingAmount: number
  daysOverdue: number
  invoiceNumbers: string[]
  language: string
  tone: 'formal' | 'friendly' | 'firm'
  recentMessages: string[]
}

/**
 * Uses the fast AI model to draft a personalized, contextual WhatsApp
 * collection message.
 */
export async function generateCollectionMessage(
  params: MessageGenerationParams
): Promise<string> {
  const {
    customerName,
    outstandingAmount,
    daysOverdue,
    invoiceNumbers,
    language,
    tone,
    recentMessages
  } = params

  const formattedAmount = `₹${outstandingAmount.toLocaleString('en-IN')}`
  const invoicesStr = invoiceNumbers.length === 1
    ? `invoice #${invoiceNumbers[0]}`
    : `invoices ${invoiceNumbers.map(n => `#${n}`).join(', ')}`

  let prompt = `You are an accounts receivable assistant drafting a WhatsApp message to a customer.

CUSTOMER DETAILS:
- Name: ${customerName}
- Amount owed: ${formattedAmount}
- Days overdue: ${daysOverdue} days
- Invoices: ${invoicesStr}

INSTRUCTIONS:
1. Write a short, professional WhatsApp message asking for payment.
2. The tone must be **${tone}**.
3. Write the message in **${language}**.
4. Mention the customer's name, the amount owed (${formattedAmount}), and the invoices.
5. Keep it under 300 characters. Keep it concise, suitable for WhatsApp.
6. Do NOT include placeholders like [Your Name] or [Company Name].
7. Do NOT include subject lines or greetings like "Dear". Just start the message naturally.`

  if (recentMessages.length > 0) {
    prompt += `\n\nRECENT CONVERSATION HISTORY (for context):\n`
    prompt += recentMessages.map(m => `- ${m}`).join('\n')
    prompt += `\n\nMake sure your drafted message makes sense given this recent context (e.g. if they asked for a copy of the invoice, mention you can provide it).`
  }

  prompt += `\n\nOUTPUT: Respond ONLY with the message text, nothing else.`

  try {
    const { text } = await generateText({
      model: fastModel as any,
      prompt
    })

    return text.trim()
  } catch (error) {
    console.error('[AI Message Generator] Failed to generate message:', error)
    // Fallback message if AI generation fails
    return `Hi ${customerName}, this is a reminder regarding your outstanding balance of ${formattedAmount} for ${invoicesStr} which is ${daysOverdue} days overdue. Please arrange payment at your earliest convenience.`
  }
}
