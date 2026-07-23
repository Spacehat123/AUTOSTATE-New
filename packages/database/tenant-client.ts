import { prisma } from './index'

export function withTenant(companyId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const directCompanyModels = [
            'User', 'Customer', 'CompanyIntegration', 'Payment', 
            'ImportJob', 'AuditLog', 'Subscription'
          ]
          const customerRelatedModels = [
            'Invoice', 'Message', 'Promise', 'Task', 'PortalAccessToken'
          ]
          const paymentRelatedModels = ['PaymentAllocation']
          
          const tenantModels = [
            ...directCompanyModels, 
            ...customerRelatedModels, 
            ...paymentRelatedModels
          ]
          
          if (!tenantModels.includes(model)) {
            return query(args)
          }

          let filter: any = {}
          if (directCompanyModels.includes(model)) {
            filter = { companyId }
          } else if (customerRelatedModels.includes(model)) {
            filter = { customer: { companyId } }
          } else if (paymentRelatedModels.includes(model)) {
            filter = { payment: { companyId } }
          }

          const listOperations = ['findMany', 'findFirst', 'findFirstOrThrow', 'count', 'updateMany', 'deleteMany', 'aggregate', 'groupBy']
          const uniqueOperations = ['findUnique', 'findUniqueOrThrow', 'update', 'delete']

          if (listOperations.includes(operation)) {
            (args as any).where = { ...(args as any).where, ...filter }
          } 
          else if (uniqueOperations.includes(operation)) {
            // Verify ownership before proceeding
            const record = await (prisma as any)[model].findFirst({
              where: { ...(args as any).where, ...filter },
              select: { id: true }
            })
            if (!record) {
              if (operation === 'findUnique') return null
              throw new Error(`Record not found or access denied for tenant ${companyId}`)
            }
          }

          const hasDirectCompanyId = directCompanyModels.includes(model)
          if (operation === 'create' && hasDirectCompanyId) {
            (args as any).data = { ...(args as any).data, companyId }
          } else if (operation === 'createMany' && hasDirectCompanyId) {
            if (Array.isArray((args as any).data)) {
              (args as any).data = (args as any).data.map((d: any) => ({ ...d, companyId }))
            } else if ((args as any).data) {
              (args as any).data.companyId = companyId
            }
          }

          return query(args)
        }
      }
    }
  })
}

export function getTenantDb(companyId: string) {
  return withTenant(companyId)
}
