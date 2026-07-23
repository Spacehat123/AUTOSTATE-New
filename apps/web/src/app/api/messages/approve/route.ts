import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@autostate/database'
import { sendTextMessage } from '@/lib/whatsapp'
import { sendEmail } from '@autostate/email'

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    const { messageId, approvedText, action } = await request.json()

    if (!messageId || !approvedText) {
      return NextResponse.json({ error: 'Missing messageId or approvedText' }, { status: 400 })
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { customer: true }
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Ensure user has access to this customer via companyId
    if (message.customer.companyId !== user.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update draft status
    await prisma.message.update({
      where: { id: messageId },
      data: {
        aiDraftStatus: 'SENT',
        ...(action === 'Edit' ? { aiDraftReply: approvedText } : {})
      }
    })

    // Send the message
    let providerEventId: string | undefined

    if (message.type === 'WHATSAPP') {
      if (!message.customer.phone) throw new Error('Customer has no phone number')
      
      const { getWhatsappCredentials } = await import('@/lib/whatsapp-credentials')
      const credentials = await getWhatsappCredentials(message.customer.companyId)

      const res = await sendTextMessage(
        message.customer.phone,
        approvedText,
        credentials
      )
      providerEventId = res.whatsappId
    } else if (message.type === 'EMAIL') {
      if (!message.customer.email) throw new Error('Customer has no email address')
      
      const res = await sendEmail({
        to: message.customer.email,
        subject: 'Reply to your message',
        body: approvedText
      })
      providerEventId = res.providerId
    }

    // Create an outgoing message record
    await prisma.message.create({
      data: {
        customerId: message.customer.id,
        type: message.type,
        direction: 'OUTGOING',
        content: approvedText,
        whatsappId: providerEventId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[MESSAGES_APPROVE_POST]', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
