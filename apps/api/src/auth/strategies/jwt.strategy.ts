import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfigService } from '../../config/config.service';
import type { JwtPayload } from '../dto/jwt-payload.interface';

/**
 * JWT strategy — validates the Bearer token on protected routes.
 * Extracts JWT from `Authorization: Bearer <token>` header.
 * The validated payload is attached to `request.user`.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: AppConfigService) {
    const jwtConfig = config.getJwtConfig();
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  /**
   * Called after JWT signature is verified and decoded.
   * Return value becomes `request.user`.
   * Throw UnauthorizedException here to reject access.
   */
  validate(payload: JwtPayload): JwtPayload {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return payload;
  }
}
