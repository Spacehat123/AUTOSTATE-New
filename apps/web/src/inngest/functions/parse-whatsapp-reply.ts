import { inngest } from '../client'
import { prisma } from '@autostate/database'
import { parseReply } from '@autostate/ai'

export const parseWhatsappReply = (inngest.createFunction as any)(
  { id: 'parse-whatsapp-reply', name: 'Parse WhatsApp Reply for Intent' },
  { event: 'whatsapp.message.received' },
  async ({ event, step }) => {
    const { messageId } = event.data

    const message = await step.run('fetch-message', async () => {
      return prisma.message.findUnique({
        where: { id: messageId },
        include: { customer: true }
      })
    })

    if (!message) {
      return { success: false, reason: 'Message not found' }
    }

    // Call AI to parse intent
    const parsed = await step.run('parse-intent', async () => {
      return parseReply(message.content, message.customer.name)
    })

    // Update message summary
    await step.run('update-message-summary', async () => {
      const summaryParts = [`Intent: ${parsed.intent}`]
      if (parsed.amount) summaryParts.push(`Amount: ${parsed.amount}`)
      if (parsed.date) summaryParts.push(`Date: ${parsed.date}`)
        
      await prisma.message.update({
        where: { id: message.id },
        data: { aiSummary: summaryParts.join(' | ') }
      })
    })

    // Create a promise to pay if the intent is strong
    if (parsed.intent === 'promise_to_pay' && parsed.confidence > 0.85 && parsed.date) {
      await step.run('create-promise-and-task', async () => {
        const expectedDate = new Date(parsed.date!)
        const taskDueDate = new Date(expectedDate)
        taskDueDate.setDate(taskDueDate.getDate() + 1) // Follow up day after promise

        await prisma.$transaction(async (tx) => {
          await tx.promise.create({
            data: {
              customerId: message.customerId,
              messageId: message.id,
              expectedDate,
              amount: parsed.amount || null,
              aiConfidence: parsed.confidence,
              createdByAI: true,
              status: 'PENDING'
            }
          })

          await tx.task.create({
            data: {
              customerId: message.customerId,
              taskType: 'FOLLOW_UP',
              priority: 80,
              reason: `AI detected a promise to pay on ${expectedDate.toLocaleDateString()}`,
              dueDate: taskDueDate,
              status: 'PENDING'
            }
          })
        })
      })
    }

    return { success: true, parsed }
  }
)
