import { parseWhatsappReply } from './parse-whatsapp-reply'
import { dailyTaskGeneration } from './daily-task-generation'
import { promiseFollowUpCheck } from './promise-follow-up'
import { processImport } from './process-import'
import { processWhatsappInbox, recoverStuckInboxEvents } from './inbox'

export const allFunctions = [
  parseWhatsappReply,
  dailyTaskGeneration,
  promiseFollowUpCheck,
  processImport,
  processWhatsappInbox,
  recoverStuckInboxEvents
]
