export interface CustomerCheckoutParams {
  customerId: string
  companyId: string
  amount: number // in cents / paise
  email?: string
  name?: string
  redirectUrl: string
}

export interface CustomerPaymentProvider {
  name: string
  createPaymentCheckout(params: CustomerCheckoutParams): Promise<{ url: string }>
}
