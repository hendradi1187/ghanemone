import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

/** Metadata key for required roles on a route. */
export const ROLES_KEY = 'roles';

/**
 * Restrict a route to specific RBAC roles.
 * RolesGuard reads this metadata and compares against request.user.role.
 *
 * @example
 * @Roles(UserRole.ADMIN, UserRole.REGULATOR)
 * @Get('users')
 * listUsers() { ... }
 */
export const Roles = (...roles: UserRole[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
