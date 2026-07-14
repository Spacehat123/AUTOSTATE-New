import { prisma } from '@autostate/database'
import { calculatePriorityScore, ScoringInvoice, ScoringPromise, ScoringMessage } from './prioritization'

// ─────────────────────────────────────────────────────────────────────────────
// Task type determination
// ─────────────────────────────────────────────────────────────────────────────

type TaskType = 'ESCALATE' | 'SEND_REMINDER' | 'CALL' | 'FOLLOW_UP'

interface TaskDecision {
  taskType: TaskType
  reason: string
}

function determineTaskType(
  invoices: ScoringInvoice[],
  promises: ScoringPromise[],
  messages: ScoringMessage[]
): TaskDecision {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  // Rule 1: Broken promise → ESCALATE (highest urgency)
  const hasBrokenPromise = promises.some(p => p.status === 'BROKEN')
  if (hasBrokenPromise) {
    const count = promises.filter(p => p.status === 'BROKEN').length
    return {
      taskType: 'ESCALATE',
      reason: `Customer has ${count} broken promise${count > 1 ? 's' : ''} to pay. Escalate to owner.`
    }
  }

  // Rule 2: Pending promise due today or earlier → SEND_REMINDER
  const pendingDue = promises.find(p => {
    if (p.status !== 'PENDING') return false
    const due = new Date(p.expectedDate)
    due.setHours(0, 0, 0, 0)
    return due <= now
  })
  if (pendingDue) {
    const dueDate = new Date(pendingDue.expectedDate).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short'
    })
    return {
      taskType: 'SEND_REMINDER',
      reason: `Customer promised to pay by ${dueDate}. Send a payment reminder now.`
    }
  }

  // Rule 3: No outgoing message in last 3 days + overdue invoices → CALL
  const threeDaysAgo = new Date(now)
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  const hasRecentOutgoing = messages.some(
    msg => msg.direction === 'OUTGOING' && new Date(msg.timestamp) >= threeDaysAgo
  )

  const hasOverdue = invoices.some(inv => inv.status === 'OVERDUE' || inv.status === 'PARTIAL')

  if (!hasRecentOutgoing && hasOverdue) {
    return {
      taskType: 'CALL',
      reason: 'No contact in the last 3 days. Call the customer to follow up on overdue payment.'
    }
  }

  // Default: FOLLOW_UP
  return {
    taskType: 'FOLLOW_UP',
    reason: 'Customer has overdue invoices. Follow up to check on payment status.'
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export: Generate / refresh tasks for an entire company
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates (or updates) Task records for every customer with overdue invoices.
 * Safe to run repeatedly — uses upsert so re-running never creates duplicates.
 * Also cleans up stale PENDING tasks for customers who are now fully paid.
 */
export async function generateTasksForCompany(companyId: string): Promise<void> {
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  // Fetch all customers in the company with the data we need for scoring
  const customers = await prisma.customer.findMany({
    where: { companyId },
    include: {
      invoices: {
        select: {
          id: true,
          amount: true,
          outstandingAmount: true,
          status: true,
          dueDate: true,
          paidDate: true,
          createdAt: true
        }
      },
      promises: {
        select: {
          status: true,
          expectedDate: true
        }
      },
      messages: {
        orderBy: { timestamp: 'desc' },
        take: 20,       // Only need recent messages for scoring
        select: {
          timestamp: true,
          direction: true
        }
      },
      tasks: {
        where: { status: 'PENDING' },
        select: { id: true, taskType: true }
      }
    }
  })

  const customerIds = customers.map(c => c.id)
  const processedCustomerIds: string[] = []

  for (const customer of customers) {
    const overdueInvoices = customer.invoices.filter(
      inv => inv.status === 'OVERDUE' || inv.status === 'PARTIAL'
    )

    // Skip customers with no overdue invoices — clean up their tasks below
    if (overdueInvoices.length === 0) continue

    processedCustomerIds.push(customer.id)

    // 1. Calculate priority score
    const priority = calculatePriorityScore({
      invoices: customer.invoices,
      promises: customer.promises,
      messages: customer.messages
    })

    // 2. Determine what action is needed
    const { taskType, reason } = determineTaskType(
      customer.invoices,
      customer.promises,
      customer.messages
    )

    // 3. Upsert the task — update existing PENDING task or create a new one
    const existingTask = customer.tasks[0]

    if (existingTask) {
      await prisma.task.update({
        where: { id: existingTask.id },
        data: { priority, taskType, reason }
      })
    } else {
      await prisma.task.create({
        data: {
          customerId: customer.id,
          taskType,
          priority,
          reason,
          status: 'PENDING'
        }
      })
    }
  }

  // 4. Delete stale PENDING tasks for customers who no longer have overdue invoices
  const staleCustomerIds = customerIds.filter(id => !processedCustomerIds.includes(id))

  if (staleCustomerIds.length > 0) {
    await prisma.task.deleteMany({
      where: {
        customerId: { in: staleCustomerIds },
        status: 'PENDING'
      }
    })
  }

  console.log(
    `[TaskGenerator] Company ${companyId}: upserted ${processedCustomerIds.length} tasks, ` +
    `cleaned up ${staleCustomerIds.length} stale tasks`
  )
}
