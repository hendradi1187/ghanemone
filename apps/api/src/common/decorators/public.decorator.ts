import { SetMetadata } from '@nestjs/common';

/** Metadata key for marking routes as public (skip JwtAuthGuard). */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark an endpoint as publicly accessible — JwtAuthGuard will skip it.
 * Use on endpoints like /auth/login, /health, public dataset endpoints.
 *
 * @example
 * @Public()
 * @Post('login')
 * login(@Body() dto: LoginDto) { ... }
 */
export const Public = (): MethodDecorator & ClassDecorator =>
  SetMetadata(IS_PUBLIC_KEY, true);
