import { inngest } from '../client'
import { prisma } from '@autostate/database'

export const promiseFollowUpCheck = inngest.createFunction(
  { id: 'promise-follow-up-check', name: 'Promise Follow-Up Check', triggers: [{ cron: '30 3 * * *' }] }, // 3:30 AM UTC = 9:00 AM IST
  async ({ step }) => {
    // 1. Fetch pending promises where the expected date has passed
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const pastDuePromises = await step.run('fetch-past-due-promises', async () => {
      return prisma.promise.findMany({
        where: {
          status: 'PENDING',
          expectedDate: {
            lt: today
          }
        },
        include: {
          customer: true
        }
      })
    })

    const results = { kept: 0, broken: 0 }

    // 2. Evaluate each promise
    for (const promise of pastDuePromises) {
      await step.run(`evaluate-promise-${promise.id}`, async () => {
        // Check if any invoice was paid by this customer AFTER the promise was made
        const recentPayment = await prisma.invoice.findFirst({
          where: {
            customerId: promise.customerId,
            status: 'PAID',
            paidAt: {
              gt: promise.createdAt
            }
          }
        })

        if (recentPayment) {
          // Promise KEPT
          await prisma.promise.update({
            where: { id: promise.id },
            data: { status: 'KEPT' }
          })
          results.kept++
        } else {
          // Promise BROKEN
          await prisma.$transaction(async (tx) => {
            await tx.promise.update({
              where: { id: promise.id },
              data: { status: 'BROKEN' }
            })

            await tx.task.create({
              data: {
                customerId: promise.customerId,
                taskType: 'ESCALATE',
                priority: 90, // Very high priority
                reason: 'Customer broke payment promise',
                status: 'PENDING'
              }
            })
          })
          results.broken++
        }
      })
    }

    return { 
      message: `Evaluated ${pastDuePromises.length} past-due promises`,
      results 
    }
  }
)
