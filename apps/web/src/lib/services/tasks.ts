import { prisma } from '@autostate/database'
import type { TaskStatus, TaskType } from '@autostate/database'

export interface GetTasksParams {
  companyId: string
  status?: TaskStatus
  type?: TaskType
}

export async function getTasks({ companyId, status = 'PENDING', type }: GetTasksParams) {
  const tasks = await prisma.task.findMany({
    where: {
      customer: {
        companyId
      },
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
