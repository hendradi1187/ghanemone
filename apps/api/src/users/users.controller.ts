import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/dto/jwt-payload.interface';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  ResetPasswordDto,
  UpdateUserDto,
  UserResponseDto,
} from './dto/create-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /api/v1/users
   * List all users. Admin + Regulator see all; KKKS_OPERATOR sees own org.
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.REGULATOR, UserRole.KKKS_OPERATOR)
  @ApiOperation({ summary: 'List users', description: 'Admin/Regulator: all users. KKKS_OPERATOR: own org only.' })
  @ApiResponse({ status: 200, description: 'List of users', type: [UserResponseDto] })
  findAll(@CurrentUser() user: JwtPayload): Promise<UserResponseDto[]> {
    return this.usersService.findAll(user);
  }

  /**
   * GET /api/v1/users/:id
   * Get user by UUID. Admins/Regulators can view any; users can view themselves.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserResponseDto> {
    return this.usersService.findOne(id, user);
  }

  /**
   * POST /api/v1/users
   * Create a new user. Admin only.
   */
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create user (Admin only)' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }

  /**
   * PATCH /api/v1/users/:id
   * Update user. Admin can update any; users can update their own name only.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update user (Admin: any field; self: name only)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, dto, user);
  }

  /**
   * DELETE /api/v1/users/:id
   * Soft-delete by setting status=SUSPENDED. Admin only.
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Suspend user (Admin only — soft delete)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'User suspended' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  /**
   * POST /api/v1/users/:id/reset-password
   * Reset password. Admin only.
   */
  @Post(':id/reset-password')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reset user password (Admin only)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Password reset, all sessions revoked' })
  resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResetPasswordDto,
  ): Promise<void> {
    return this.usersService.resetPassword(id, dto);
  }
}
