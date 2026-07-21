import { setupLemonSqueezy } from '@/lib/lemonsqueezy'
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js'
import { BillingProvider, CheckoutSessionParams, CheckoutSessionResult } from './types'

export class LemonSqueezyProvider implements BillingProvider {
  name = 'LEMON_SQUEEZY'

  async createCheckout(params: CheckoutSessionParams): Promise<CheckoutSessionResult> {
    setupLemonSqueezy()
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID
    if (!storeId) {
      throw new Error('LEMON_SQUEEZY_STORE_ID is not set')
    }

    const { error, data } = await createCheckout(storeId, params.variantId, {
      checkoutData: {
        email: params.email,
        name: params.name,
        custom: {
          company_id: params.companyId,
        },
      },
      productOptions: {
        redirectUrl: params.redirectUrl,
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data?.data?.attributes?.url) {
      throw new Error('No checkout URL returned from Lemon Squeezy')
    }

    return { url: data.data.attributes.url }
  }
}
