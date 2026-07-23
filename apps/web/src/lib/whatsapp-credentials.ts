import { prisma } from '@autostate/database'
import { decrypt } from '@autostate/shared'

export interface WhatsappCredentials {
  accessToken: string
  phoneNumberId: string
}

/**
 * Helper to securely fetch WhatsApp credentials for a given company.
 * Implements a phased migration:
 * 1. Try to load from CompanyIntegration (database, encrypted at rest)
 * 2. Fallback to global environment variables (for backwards compatibility)
 */
export async function getWhatsappCredentials(companyId: string): Promise<WhatsappCredentials> {
  // 1. Try to fetch tenant-specific configuration
  const integration = await prisma.companyIntegration.findUnique({
    where: { companyId_type: { companyId, type: 'WHATSAPP' } }
  })

  if (integration && integration.config) {
    const config = integration.config as any
    if (config.accessToken && config.phoneNumberId) {
      try {
        return {
          accessToken: decrypt(config.accessToken),
          phoneNumberId: config.phoneNumberId
        }
      } catch (e) {
        console.error(`Failed to decrypt WhatsApp credentials for company ${companyId}`, e)
        // If decryption fails, we'll try the fallback to avoid total failure, 
        // though typically it might be better to throw. Falling back for safety during migration.
      }
    }
  }

  // 2. Fallback to global environment variables
  const globalAccessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const globalPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!globalAccessToken || !globalPhoneNumberId) {
    throw new Error(`No WhatsApp credentials found for company ${companyId}, and no global fallback is configured.`)
  }

  return {
    accessToken: globalAccessToken,
    phoneNumberId: globalPhoneNumberId
  }
}
