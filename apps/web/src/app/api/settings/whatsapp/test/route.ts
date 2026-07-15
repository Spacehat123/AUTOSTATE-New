import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@autostate/database'
import { getCurrentUser } from '@/lib/auth'
import { sendTextMessage } from '@/lib/whatsapp'

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: { name: true, phone: true }
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    if (!company.phone) {
      return NextResponse.json({ 
        error: 'No company phone number set. Please add a phone number in the Company Settings tab to test WhatsApp.' 
      }, { status: 400 })
    }

    // Try to send a test message
    const testMessage = `👋 Hi from Autostate! Your WhatsApp integration for ${company.name} is successfully connected and working.`
    
    await sendTextMessage(company.phone, testMessage)

    return NextResponse.json({ success: true, deliveredTo: company.phone })
  } catch (error: any) {
    console.error('[SETTINGS_WHATSAPP_TEST]', error)
    return NextResponse.json({ 
      error: error?.message || 'Failed to send test message. Check your WhatsApp Cloud API credentials.'
    }, { status: 500 })
  }
}
