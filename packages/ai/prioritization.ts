// ─────────────────────────────────────────────────────────────────────────────
// Priority Scoring Engine
//
// Pure, deterministic scoring function — same inputs always produce the same
// output. No randomness, no side effects, no DB calls.
//
// Rules accumulate additively and are capped at 100.
// ─────────────────────────────────────────────────────────────────────────────

export interface ScoringInvoice {
  amount: number | { toNumber: () => number }
  outstandingAmount: number | { toNumber: () => number }
  status: string
  dueDate: Date
  paidDate: Date | null
  createdAt: Date
}

export interface ScoringPromise {
  status: string          // 'KEPT' | 'BROKEN' | 'PENDING'
  expectedDate: Date
}

export interface ScoringMessage {
  timestamp: Date
  direction: string       // 'INCOMING' | 'OUTGOING'
}

export interface CustomerWithInvoicesAndPromises {
  invoices: ScoringInvoice[]
  promises: ScoringPromise[]
  messages?: ScoringMessage[]
}

// Helper: normalise Prisma Decimal or plain number to a JS number
function toNumber(val: number | { toNumber: () => number }): number {
  return typeof val === 'number' ? val : val.toNumber()
}

/**
 * Calculate a deterministic priority score (0–100) for a customer.
 *
 * Higher score = needs attention more urgently.
 * The score is designed to be stored on the Customer record and used for
 * sorting the task list on the dashboard.
 */
export function calculatePriorityScore(
  customer: CustomerWithInvoicesAndPromises
): number {
  let score = 0
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const { invoices, promises, messages = [] } = customer

  // ── Rule 1: Days overdue on oldest overdue invoice (+1/day, max 40) ─────
  const overdueInvoices = invoices.filter(inv => inv.status === 'OVERDUE' || inv.status === 'PARTIAL')
  if (overdueInvoices.length > 0) {
    const oldestDue = overdueInvoices.reduce(
      (oldest, inv) => inv.dueDate < oldest ? inv.dueDate : oldest,
      overdueInvoices[0]!.dueDate
    )
    const msPerDay = 1000 * 60 * 60 * 24
    const daysOverdue = Math.max(0, Math.floor((now.getTime() - new Date(oldestDue).getTime()) / msPerDay))
    score += Math.min(40, daysOverdue)
  }

  // ── Rule 2: Total outstanding amount ────────────────────────────────────
  const totalOutstanding = invoices.reduce(
    (sum, inv) => sum + toNumber(inv.outstandingAmount),
    0
  )

  if (totalOutstanding > 1_000_000) {         // > ₹10L
    score += 30
  } else if (totalOutstanding > 500_000) {    // > ₹5L
    score += 20
  } else if (totalOutstanding > 100_000) {    // > ₹1L
    score += 10
  }

  // ── Rule 3: Broken promises (+10 each, max 30) ──────────────────────────
  const brokenPromises = promises.filter(p => p.status === 'BROKEN')
  score += Math.min(30, brokenPromises.length * 10)

  // ── Rule 4: Good payer discount (all invoices historically paid < 45 days) ─
  const paidInvoices = invoices.filter(inv => inv.status === 'PAID' && inv.paidDate)
  const hasLatePayments = paidInvoices.some(inv => {
    const msPerDay = 1000 * 60 * 60 * 24
    const daysToPay = Math.floor(
      (new Date(inv.paidDate!).getTime() - new Date(inv.createdAt).getTime()) / msPerDay
    )
    return daysToPay > 45
  })

  const hasOnlyPaidInvoices = invoices.length > 0 && invoices.every(inv => inv.status === 'PAID')

  if (hasOnlyPaidInvoices && !hasLatePayments && paidInvoices.length > 0) {
    score -= 10
  }

  // ── Rule 5: No contact in last 7 days (+5) ──────────────────────────────
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const hasRecentContact = messages.some(
    msg => new Date(msg.timestamp) >= sevenDaysAgo
  )

  if (!hasRecentContact && overdueInvoices.length > 0) {
    // Only penalise if they actually have overdue invoices — no point penalising
    // customers who are perfectly up to date
    score += 5
  }

  // ── Floor & ceiling ──────────────────────────────────────────────────────
  return Math.min(100, Math.max(0, score))
}
