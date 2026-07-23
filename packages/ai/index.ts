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

// AI Message Parsers & Generators
export { parseReply } from './reply-parser'
export type { ParsedReply } from './reply-parser'

export { extractPromise, PromiseExtractionSchema } from './extract-promise'
export type { PromiseExtractionResult, ExtractPromiseOptions } from './extract-promise'

export { generateCollectionMessage, generateDraftReply } from './message-generator'
export type { MessageGenerationParams } from './message-generator'

export { generateRelationshipSummary } from './relationship-summary'
export type { RelationshipSummaryParams } from './relationship-summary'
