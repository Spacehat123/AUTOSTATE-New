import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@autostate/database'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { inngest } from '@/inngest/client'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

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

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const timestamp = Date.now()
    const fileName = file.name

    const filePath = `${user.companyId}/${timestamp}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    const { error: uploadError } = await getSupabase().storage
      .from('imports')
      .upload(filePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false
      })

    if (uploadError) {
      console.error('[IMPORT_UPLOAD_ERROR]', uploadError)
      return NextResponse.json({ error: 'Failed to upload file to storage' }, { status: 500 })
    }

    const job = await prisma.importJob.create({
      data: {
        companyId: user.companyId,
        fileName: file.name,
        status: 'PENDING'
      }
    })

    await inngest.send({
      name: 'import.file.uploaded',
      data: {
        jobId: job.id,
        filePath,
        companyId: user.companyId
      }
    })

    return NextResponse.json(job)
  } catch (error) {
    console.error('[IMPORT_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
