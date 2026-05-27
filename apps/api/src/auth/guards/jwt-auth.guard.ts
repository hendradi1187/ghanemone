import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

/**
 * Global JWT auth guard — applied to every route via APP_GUARD in AppModule.
 * Routes decorated with @Public() are skipped.
 *
 * Pattern: opt-out public routes rather than opt-in protected routes.
 * This means ALL routes are protected by default.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext): boolean | Promise<boolean> | import('rxjs').Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  override handleRequest<T>(err: unknown, user: T, info: unknown): T {
    if (err ?? !user) {
      const message =
        info instanceof Error
          ? info.message === 'No auth token'
            ? 'Authentication required — provide Bearer token'
            : info.message
          : 'Authentication required';
      throw new UnauthorizedException(message);
    }
    return user;
  }
}
