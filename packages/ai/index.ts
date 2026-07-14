/**
 * @autostate/ai — Model-agnostic AI service package
 *
 * Re-exports everything from all AI modules.
 * Import individual functions by name — don't import the whole package unless needed.
 */

// Model handles — swap providers via env vars, not code
export { fastModel, summaryModel } from './models'

// Priority scoring engine — pure, deterministic, no AI calls needed
export { calculatePriorityScore } from './prioritization'
export type { CustomerWithInvoicesAndPromises } from './prioritization'

// Task generation engine
export { generateTasksForCompany } from './task-generator'

// AI Message Parsers
export { parseReply } from './reply-parser'
export type { ParsedReply } from './reply-parser'
