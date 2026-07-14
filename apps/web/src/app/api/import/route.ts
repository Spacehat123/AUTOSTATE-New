import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@autostate/database'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    const jobs = await prisma.importJob.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error('[IMPORT_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Create a pending job
    const job = await prisma.importJob.create({
      data: {
        companyId: user.companyId,
        fileName: file.name,
        status: 'PENDING'
      }
    })

    // NOTE: In Phase 16, we will trigger an Inngest background function here to process the file.

    return NextResponse.json(job)
  } catch (error) {
    console.error('[IMPORT_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
