// Prisma client passed directly to methods
import type { TaskStatus, TaskType } from '@autostate/database'

export interface GetTasksParams {
  db: any
  status?: TaskStatus
  type?: TaskType
  assignedTo?: string | null
  requestingUserRole?: string
  requestingUserId?: string
}

export async function getTasks({ 
  db, 
  status = 'PENDING', 
  type, 
  assignedTo, 
  requestingUserRole, 
  requestingUserId 
}: GetTasksParams) {
  // Authorization check: If a regular MEMBER requests tasks for someone else, reject or force to their own ID.
  if (assignedTo && assignedTo !== 'me' && requestingUserRole === 'MEMBER' && requestingUserId !== assignedTo) {
    throw new Error("Unauthorized to view other users' assigned tasks")
  }

  const finalAssignedTo = assignedTo === 'me' ? requestingUserId : assignedTo

  const tasks = await db.task.findMany({
    where: {
      status,
      ...(type ? { taskType: type } : {}),
      ...(finalAssignedTo ? { assignedTo: finalAssignedTo } : {})
    },
    // Ordering: dueDate asc (overdue first), then priority desc, then createdAt asc
    orderBy: [
      { dueDate: 'asc' },
      { priority: 'desc' },
      { createdAt: 'asc' }
    ],
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
          riskScore: true
        }
      }
    }
  })

  return { data: tasks }
}
