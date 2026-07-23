import { inngest } from '../client'
import { prisma } from '@autostate/database'
import { extractPromise, generateDraftReply } from '@autostate/ai'

export const analyzeMessage = inngest.createFunction(
  { id: 'analyze-message', name: 'Analyze Message for Intent', triggers: [{ event: 'message.analyze' }] },
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

    // Call AI to extract intent
    const extraction = await step.run('extract-promise', async () => {
      return extractPromise(message.content)
    })

    // Update message summary
    await step.run('update-message-summary', async () => {
      const summaryParts = [`Intent: ${extraction.intent}`]
      if (extraction.amount) summaryParts.push(`Amount: ${extraction.amount}`)
      if (extraction.date) summaryParts.push(`Date: ${extraction.date}`)
        
      await prisma.message.update({
        where: { id: message.id },
        data: { aiSummary: summaryParts.join(' | ') }
      })
    })

    // Create a promise to pay if the intent is strong
    if (extraction.intent === 'promise_to_pay' && extraction.confidence > 85 && extraction.date) {
      await step.run('create-promise', async () => {
        const expectedDate = new Date(extraction.date!)
        const taskDueDate = new Date(expectedDate)
        taskDueDate.setDate(taskDueDate.getDate() + 1) // Follow up day after promise

        await prisma.$transaction(async (tx) => {
          await tx.promise.create({
            data: {
              customerId: message.customerId,
              messageId: message.id,
              expectedDate,
              amount: extraction.amount || null,
              aiConfidence: extraction.confidence,
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

    // Generate draft reply
    const draftReply = await step.run('generate-draft-reply', async () => {
      const reply = await generateDraftReply(message.customer.name, message.content)
      await prisma.message.update({
        where: { id: message.id },
        data: {
          aiDraftReply: reply,
          aiDraftStatus: 'PENDING'
        }
      })
      return reply
    })

    return { success: true, extraction, draftReply }
  }
)
