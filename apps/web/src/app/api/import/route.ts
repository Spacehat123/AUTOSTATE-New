import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@autostate/database'
import { getCurrentUser } from '@/lib/auth'
import { requireAuthorizedUser, InsufficientRoleError, roleErrorResponse } from '@/lib/rbac'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { inngest } from '@/lib/inngest'

export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function GET() {
  const user = await getCurrentUser()

  try {
    requireAuthorizedUser(user)
  } catch (error) {
    if (error instanceof InsufficientRoleError) return roleErrorResponse()
    throw error
  }

  try {
    const jobs = await user.db.importJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    return NextResponse.json(jobs)
  } catch (error) {
    console.error('[IMPORT_GET]', error)
    return NextResponse.json({ error: 'Unable to load import history' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    requireAuthorizedUser(user)
  } catch (error) {
    if (error instanceof InsufficientRoleError) return roleErrorResponse()
    throw error
  }

  const contentType = request.headers.get('content-type') || ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) return NextResponse.json({ error: 'Choose a CSV or XLSX file first' }, { status: 400 })
    if (!/\.(csv|xlsx)$/i.test(file.name)) return NextResponse.json({ error: 'Only .csv and .xlsx files are supported' }, { status: 400 })
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'Files must be 10 MB or smaller' }, { status: 413 })

    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.companyId}/${Date.now()}.${fileExt}`
    
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex')

    const existingJob = await prisma.importJob.findFirst({
      where: {
        companyId: user.companyId,
        fileHash,
        status: 'DONE',
      },
    })

    if (existingJob) {
      return NextResponse.json({ error: 'File has already been imported' }, { status: 409 })
    }

    const { error: uploadError } = await supabase.storage.from('imports').upload(filePath, buffer, {
        contentType: file.type
    })
    
    if (uploadError) {
        console.error('Supabase upload error:', uploadError)
        return NextResponse.json({ error: 'Failed to upload file to storage' }, { status: 500 })
    }

    const type = formData.get('type') as string

    let job = await prisma.importJob.create({
      data: {
        companyId: user.companyId,
        fileName: file.name,
        type: type as any,
        fileHash,
        status: 'PROCESSING',
        totalRows: null,
      },
    })

    await inngest.send({
      name: 'import.file.uploaded',
      data: {
        jobId: job.id,
        filePath,
        companyId: user.companyId,
        type: type as any,
      },
    })

    return NextResponse.json({ job })
  }

  return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })
}
