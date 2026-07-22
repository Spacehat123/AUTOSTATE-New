import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@autostate/database'
import { getCustomerPaymentProvider } from '@/lib/payments'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  const portalToken = await prisma.portalAccessToken.findUnique({
    where: { tokenHash },
    include: {
      customer: {
        include: {
          invoices: {
            where: {
              status: { in: ['PENDING', 'OVERDUE', 'PARTIAL'] }
            }
          }
        }
      }
    }
  })

  if (!portalToken || new Date() > portalToken.expiresAt) {
    return NextResponse.redirect(new URL(`/portal/${token}?error=expired`, req.url))
  }

  const { customer } = portalToken
  
  // Recompute total outstanding from DB
  const totalOutstanding = customer.invoices.reduce((acc, inv) => acc + Number(inv.outstandingAmount), 0)

  if (totalOutstanding <= 0) {
    return NextResponse.redirect(new URL(`/portal/${token}?error=no_balance`, req.url))
  }

  try {
    const paymentProvider = getCustomerPaymentProvider()
    
    // Convert to cents/paise for checkout
    const amountInCents = Math.round(totalOutstanding * 100)

    const checkout = await paymentProvider.createPaymentCheckout({
      customerId: customer.id,
      companyId: customer.companyId,
      amount: amountInCents,
      email: customer.email || undefined,
      name: customer.name,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/portal/${token}?success=true`
    })

    return NextResponse.redirect(checkout.url, 303)
  } catch (error) {
    console.error('Failed to create payment checkout:', error)
    return NextResponse.redirect(new URL(`/portal/${token}?error=payment_failed`, req.url))
  }
}
