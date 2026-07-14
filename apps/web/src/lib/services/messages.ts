import { prisma } from '@autostate/database'

export async function getMessageInbox(companyId: string) {
  // Fetch all customers in this company that have at least one message,
  // ordered by the most recent message timestamp descending.
  const customers = await prisma.customer.findMany({
    where: {
      companyId,
      messages: {
        some: {}
      }
    },
    include: {
      messages: {
        orderBy: { timestamp: 'desc' },
        take: 1,          // Only the latest message per customer
        select: {
          id: true,
          content: true,
          timestamp: true,
          direction: true,
          type: true
        }
      },
      _count: {
        select: {
          // Count of incoming messages with no linked task (unprocessed)
          messages: true
        }
      }
    }
  })

  // Count unread (INCOMING with no task) per customer in one query
  const unreadCounts = await prisma.message.groupBy({
    by: ['customerId'],
    where: {
      customer: { companyId },
      direction: 'INCOMING',
      taskId: null
    },
    _count: { id: true }
  })

  const unreadMap = new Map(
    unreadCounts.map(r => [r.customerId, r._count.id])
  )

  // Shape and sort by most recent message timestamp
  const inbox = customers
    .map(customer => {
      const latest = customer.messages[0]
      if (!latest) return null

      return {
        customerId: customer.id,
        customerName: customer.name,
        phone: customer.phone,
        latestMessage: latest.content.slice(0, 100),   // Truncate to 100 chars
        latestMessageAt: latest.timestamp,
        latestMessageDirection: latest.direction,
        latestMessageType: latest.type,
        unreadCount: unreadMap.get(customer.id) ?? 0
      }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b!.latestMessageAt).getTime() - new Date(a!.latestMessageAt).getTime())

  return { data: inbox }
}
