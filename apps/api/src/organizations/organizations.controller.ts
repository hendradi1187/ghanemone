import {
  Body,
  Controller,
  Get,
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
import { OrganizationsService } from './organizations.service';
import {
  CreateOrganizationDto,
  OrganizationResponseDto,
  UpdateOrganizationDto,
} from './dto/organization.dto';

@ApiTags('organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  /**
   * GET /api/v1/organizations
   * List all organizations. Accessible by any authenticated user.
   */
  @Get()
  @ApiOperation({ summary: 'List all organizations' })
  @ApiResponse({ status: 200, type: [OrganizationResponseDto] })
  findAll(): Promise<OrganizationResponseDto[]> {
    return this.orgsService.findAll();
  }

  /**
   * GET /api/v1/organizations/:slug
   * Get organization by URL slug (e.g. 'skk-migas', 'phe-onwj').
   */
  @Get(':slug')
  @ApiOperation({ summary: 'Get organization by slug' })
  @ApiParam({ name: 'slug', example: 'skk-migas' })
  @ApiResponse({ status: 200, type: OrganizationResponseDto })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  findBySlug(@Param('slug') slug: string): Promise<OrganizationResponseDto> {
    return this.orgsService.findBySlug(slug);
  }

  /**
   * POST /api/v1/organizations
   * Create a new organization. Admin only.
   */
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create organization (Admin only)' })
  @ApiResponse({ status: 201, type: OrganizationResponseDto })
  @ApiResponse({ status: 409, description: 'Name or slug already exists' })
  create(@Body() dto: CreateOrganizationDto): Promise<OrganizationResponseDto> {
    return this.orgsService.create(dto);
  }

  /**
   * PATCH /api/v1/organizations/:id
   * Update organization by UUID. Admin only.
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update organization (Admin only)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: OrganizationResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    return this.orgsService.update(id, dto);
  }
}
