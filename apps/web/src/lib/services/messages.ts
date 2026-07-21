// Prisma client passed directly to methods

export async function getMessageInbox(db: any) {
  // Fetch all customers in this company that have at least one message,
  // ordered by the most recent message timestamp descending.
  const customers = await db.customer.findMany({
    where: {
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

  // Count unread (INCOMING) per customer in one query
  const unreadCounts = await db.message.groupBy({
    by: ['customerId'],
    where: {
      direction: 'INCOMING'
    },
    _count: { id: true }
  })

  const unreadMap = new Map(
    unreadCounts.map((r: any) => [r.customerId, r._count?.id ?? 0])
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
