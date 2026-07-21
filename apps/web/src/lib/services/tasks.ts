// Prisma client passed directly to methods
import type { TaskStatus, TaskType } from '@autostate/database'

export interface GetTasksParams {
  db: any
  status?: TaskStatus
  type?: TaskType
}

export async function getTasks({ db, status = 'PENDING', type }: GetTasksParams) {
  const tasks = await db.task.findMany({
    where: {
      status,
      ...(type ? { taskType: type } : {})
    },
    orderBy: {
      priority: 'desc'
    },
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
