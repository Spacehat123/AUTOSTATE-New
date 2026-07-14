import { parseWhatsappReply } from './parse-whatsapp-reply'
import { dailyTaskGeneration } from './daily-task-generation'
import { promiseFollowUpCheck } from './promise-follow-up'

export const allFunctions = [
  parseWhatsappReply,
  dailyTaskGeneration,
  promiseFollowUpCheck
]
