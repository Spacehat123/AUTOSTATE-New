import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@autostate/database'
import { getCurrentUser } from '@/lib/auth'

const emailConfigSchema = z.object({
  fromEmail: z.string().email(),
  fromName: z.string().min(1),
  apiKey: z.string().min(1), // Using Resend API for MVP
})

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    const integration = await prisma.companyIntegration.findUnique({
      where: {
        companyId_type: {
          companyId: user.companyId,
          type: 'EMAIL'
        }
      }
    })

    if (!integration) {
      return NextResponse.json({ config: null })
    }

    const config = integration.config as any
    // Mask the API key when sending to the frontend
    const maskedKey = config.apiKey ? `${config.apiKey.substring(0, 8)}••••••••••••` : ''

    return NextResponse.json({
      config: {
        fromEmail: config.fromEmail,
        fromName: config.fromName,
        apiKey: maskedKey
      }
    })
  } catch (error) {
    console.error('[SETTINGS_EMAIL_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    const body = await request.json()
    const parsed = emailConfigSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 })
    }

    // Check if we are updating, and if the API key is masked (meaning unchanged)
    let newApiKey = parsed.data.apiKey
    if (newApiKey.includes('••••')) {
      const existing = await prisma.companyIntegration.findUnique({
        where: { companyId_type: { companyId: user.companyId, type: 'EMAIL' } }
      })
      if (existing) {
        newApiKey = (existing.config as any).apiKey
      }
    }

    const configToSave = {
      fromEmail: parsed.data.fromEmail,
      fromName: parsed.data.fromName,
      apiKey: newApiKey
    }

    const integration = await prisma.companyIntegration.upsert({
      where: {
        companyId_type: {
          companyId: user.companyId,
          type: 'EMAIL'
        }
      },
      update: { config: configToSave },
      create: {
        companyId: user.companyId,
        type: 'EMAIL',
        config: configToSave
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[SETTINGS_EMAIL_PATCH]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
