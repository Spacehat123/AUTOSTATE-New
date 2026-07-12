import { prisma } from '@autostate/database'

export async function getDashboardData(companyId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [
    collectionsResult,
    overdueResult,
    customersRequiringAction,
    promisesDueToday,
    messagesWaiting,
    todaysTasks,
  ] = await Promise.all([
    // 1. todaysCollections: Sum of Invoice.amount where paidDate = today and status = PAID
    prisma.invoice.aggregate({
      where: {
        customer: { companyId },
        status: 'PAID',
        paidDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      _sum: {
        amount: true,
      },
    }),

    // 2. totalOverdue: Sum of Invoice.outstandingAmount where status = OVERDUE
    prisma.invoice.aggregate({
      where: {
        customer: { companyId },
        status: 'OVERDUE',
      },
      _sum: {
        outstandingAmount: true,
      },
    }),

    // 3. customersRequiringAction: Count of customers with at least one OVERDUE invoice
    prisma.customer.count({
      where: {
        companyId,
        invoices: {
          some: {
            status: 'OVERDUE',
          },
        },
      },
    }),

    // 4. promisesDueToday: Count of Promise where expectedDate = today and status = PENDING
    prisma.promise.count({
      where: {
        customer: { companyId },
        status: 'PENDING',
        expectedDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    }),

    // 5. messagesWaiting: Count of Message where direction = INCOMING
    prisma.message.count({
      where: {
        customer: { companyId },
        direction: 'INCOMING',
      },
    }),

    // 6. todaysTasks: Top 10 Task records with status = PENDING, ordered by priority DESC
    prisma.task.findMany({
      where: {
        customer: { companyId },
        status: 'PENDING',
      },
      orderBy: {
        priority: 'desc',
      },
      take: 10,
      include: {
        customer: true,
      },
    }),
  ])

  return {
    todaysCollections: collectionsResult._sum.amount || 0,
    totalOverdue: overdueResult._sum.outstandingAmount || 0,
    customersRequiringAction,
    promisesDueToday,
    messagesWaiting,
    todaysTasks,
  }
}
