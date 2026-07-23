import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@autostate/database'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const portalToken = await prisma.portalAccessToken.findUnique({
      where: { tokenHash },
      include: {
        customer: {
          include: {
            company: true
          }
        }
      }
    });

    if (!portalToken || new Date() > portalToken.expiresAt) {
      return NextResponse.json({ error: 'Token expired or invalid' }, { status: 401 });
    }

    const body = await req.json();
    const { invoiceId, reason, description } = body;

    if (!invoiceId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the invoice belongs to the customer
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        customerId: portalToken.customerId
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const { customer } = portalToken;

    // Create the dispute and update the invoice in a transaction
    const [dispute, updatedInvoice] = await prisma.$transaction([
      prisma.dispute.create({
        data: {
          invoiceId: invoice.id,
          customerId: customer.id,
          companyId: customer.companyId,
          reason,
          description
        }
      }),
      prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'DISPUTED' }
      })
    ]);

    return NextResponse.json({ success: true, dispute, invoice: updatedInvoice });
  } catch (error) {
    console.error('Failed to create dispute:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
