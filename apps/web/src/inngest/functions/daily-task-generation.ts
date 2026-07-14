import { inngest } from '../client'
import { prisma } from '@autostate/database'
import { generateTasksForCompany } from '@autostate/ai'

export const dailyTaskGeneration = (inngest.createFunction as any)(
  { id: 'daily-task-generation', name: 'Daily Task Generation' },
  { cron: '30 1 * * *' }, // 1:30 AM UTC = 7:00 AM IST
  async ({ step }) => {
    // 1. Fetch all companies
    const companies = await step.run('fetch-companies', async () => {
      return prisma.company.findMany({ select: { id: true } })
    })

    const results: Record<string, any> = {}

    // 2. Generate tasks for each company
    // Using step.run in a loop allows Inngest to parallelize/retry per company
    for (const company of companies) {
      const result = await step.run(`generate-tasks-${company.id}`, async () => {
        try {
          const stats = await generateTasksForCompany(company.id)
          return { success: true, stats }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      })
      
      results[company.id] = result
    }

    return { 
      message: `Generated tasks for ${companies.length} companies`,
      results 
    }
  }
)
