import { prisma } from '@autostate/database'

export async function getDashboardData(companyId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)

  const [
    collectionsResult,
    overdueResult,
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
    prisma.invoice.aggregate({
      where: { customer: { companyId }, status: 'PAID', paidDate: { gte: today, lt: tomorrow } },
      _sum: { amount: true },
    }),

    // 2. totalOverdue
    prisma.invoice.aggregate({
      where: { customer: { companyId }, status: 'OVERDUE' },
      _sum: { outstandingAmount: true },
    }),

    // 3. overdueCustomersCount
    prisma.customer.count({
      where: { companyId, invoices: { some: { status: 'OVERDUE' } } },
    }),

    // 4. overdueInvoicesCount
    prisma.invoice.count({
      where: { customer: { companyId }, status: 'OVERDUE' },
    }),

    // 5. needsAttentionTasks (High priority tasks)
    prisma.task.findMany({
      where: { customer: { companyId }, status: 'PENDING', priority: { gte: 70 } },
      orderBy: { priority: 'desc' },
      take: 5,
      include: { customer: true },
    }),

    // 6. todaysTasks
    prisma.task.findMany({
      where: { customer: { companyId }, status: 'PENDING' },
      orderBy: { priority: 'desc' },
      take: 3,
      include: { 
        customer: {
          include: {
            invoices: {
              where: { status: 'OVERDUE' },
              select: { outstandingAmount: true }
            }
          }
        } 
      },
    }),

    // 7. monthlyCollections: All paid invoices this month
    prisma.invoice.findMany({
      where: { 
        customer: { companyId }, 
        status: 'PAID',
        paidDate: { gte: new Date(today.getFullYear(), today.getMonth(), 1) } 
      },
      select: { amount: true, paidDate: true }
    }),

    // 8. recentMessages
    prisma.message.findMany({
      where: { customer: { companyId } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { customer: true }
    }),

    // 9. recentPayments
    prisma.invoice.findMany({
      where: { customer: { companyId }, status: 'PAID' },
      orderBy: { paidDate: 'desc' },
      take: 5,
      include: { customer: true }
    }),

    // 10. expectedResult
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
    ...recentPayments.filter(p => p.paidDate).map(p => ({
      id: `pay-${p.id}`,
      type: 'PAYMENT',
      text: `Payment of ₹${p.amount} recorded for ${p.customer.name}`,
      date: p.paidDate as Date
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5)

  // Build Monthly Collections Chart Data
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const monthlyData = [
    { name: 'Week 1', total: 0 },
    { name: 'Week 2', total: 0 },
    { name: 'Week 3', total: 0 },
    { name: 'Week 4', total: 0 },
  ]

  monthlyCollections.forEach(inv => {
    if (!inv.paidDate) return
    const day = inv.paidDate.getDate()
    let weekIdx = Math.floor((day - 1) / 7)
    if (weekIdx > 3) weekIdx = 3 // Put extra days in week 4
    monthlyData[weekIdx].total += Number(inv.amount)
  })

  return {
    todaysCollections: collectionsResult._sum.amount || 0,
    totalOverdue: overdueResult._sum.outstandingAmount || 0,
    expectedCollections: expectedResult._sum.amount || 0,
    overdueCustomersCount,
    overdueInvoicesCount,
    needsAttentionTasks,
    todaysTasks,
    monthlyChartData: monthlyData,
    recentActivity: activities,
  }
}
