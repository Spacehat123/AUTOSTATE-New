import { prisma } from './index'

async function main() {
  console.log('Cleaning up old invite_ users...')
  const result = await prisma.user.deleteMany({
    where: {
      clerkId: {
        startsWith: 'invite_'
      }
    }
  })
  console.log(`Deleted ${result.count} fake invite users.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
