export interface CheckoutSessionParams {
  email: string
  name?: string
  companyId: string
  variantId: string
  redirectUrl: string
}

export interface CheckoutSessionResult {
  url: string
}

export interface BillingProvider {
  name: string
  createCheckout(params: CheckoutSessionParams): Promise<CheckoutSessionResult>
}
