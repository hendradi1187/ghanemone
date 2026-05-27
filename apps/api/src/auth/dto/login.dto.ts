import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@ghanemtech.co.id',
  })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

  @ApiProperty({
    description: 'User password (min 8 characters)',
    example: 'Demo123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  password!: string;
}
