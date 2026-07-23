import { prisma } from '@autostate/database'

export async function getDashboardData(companyId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)

  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [
    collectionsResult,
    overdueResult,
    outstandingResult,
    cashCollectedThisMonthResult,
    activePromisesCount,
    overdueCustomersCount,
    overdueInvoicesCount,
    needsAttentionTasks,
    todaysTasks,
    monthlyCollections,
    recentMessages,
    recentPayments,
    expectedResult
  ] = await Promise.all([
    // 1. todaysCollections
    prisma.payment.aggregate({
      where: { companyId, receivedAt: { gte: today, lt: tomorrow } },
      _sum: { amount: true },
    }),

    // 2. totalOverdue
    prisma.invoice.aggregate({
      where: { customer: { companyId }, outstandingAmount: { gt: 0 }, dueDate: { lt: today } },
      _sum: { outstandingAmount: true },
    }),

    // 3. totalOutstanding
    prisma.invoice.aggregate({
      where: { customer: { companyId }, outstandingAmount: { gt: 0 } },
      _sum: { outstandingAmount: true },
    }),

    // 4. cashCollectedThisMonth
    prisma.payment.aggregate({
      where: { companyId, receivedAt: { gte: firstDayOfMonth } },
      _sum: { amount: true },
    }),

    // 5. activePromisesToPay (Count)
    prisma.promise.count({
      where: { customer: { companyId }, status: 'PENDING' }
    }),

    // 6. overdueCustomersCount
    prisma.customer.count({
      where: { companyId, invoices: { some: { outstandingAmount: { gt: 0 }, dueDate: { lt: today } } } },
    }),

    // 7. overdueInvoicesCount
    prisma.invoice.count({
      where: { customer: { companyId }, outstandingAmount: { gt: 0 }, dueDate: { lt: today } },
    }),

    // 8. needsAttentionTasks (High priority tasks)
    prisma.task.findMany({
      where: { customer: { companyId }, status: 'PENDING', priority: { gte: 70 } },
      orderBy: { priority: 'desc' },
      take: 5,
      include: { customer: true },
    }),

    // 9. todaysTasks
    prisma.task.findMany({
      where: { customer: { companyId }, status: 'PENDING' },
      orderBy: { priority: 'desc' },
      take: 3,
      include: { 
        customer: {
          include: {
            invoices: {
              where: { outstandingAmount: { gt: 0 }, dueDate: { lt: today } },
              select: { outstandingAmount: true }
            }
          }
        } 
      },
    }),

    // 10. monthlyCollections: All paid invoices this month
    prisma.payment.findMany({
      where: { companyId, receivedAt: { gte: firstDayOfMonth } },
      select: { amount: true, receivedAt: true }
    }),

    // 11. recentMessages
    prisma.message.findMany({
      where: { customer: { companyId } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { customer: true }
    }),

    // 12. recentPayments
    prisma.payment.findMany({
      where: { companyId },
      orderBy: { receivedAt: 'desc' },
      take: 5,
      include: { allocations: { include: { invoice: { include: { customer: true } } } } }
    }),

    // 13. expectedResult
    prisma.invoice.aggregate({
      where: { customer: { companyId }, status: 'PENDING', dueDate: { gte: today, lte: nextWeek } },
      _sum: { amount: true }
    })
  ])

  // Build Recent Activity Feed
  const activities = [
    ...recentMessages.map(m => ({
      id: `msg-${m.id}`,
      type: m.direction === 'INCOMING' ? 'MESSAGE_RECEIVED' : 'MESSAGE_SENT',
      text: m.direction === 'INCOMING' ? `Message received from ${m.customer.name}` : `Message sent to ${m.customer.name}`,
      date: m.createdAt
    })),
    ...recentPayments.map(p => ({
      id: `pay-${p.id}`,
      type: 'PAYMENT',
      text: `Payment of ₹${p.amount} recorded${p.allocations[0] ? ` for ${p.allocations[0].invoice.customer.name}` : ''}`,
      date: p.receivedAt
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5)

  // Build Monthly Collections Chart Data
  const monthlyData = [
    { name: 'Week 1', total: 0 },
    { name: 'Week 2', total: 0 },
    { name: 'Week 3', total: 0 },
    { name: 'Week 4', total: 0 },
  ]

  monthlyCollections.forEach(inv => {
    const day = inv.receivedAt.getDate()
    let weekIdx = Math.floor((day - 1) / 7)
    if (weekIdx > 3) weekIdx = 3 // Put extra days in week 4
    const targetWeek = monthlyData[weekIdx]
    if (targetWeek) {
      targetWeek.total += Number(inv.amount)
    }
  })

  return {
    todaysCollections: collectionsResult._sum.amount || 0,
    totalOverdue: overdueResult._sum.outstandingAmount || 0,
    totalOutstanding: outstandingResult._sum.outstandingAmount || 0,
    cashCollectedThisMonth: cashCollectedThisMonthResult._sum.amount || 0,
    activePromisesToPay: activePromisesCount || 0,
    expectedCollections: expectedResult._sum.amount || 0,
    overdueCustomersCount,
    overdueInvoicesCount,
    needsAttentionTasks,
    todaysTasks,
    monthlyChartData: monthlyData,
    recentActivity: activities,
  }
}
