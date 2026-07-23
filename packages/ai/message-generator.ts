import { generateText } from 'ai'
import { fastModel } from './models'
import { logger } from '@autostate/shared'

export interface MessageGenerationParams {
  customerName: string
  outstandingAmount: number
  daysOverdue: number
  invoiceNumbers: string[]
  language: string
  tone: 'formal' | 'friendly' | 'firm'
  recentMessages: string[]
  channel?: 'WHATSAPP' | 'EMAIL'
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
    recentMessages,
    channel = 'WHATSAPP'
  } = params

  const formattedAmount = `₹${outstandingAmount.toLocaleString('en-IN')}`
  const invoicesStr = invoiceNumbers.length === 1
    ? `invoice #${invoiceNumbers[0]}`
    : `invoices ${invoiceNumbers.map(n => `#${n}`).join(', ')}`

  let prompt = `You are an accounts receivable assistant drafting a ${channel === 'EMAIL' ? 'Email' : 'WhatsApp'} message to a customer.

CUSTOMER DETAILS:
- Name: ${customerName}
- Amount owed: ${formattedAmount}
- Days overdue: ${daysOverdue} days
- Invoices: ${invoicesStr}

INSTRUCTIONS:
1. Write a ${channel === 'EMAIL' ? 'detailed, professional email' : 'short, professional WhatsApp message'} asking for payment.
2. The tone must be **${tone}**.
3. Write the message in **${language}**, taking care to use appropriate script and cultural tone conventions for that language.
4. Mention the customer's name, the amount owed (${formattedAmount}), and the invoices.
5. ${channel === 'EMAIL' ? 'Include a clear Subject: header line at the beginning.' : 'Keep it under 300 characters. Keep it concise, suitable for WhatsApp.'}
6. Do NOT include placeholders like [Your Name] or [Company Name].`

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
    logger.error({ error }, 'Failed to generate message')
    // Fallback message if AI generation fails
    return `Hi ${customerName}, this is a reminder regarding your outstanding balance of ${formattedAmount} for ${invoicesStr} which is ${daysOverdue} days overdue. Please arrange payment at your earliest convenience.`
  }
}

export async function generateDraftReply(
  customerName: string,
  messageContent: string
): Promise<string> {
  const prompt = `You are an AI assistant helping to draft a reply to a customer's message.
  
CUSTOMER NAME: ${customerName}
CUSTOMER MESSAGE: "${messageContent}"

INSTRUCTIONS:
1. Write a short, professional, and helpful reply to the customer's message.
2. The message will be sent via SMS or WhatsApp, so keep it concise (under 300 characters).
3. Do NOT include placeholders like [Your Name]. Just provide the text of the reply.
4. Respond ONLY with the text of the message.`

  try {
    const { text } = await generateText({
      model: fastModel as any,
      prompt
    })
    return text.trim()
  } catch (error) {
    logger.error({ error }, 'Failed to generate draft reply')
    return `Hi ${customerName}, we received your message and will get back to you shortly.`
  }
}
