import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://dummy.upstash.io',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'dummy',
})

// Create different rate limiters based on endpoint
export const ratelimit = {
  // Free tier / General webhook: 10 requests per 10 seconds
  webhook: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: true,
    prefix: '@autostate/ratelimit:webhook'
  }),

  // API limits: 100 requests per 10 seconds per IP or User ID
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '10 s'),
    analytics: true,
    prefix: '@autostate/ratelimit:api'
  }),
}
