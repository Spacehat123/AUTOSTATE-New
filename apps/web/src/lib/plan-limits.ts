export const PLAN_LIMITS = {
  FREE: {
    maxCustomers: 5,
    maxUsers: 1,
  },
  STARTER: {
    maxCustomers: 100,
    maxUsers: 5,
  },
  GROWTH: {
    maxCustomers: 1000,
    maxUsers: 20,
  },
} as const

export type PlanType = keyof typeof PLAN_LIMITS
