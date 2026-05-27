import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../../auth/dto/jwt-payload.interface';

/**
 * Extract the authenticated user from the request.
 * The JWT strategy attaches the validated payload to request.user.
 *
 * @example
 * @Get('me')
 * getProfile(@CurrentUser() user: JwtPayload) {
 *   return user;
 * }
 *
 * @example — extract single field
 * @Get('my-org')
 * getOrg(@CurrentUser('orgId') orgId: string) { ... }
 */
export const CurrentUser = createParamDecorator(
  (field: keyof JwtPayload | undefined, ctx: ExecutionContext): JwtPayload | JwtPayload[keyof JwtPayload] => {
    const request = ctx.switchToHttp().getRequest<Request & { user: JwtPayload }>();
    const user = request.user;
    return field ? user[field] : user;
  },
);
