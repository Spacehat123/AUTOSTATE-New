import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client'

const connectionString = process.env.DATABASE_URL
const url = new URL(connectionString!)
const pool = new Pool({ 
  connectionString,
  ssl: {
    // TODO: Verify if rejectUnauthorized: false is strictly necessary for Supabase in production. 
    // If Supabase certs validate locally, we can remove this or set it to true.
    rejectUnauthorized: false,
    servername: url.hostname // Provides the sni_hostname required by Supabase Session Pooler
  }
})
const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export * from './generated/prisma/client'
