import { UserRole } from '@autostate/database'

const ROLE_HIERARCHY: Record<UserRole, number> = {
  MEMBER: 10,
  ADMIN: 20,
  OWNER: 30
}

export class InsufficientRoleError extends Error {
  constructor() {
    super('Insufficient role')
    this.name = 'InsufficientRoleError'
  }
}

/**
 * Ensures the user has at least the specified minimum role.
 * Throws an InsufficientRoleError if they do not.
 */
export function requireRole(user: { role: UserRole }, minRole: UserRole) {
  const userLevel = ROLE_HIERARCHY[user.role] || 0
  const requiredLevel = ROLE_HIERARCHY[minRole]
  
  if (userLevel < requiredLevel) {
    throw new InsufficientRoleError()
  }
}

/**
 * Returns a Next.js 403 Response for role failures.
 */
export function roleErrorResponse() {
  return Response.json({ error: 'insufficient_role' }, { status: 403 })
}

/**
 * Checks if a user is authorized by the company owner.
 * Owners are always authorized. Admins must be explicitly authorized.
 */
export function isAuthorizedUser(user: { role: UserRole; isAuthorizedByOwner?: boolean }) {
  if (user.role === 'OWNER') return true
  if (user.role === 'ADMIN' && user.isAuthorizedByOwner === true) return true
  return false
}

/**
 * Ensures the user is authorized by the company owner.
 * Throws an InsufficientRoleError if they do not.
 */
export function requireAuthorizedUser(user: { role: UserRole; isAuthorizedByOwner?: boolean }) {
  if (!isAuthorizedUser(user)) {
    throw new InsufficientRoleError()
  }
}
