import { LemonSqueezyCustomerPayment } from './lemon-squeezy-payment'
import { CustomerPaymentProvider } from './types'

export function getCustomerPaymentProvider(): CustomerPaymentProvider {
  return new LemonSqueezyCustomerPayment()
}

export * from './types'
