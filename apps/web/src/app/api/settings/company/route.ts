import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@autostate/database'
import { getCurrentUser } from '@/lib/auth'

const companySettingsSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  gstNumber: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable(),
  address: z.string().optional().nullable()
})

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: {
        id: true,
        name: true,
        gstNumber: true,
        phone: true,
        email: true,
        address: true
      }
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('[SETTINGS_COMPANY_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    const body = await request.json()
    const parsed = companySettingsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 })
    }

    const updatedCompany = await prisma.company.update({
      where: { id: user.companyId },
      data: parsed.data
    })

    return NextResponse.json(updatedCompany)
  } catch (error) {
    console.error('[SETTINGS_COMPANY_PATCH]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
