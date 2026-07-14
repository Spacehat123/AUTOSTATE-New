import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getMessageInbox } from '@/lib/services/messages'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    const result = await getMessageInbox(user.companyId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[MESSAGES_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
