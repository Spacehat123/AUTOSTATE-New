import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@autostate/database'
import { getCurrentUser } from '@/lib/auth'
import { requireAuthorizedUser, InsufficientRoleError, roleErrorResponse } from '@/lib/rbac'

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    requireAuthorizedUser(user)
  } catch (error) {
    if (error instanceof InsufficientRoleError) return roleErrorResponse()
    throw error
  }

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
      return NextResponse.json({ error: 'Email configuration not found' }, { status: 400 })
    }

    const config = integration.config as any
    if (!config.apiKey || !config.fromEmail) {
      return NextResponse.json({ error: 'Incomplete email configuration' }, { status: 400 })
    }

    // Send a test email using Resend API via plain fetch (no SDK required)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${config.fromName} <${config.fromEmail}>`,
        to: [user.email],
        subject: 'Autostate Email Integration Test',
        html: '<p>👋 Hi from Autostate! Your email integration is successfully connected and working.</p>'
      })
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || 'Failed to send test email')
    }

    return NextResponse.json({ success: true, deliveredTo: user.email })
  } catch (error: any) {
    console.error('[SETTINGS_EMAIL_TEST]', error)
    return NextResponse.json({ 
      error: 'Failed to send test email. Please verify your Resend API Key and verified domain.',
      details: error?.message
    }, { status: 500 })
  }
}
