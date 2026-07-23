import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@autostate/database'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const realmId = searchParams.get('realmId')

    if (!code || !realmId) {
      return NextResponse.redirect(new URL('/dashboard?error=missing_params', req.url))
    }

    // Mock token exchange since we don't have a real QBO app yet
    const mockAccessToken = `mock_access_token_${code}`
    const mockRefreshToken = `mock_refresh_token_${code}`
    const tokenExpiresAt = new Date(Date.now() + 3600 * 1000) // 1 hour from now
    const refreshTokenExpiresAt = new Date(Date.now() + 100 * 24 * 3600 * 1000) // 100 days

    await prisma.accountingIntegration.upsert({
      where: {
        companyId_provider: {
          companyId: user.companyId,
          provider: 'QUICKBOOKS',
        },
      },
      update: {
        realmId,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        tokenExpiresAt,
        refreshTokenExpiresAt,
        syncStatus: 'SUCCESS',
        updatedAt: new Date(),
      },
      create: {
        companyId: user.companyId,
        provider: 'QUICKBOOKS',
        realmId,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        tokenExpiresAt,
        refreshTokenExpiresAt,
        syncStatus: 'SUCCESS',
      },
    })

    return NextResponse.redirect(new URL('/dashboard?success=true', req.url))
  } catch (error) {
    console.error('QBO OAuth callback error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=internal_error', req.url))
  }
}
