import { prisma } from '@autostate/database'

export interface GetCustomersParams {
  companyId: string
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export async function getCustomers({
  companyId,
  search = '',
  page = 1,
  limit = 20,
  sortBy = 'name',
  sortOrder = 'asc'
}: GetCustomersParams) {
  const skip = (page - 1) * limit

  const validSortFields = ['name', 'riskScore', 'createdAt', 'updatedAt', 'totalOutstanding', 'oldestInvoiceDays']
  const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'name'
  const isPrismaSort = ['name', 'riskScore', 'createdAt', 'updatedAt'].includes(actualSortBy)

  const where = {
    companyId,
    ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {})
  }

  // 1. Get total count
  const total = await prisma.customer.count({ where })

  // 2. Fetch customers. If not sorting by a Prisma field, we must fetch all matching to sort in memory!
  // In a real prod app with millions of rows, we'd use a raw SQL view or precomputed DB columns.
  const customers = await prisma.customer.findMany({
    where,
    skip: isPrismaSort ? skip : undefined,
    take: isPrismaSort ? limit : undefined,
    orderBy: isPrismaSort ? { [actualSortBy]: sortOrder } : undefined,
    include: {
      invoices: {
        where: {
          status: 'OVERDUE'
        },
        select: {
          outstandingAmount: true,
          dueDate: true
        }
      },
      messages: {
        orderBy: {
          timestamp: 'desc'
        },
        take: 1,
        select: {
          timestamp: true
        }
      }
    }
  })

  // 3. Compute virtual fields
  const now = new Date()
  let data = customers.map(customer => {
    let totalOutstanding = 0
    let oldestInvoiceDays = 0

    if (customer.invoices.length > 0) {
      totalOutstanding = customer.invoices.reduce((sum, inv) => sum + Number(inv.outstandingAmount), 0)
      
      const oldestDate = new Date(Math.min(...customer.invoices.map(inv => inv.dueDate.getTime())))
      const diffTime = now.getTime() - oldestDate.getTime()
      if (diffTime > 0) {
        oldestInvoiceDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      }
    }

    const lastContact = customer.messages.length > 0 ? customer.messages[0].timestamp : null
    const { invoices, messages, ...rest } = customer

    return {
      ...rest,
      totalOutstanding,
      oldestInvoiceDays,
      lastContact
    }
  })

  // 4. In-memory sort if needed
  if (!isPrismaSort) {
    data.sort((a, b) => {
      const aVal = a[actualSortBy as keyof typeof a] as number
      const bVal = b[actualSortBy as keyof typeof b] as number
      if (sortOrder === 'desc') {
        return bVal - aVal
      }
      return aVal - bVal
    })
    
    // Apply pagination post-sort
    data = data.slice(skip, skip + limit)
  }

  return {
    data,
    total,
    page,
    limit
  }
}

export async function getCustomerById(id: string, companyId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      invoices: {
        orderBy: { dueDate: 'asc' }
      },
      messages: {
        orderBy: { timestamp: 'asc' }
      },
      promises: {
        orderBy: { expectedDate: 'asc' }
      },
      tasks: {
        orderBy: { priority: 'desc' }
      }
    }
  })

  if (!customer) {
    return { error: 'Customer not found', status: 404 }
  }

  if (customer.companyId !== companyId) {
    return { error: 'Forbidden', status: 403 }
  }

  return { data: customer }
}
