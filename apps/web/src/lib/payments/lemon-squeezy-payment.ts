import { setupLemonSqueezy } from '@/lib/lemonsqueezy'
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js'
import { CustomerPaymentProvider, CustomerCheckoutParams } from './types'

export class LemonSqueezyCustomerPayment implements CustomerPaymentProvider {
  name = 'LEMON_SQUEEZY'

  async createPaymentCheckout(params: CustomerCheckoutParams) {
    setupLemonSqueezy()
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID
    const variantId = process.env.LEMON_SQUEEZY_INVOICE_VARIANT_ID

    if (!storeId) throw new Error('LEMON_SQUEEZY_STORE_ID is not set')
    if (!variantId) throw new Error('LEMON_SQUEEZY_INVOICE_VARIANT_ID is not set')

    const { error, data } = await createCheckout(storeId, variantId, {
      customPrice: params.amount,
      checkoutData: {
        email: params.email,
        name: params.name,
        custom: {
          customer_id: params.customerId,
          company_id: params.companyId,
          type: 'invoice_payment'
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
