import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js'

export function setupLemonSqueezy() {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY
  if (!apiKey) {
    throw new Error('LEMON_SQUEEZY_API_KEY is not set')
  }
  lemonSqueezySetup({ apiKey })
}
