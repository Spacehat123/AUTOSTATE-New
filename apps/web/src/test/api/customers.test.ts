import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET as getCustomers } from '@/app/api/customers/route'
import { GET as getCustomerById } from '@/app/api/customers/[id]/route'
import { POST as createNote } from '@/app/api/customers/[id]/notes/route'
import { prisma } from '@autostate/database'

// Mock the auth
vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn()
}))

import { getCurrentUser } from '@/lib/auth'

describe('Customers API', () => {
  let companyId: string

  beforeEach(async () => {
    vi.resetAllMocks()
    
    // Check if test company exists, else create one
    let company = await prisma.company.findFirst({ where: { name: 'Test Company API' } })
    if (!company) {
      company = await prisma.company.create({
        data: { name: 'Test Company API' }
      })
    }
    companyId = company.id

    vi.mocked(getCurrentUser).mockResolvedValue({
      id: 'user_123',
      companyId: companyId,
      role: 'ADMIN'
    } as any)
  })

  it('GET /api/customers returns 200 with array and total', async () => {
    const req = new NextRequest('http://localhost/api/customers?page=1&limit=10')
    const res = await getCustomers(req)
    
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.data)).toBe(true)
    expect(typeof json.total).toBe('number')
  })

  it('GET /api/customers/:id returns 404 for a random UUID', async () => {
    const req = new NextRequest('http://localhost/api/customers/non-existent-id')
    const res = await getCustomerById(req, { params: Promise.resolve({ id: 'non-existent-id' }) })
    
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error).toBe('Customer not found')
  })

  it('POST /api/customers/:id/notes with empty content returns 400', async () => {
    const req = new NextRequest('http://localhost/api/customers/some-id/notes', {
      method: 'POST',
      body: JSON.stringify({ content: '' })
    })
    
    const res = await createNote(req, { params: Promise.resolve({ id: 'some-id' }) })
    
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Invalid input')
  })

  it('POST /api/customers/:id/notes with valid content creates a Message record', async () => {
    // Create a real customer first
    const customer = await prisma.customer.create({
      data: {
        name: 'API Test Customer',
        companyId: companyId
      }
    })

    const req = new NextRequest(`http://localhost/api/customers/${customer.id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content: 'This is a test note.' })
    })
    
    const res = await createNote(req, { params: Promise.resolve({ id: customer.id }) })
    
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.content).toBe('This is a test note.')
    expect(json.type).toBe('NOTE')

    // Cleanup
    await prisma.message.delete({ where: { id: json.id } })
    await prisma.customer.delete({ where: { id: customer.id } })
  })
})
