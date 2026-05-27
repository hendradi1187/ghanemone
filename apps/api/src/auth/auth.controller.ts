import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto, RefreshTokenDto } from './dto/refresh-token.dto';
import type { JwtPayload } from './dto/jwt-payload.interface';
import { AUTH_THROTTLE } from '../common/throttler/throttler.config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/v1/auth/login
   * Authenticate with email + password. Returns JWT access + refresh tokens.
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({
    summary: 'Login with email + password',
    description: 'Validates credentials against the User table. Returns access + refresh tokens.',
  })
  @ApiResponse({ status: 200, description: 'Login successful — tokens returned' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or suspended account' })
  @ApiResponse({ status: 429, description: 'Too many login attempts — rate limited' })
  async login(@Body() dto: LoginDto) {
    return this.authService.validateCredentials(dto);
  }

  /**
   * POST /api/v1/auth/refresh
   * Exchange a valid refresh token for a new access token.
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Exchange a non-expired, non-revoked refresh token for a new access token.',
  })
  @ApiResponse({ status: 200, description: 'New access token issued' })
  @ApiResponse({ status: 401, description: 'Refresh token invalid, expired, or revoked' })
  @ApiResponse({ status: 429, description: 'Too many refresh attempts — rate limited' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  /**
   * POST /api/v1/auth/logout
   * Revoke the specified session (marks refresh token as revoked).
   */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout — revoke session',
    description: 'Marks the session refresh token as revoked. Client should discard access token.',
  })
  @ApiResponse({ status: 204, description: 'Session revoked successfully' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async logout(@Body() dto: LogoutDto, @CurrentUser() user: JwtPayload): Promise<void> {
    await this.authService.logout(dto.sessionId, user.sub);
  }

  /**
   * GET /api/v1/auth/me
   * Return the current authenticated user profile.
   */
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the profile of the currently authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'User profile returned' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async me(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.sub);
  }
}
