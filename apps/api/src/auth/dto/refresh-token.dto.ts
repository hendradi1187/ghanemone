import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token obtained from /auth/login or previous /auth/refresh',
    example: 'a1b2c3d4-e5f6-...',
  })
  @IsString()
  @MinLength(10)
  refreshToken!: string;
}

export class LogoutDto {
  @ApiProperty({
    description: 'Session UUID to revoke',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  sessionId!: string;
}
