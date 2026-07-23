import { parseWhatsappReply } from './parse-whatsapp-reply'
import { dailyTaskGeneration } from './daily-task-generation'
import { promiseFollowUpCheck } from './promise-follow-up'
import { processImport } from './process-import'
import { processWhatsappInbox, processEmailInbox, recoverStuckInboxEvents } from './inbox'
import { analyzeMessage } from './ai'
import { evaluateDunningWorkflows } from './workflows'

export const allFunctions = [
  parseWhatsappReply,
  analyzeMessage,
  dailyTaskGeneration,
  promiseFollowUpCheck,
  processImport,
  processWhatsappInbox,
  processEmailInbox,
  recoverStuckInboxEvents,
  evaluateDunningWorkflows
]
