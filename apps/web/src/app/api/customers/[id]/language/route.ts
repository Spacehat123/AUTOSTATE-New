import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  preferredLanguage: z.string().min(1)
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()

  try {
    const { id } = await params
    const body = await request.json()
    const { preferredLanguage } = schema.parse(body)

    const customer = await user.db.customer.update({
      where: { id, companyId: user.companyId },
      data: { preferredLanguage }
    })

    return NextResponse.json(customer)
  } catch (error: any) {
    console.error('[CUSTOMER_LANGUAGE_PATCH]', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
