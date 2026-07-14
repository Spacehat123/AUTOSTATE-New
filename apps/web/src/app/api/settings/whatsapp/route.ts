import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function maskString(str: string | undefined): string {
  if (!str) return ''
  if (str.length < 8) return '********'
  return `${str.substring(0, 4)}••••••••••••${str.substring(str.length - 4)}`
}

export async function GET(request: NextRequest) {
  await getCurrentUser() // Just for auth check

  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN
    
    // In MVP, we use global env vars for WhatsApp.
    // In a true multi-tenant SAAS, these would be in the DB per company.
    const isConfigured = !!(phoneNumberId && accessToken && verifyToken)

    return NextResponse.json({
      isConfigured,
      config: {
        phoneNumberId: phoneNumberId || '',
        accessToken: maskString(accessToken),
        verifyToken: maskString(verifyToken),
        webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/api/webhooks/whatsapp`
      }
    })
  } catch (error) {
    console.error('[SETTINGS_WHATSAPP_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
