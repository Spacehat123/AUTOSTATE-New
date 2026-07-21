import { prisma } from './index'

export async function logAction(
  companyId: string,
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: any
) {
  try {
    await prisma.auditLog.create({
      data: {
        companyId,
        userId,
        action,
        entityType,
        entityId,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null
      }
    })
  } catch (error) {
    console.error('[AUDIT_LOG_ERROR]', error)
    // We intentionally don't throw to prevent audit log failures from breaking requests
  }
}
