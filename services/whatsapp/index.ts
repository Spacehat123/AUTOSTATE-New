import axios, { AxiosError } from 'axios'

const GRAPH_API_BASE = 'https://graph.facebook.com/v18.0'

/**
 * Reads and validates required WhatsApp env vars at call time
 * (not at module load time, so the package can be imported safely during builds).
 */
function getConfig() {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!accessToken) {
    throw new Error('Missing env var: WHATSAPP_ACCESS_TOKEN')
  }
  if (!phoneNumberId) {
    throw new Error('Missing env var: WHATSAPP_PHONE_NUMBER_ID')
  }

  return { accessToken, phoneNumberId }
}

/**
 * Normalize a phone number to the format required by the WhatsApp Cloud API.
 * Strips leading + and spaces; ensures no country code issues.
 */
function normalizePhone(to: string): string {
  return to.replace(/^\+/, '').replace(/\s+/g, '')
}

/**
 * Extracts a clean error message from a failed Meta API call.
 */
function extractMetaError(error: unknown): string {
  if (error instanceof AxiosError && error.response?.data) {
    const meta = error.response.data?.error
    if (meta?.message) {
      return `Meta API Error (code ${meta.code}): ${meta.message}`
    }
    return JSON.stringify(error.response.data)
  }
  if (error instanceof Error) return error.message
  return 'Unknown WhatsApp API error'
}

/**
 * Sends a plain text WhatsApp message to a recipient.
 *
 * @param to - Recipient phone number in E.164 format (e.g. "+919876543210")
 * @param message - The message body text
 * @returns An object containing the WhatsApp message ID
 */
export async function sendTextMessage(
  to: string,
  message: string
): Promise<{ whatsappId: string }> {
  const { accessToken, phoneNumberId } = getConfig()

  try {
    const response = await axios.post(
      `${GRAPH_API_BASE}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalizePhone(to),
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const whatsappId = response.data?.messages?.[0]?.id
    if (!whatsappId) {
      throw new Error('WhatsApp API returned success but no message ID was found in the response')
    }

    return { whatsappId }
  } catch (error) {
    throw new Error(`sendTextMessage failed: ${extractMetaError(error)}`)
  }
}

/**
 * Sends a pre-approved WhatsApp template message to a recipient.
 * Templates must be created and approved in the Meta Business Manager first.
 *
 * @param to - Recipient phone number in E.164 format
 * @param templateName - The name of the approved template (e.g. "payment_reminder")
 * @param components - Array of template component objects (header, body, buttons)
 * @returns An object containing the WhatsApp message ID
 */
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  components: object[] = []
): Promise<{ whatsappId: string }> {
  const { accessToken, phoneNumberId } = getConfig()

  try {
    const response = await axios.post(
      `${GRAPH_API_BASE}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalizePhone(to),
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'en_US'
          },
          components
        }
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const whatsappId = response.data?.messages?.[0]?.id
    if (!whatsappId) {
      throw new Error('WhatsApp API returned success but no message ID was found in the response')
    }

    return { whatsappId }
  } catch (error) {
    throw new Error(`sendTemplateMessage failed: ${extractMetaError(error)}`)
  }
}
