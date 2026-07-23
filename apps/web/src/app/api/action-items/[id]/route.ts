import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@autostate/database'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'SNOOZED']).optional(),
  title: z.string().min(1).max(255).optional(),
  notes: z.string().optional(),
  priority: z.number().int().min(0).max(100).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  deletedAt: z.string().datetime().nullable().optional() // For undoing delete
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()

  try {
    const { id } = await params
    const body = await request.json()
    
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() }, 
        { status: 400 }
      )
    }
    
    // Verify ownership
    const existing = await prisma.actionItem.findUnique({
      where: { id }
    })
    
    if (!existing || existing.userId !== user.id || existing.companyId !== user.companyId) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
    }

    const { status, title, notes, priority, dueDate, deletedAt } = parsed.data
    
    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (title !== undefined) updateData.title = title
    if (notes !== undefined) updateData.notes = notes
    if (priority !== undefined) updateData.priority = priority
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (deletedAt !== undefined) updateData.deletedAt = deletedAt ? new Date(deletedAt) : null

    const actionItem = await prisma.actionItem.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json(actionItem)
  } catch (error) {
    console.error('[ACTION_ITEMS_PATCH]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()

  try {
    const { id } = await params
    
    // Verify ownership
    const existing = await prisma.actionItem.findUnique({
      where: { id }
    })
    
    if (!existing || existing.userId !== user.id || existing.companyId !== user.companyId) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
    }

    // Soft delete
    const actionItem = await prisma.actionItem.update({
      where: { id },
      data: { deletedAt: new Date() }
    })
    
    return NextResponse.json(actionItem)
  } catch (error) {
    console.error('[ACTION_ITEMS_DELETE]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
