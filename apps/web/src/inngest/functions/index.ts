import { parseWhatsappReply } from './parse-whatsapp-reply'
import { dailyTaskGeneration } from './daily-task-generation'
import { promiseFollowUpCheck } from './promise-follow-up'
import { processImport } from './process-import'

export const allFunctions = [
  parseWhatsappReply,
  dailyTaskGeneration,
  promiseFollowUpCheck,
  processImport
]
