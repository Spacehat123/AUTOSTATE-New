import { PrismaClient } from './packages/database/generated/prisma/client'

const prisma = new PrismaClient()

const tenantDb = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (model === 'Customer') {
          args.where = { ...args.where, companyId: 'test-company' };
        }
        return query(args);
      }
    }
  }
})

async function main() {
  try {
    await tenantDb.customer.findUnique({
      where: { id: 'clqz51h8n000008l412345678' }
    });
    console.log("findUnique works with extra where fields!");
  } catch (e: any) {
    console.error("Error with findUnique:", e.message);
  }
}

main().finally(() => prisma.$disconnect())
