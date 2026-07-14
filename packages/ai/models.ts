import { gateway } from '@ai-sdk/gateway'

/**
 * Model choice lives entirely in env vars — never hardcoded here.
 *
 * To swap providers, change these values in .env.local and restart the server:
 *   AI_FAST_MODEL=anthropic/claude-haiku-4-5       (cheap, low-latency — task generation, reply parsing)
 *   AI_SUMMARY_MODEL=anthropic/claude-sonnet-5     (high-quality — customer summaries, message drafting)
 *
 * Other valid values (no code changes needed):
 *   openai/gpt-4o-mini, openai/gpt-5-mini
 *   google/gemini-2.5-flash, google/gemini-3.5-flash
 *   anthropic/claude-opus-4, anthropic/claude-sonnet-5
 */
export const fastModel = gateway(
  process.env.AI_FAST_MODEL ?? 'anthropic/claude-haiku-4-5'
)

export const summaryModel = gateway(
  process.env.AI_SUMMARY_MODEL ?? 'anthropic/claude-sonnet-5'
)
