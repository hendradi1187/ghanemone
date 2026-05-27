import { UserRole } from '@prisma/client';

/**
 * Shape of the JWT payload (encoded in access tokens).
 * Matches what the frontend's auth-store expects for `user.sub`, `user.role`, etc.
 *
 * This is also what `request.user` contains after JwtStrategy.validate().
 */
export interface JwtPayload {
  /** User UUID — maps to User.id in the database. */
  sub: string;
  /** User email address. */
  email: string;
  /** User display name. */
  name: string;
  /** RBAC role. */
  role: UserRole;
  /** Organization UUID — maps to Organization.id. */
  orgId: string;
  /** Organization display name. */
  orgName: string;
  /** Organization slug. */
  orgSlug: string;
  /** Issued-at (unix timestamp, added by jsonwebtoken). */
  iat?: number;
  /** Expiry (unix timestamp, added by jsonwebtoken). */
  exp?: number;
}
