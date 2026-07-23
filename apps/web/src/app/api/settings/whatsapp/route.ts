import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@autostate/database'
import { getCurrentUser } from '@/lib/auth'
import { encrypt, decrypt } from '@autostate/shared'

export const dynamic = 'force-dynamic'

const configSchema = z.object({
  phoneNumberId: z.string().min(1),
  accessToken: z.string().min(1),
  verifyToken: z.string().min(1)
})

function maskString(str: string | undefined): string {
  if (!str) return ''
  if (str.length < 8) return '••••••••'
  return `${str.substring(0, 4)}••••••••••••${str.substring(str.length - 4)}`
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    const integration = await prisma.companyIntegration.findUnique({
      where: { companyId_type: { companyId: user.companyId, type: 'WHATSAPP' } }
    })

    if (!integration) {
      return NextResponse.json({
        isConfigured: false,
        config: {
          phoneNumberId: '',
          accessToken: '',
          verifyToken: '',
          integrationId: ''
        }
      })
    }

    const config = integration.config as any
    const isConfigured = !!(config.phoneNumberId && config.accessToken && config.verifyToken)

    return NextResponse.json({
      isConfigured,
      config: {
        phoneNumberId: config.phoneNumberId || '',
        accessToken: config.accessToken ? maskString(config.accessToken) : '',
        verifyToken: config.verifyToken ? maskString(config.verifyToken) : '',
        integrationId: integration.id
      }
    })
  } catch (error) {
    console.error('[SETTINGS_WHATSAPP_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    const body = await request.json()
    const parsed = configSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 })
    }

    let { phoneNumberId, accessToken, verifyToken } = parsed.data

    const existing = await prisma.companyIntegration.findUnique({
      where: { companyId_type: { companyId: user.companyId, type: 'WHATSAPP' } }
    })

    // If the input is masked, preserve the existing encrypted token
    if (accessToken.includes('••••')) {
      accessToken = existing ? (existing.config as any).accessToken : ''
    } else {
      accessToken = encrypt(accessToken)
    }

    if (verifyToken.includes('••••')) {
      verifyToken = existing ? (existing.config as any).verifyToken : ''
    } else {
      verifyToken = encrypt(verifyToken)
    }

    const configToSave = {
      phoneNumberId,
      accessToken,
      verifyToken
    }

    await prisma.companyIntegration.upsert({
      where: { companyId_type: { companyId: user.companyId, type: 'WHATSAPP' } },
      update: { config: configToSave },
      create: {
        companyId: user.companyId,
        type: 'WHATSAPP',
        config: configToSave
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[SETTINGS_WHATSAPP_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
