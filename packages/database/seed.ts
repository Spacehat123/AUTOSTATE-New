    import { prisma } from './index'

    async function main() {
      console.log('Clearing existing data...')
      await prisma.task.deleteMany()
      await prisma.promise.deleteMany()
      await prisma.message.deleteMany()
      await prisma.invoice.deleteMany()
      await prisma.customer.deleteMany()
      await prisma.user.deleteMany()
      await prisma.importJob.deleteMany()
      await prisma.company.deleteMany()

      console.log('Seeding new data...')

      // 1. One Company
      const company = await prisma.company.create({
        data: {
          name: 'Acme Corp',
          email: 'billing@acmecorp.com',
        }
      })

      // 2. One User (Owner)
      const user = await prisma.user.create({
        data: {
          clerkId: 'user_2m1234567890abcdef',
          email: 'owner@acmecorp.com',
          name: 'Alice Owner',
          role: 'OWNER',
          companyId: company.id
        }
      })

      // 3. 5 Customers
      const customers = []
      for (let i = 1; i <= 5; i++) {
        customers.push(
          await prisma.customer.create({
            data: {
              name: `Customer ${i} LLC`,
              email: `contact@customer${i}.com`,
              riskScore: i * 15,
              companyId: company.id
            }
          })
        )
      }

      // 4. 10 Invoices
      for (let i = 1; i <= 10; i++) {
        const cust = customers[i % 5]
        await prisma.invoice.create({
          data: {
            invoiceNumber: `INV-${1000 + i}`,
            amount: 500 + i * 100,
            outstandingAmount: i % 3 === 0 ? 0 : 500 + i * 100,
            issueDate: new Date(new Date().setDate(new Date().getDate() -
  30 - i * 5)),
            dueDate: new Date(new Date().setDate(new Date().getDate() - i
  * 5)),
            status: i % 3 === 0 ? 'PAID' : (i % 2 === 0 ? 'OVERDUE' :
  'PENDING'),
            customerId: cust.id,
          }
        })
      }

      // 5. 2 Messages
      const msg1 = await prisma.message.create({
        data: {
          content: 'I will pay this on Friday next week.',
          type: 'WHATSAPP',
          direction: 'INCOMING',
          customerId: customers[0].id,
        }
      })

      await prisma.message.create({
        data: {
          content: 'Please find the attached invoice reminder.',
          type: 'EMAIL',
          direction: 'OUTGOING',
          customerId: customers[1].id,
        }
      })

      // 6. 1 Promise
      await prisma.promise.create({
        data: {
          expectedDate: new Date(new Date().setDate(new Date().getDate() +
  7)),
          amount: 600,
          status: 'PENDING',
          messageId: msg1.id,
          customerId: customers[0].id
        }
      })

      // 7. 3 Tasks
      const taskTypes = ['CALL', 'SEND_REMINDER', 'ESCALATE'] as const
      for (let i = 0; i < 3; i++) {
        await prisma.task.create({
          data: {
            taskType: taskTypes[i],
            priority: (i + 1) * 20,
            reason: `Follow up required for Customer ${i + 1}`,
            assignedTo: user.id,
            customerId: customers[i].id
          }
        })
      }

      console.log('Seeding completed successfully! 🌱')
    }

    main()
      .catch((e) => {
        console.error(e)
        process.exit(1)
      })
      .finally(async () => {
        await prisma.$disconnect()
      })