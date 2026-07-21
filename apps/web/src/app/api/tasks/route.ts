import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getTasks } from '@/lib/services/tasks'
import type { TaskStatus, TaskType } from '@autostate/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  const { searchParams } = new URL(request.url)
  
  const status = (searchParams.get('status') || 'PENDING') as TaskStatus
  const type = (searchParams.get('type') as TaskType) || undefined

  try {
    const result = await getTasks({
      db: user.db,
      status,
      type
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[TASKS_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
