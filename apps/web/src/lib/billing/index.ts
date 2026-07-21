import { BillingProvider } from './types'
import { LemonSqueezyProvider } from './lemon-squeezy-provider'

// In the future, this can dynamically return StripeProvider based on environment or tenant config
export function getBillingProvider(): BillingProvider {
  return new LemonSqueezyProvider()
}
