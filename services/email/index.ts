import { Resend } from 'resend'

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('Missing env var: RESEND_API_KEY')
  }
  return new Resend(apiKey)
}

export interface SendEmailOptions {
  to: string
  subject: string
  body: string
  html?: string
  from?: string
}

export async function sendEmail({
  to,
  subject,
  body,
  html,
  from
}: SendEmailOptions): Promise<{ providerId: string }> {
  const resend = getResendClient()
  const fromEmail = from || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  try {
    const response = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      text: body,
      html: html || `<p>${body.replace(/\n/g, '<br/>')}</p>`
    })

    if (response.error) {
      throw new Error(`Resend Error: ${response.error.message}`)
    }

    const providerId = response.data?.id
    if (!providerId) {
      throw new Error('Resend API returned success but no message ID was found in response')
    }

    return { providerId }
  } catch (error: any) {
    throw new Error(`sendEmail failed: ${error.message || error}`)
  }
}
