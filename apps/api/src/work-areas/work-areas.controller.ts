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
  Query,
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
import { WorkAreasService } from './work-areas.service';
import { CreateWorkAreaDto } from './dto/create-work-area.dto';
import { UpdateWorkAreaDto } from './dto/update-work-area.dto';
import { ListWorkAreasDto } from './dto/list-work-areas.dto';
import {
  PaginatedWorkAreasDto,
  WorkAreaDetailDto,
} from './dto/work-area-response.dto';

@ApiTags('work-areas')
@ApiBearerAuth()
@Controller('work-areas')
export class WorkAreasController {
  constructor(private readonly workAreasService: WorkAreasService) {}

  /**
   * GET /api/v1/work-areas
   * List all WK with optional filters. All authenticated users.
   */
  @Get()
  @ApiOperation({ summary: 'List WorkAreas (Wilayah Kerja)', description: 'Paginated list. Geometry excluded — use /spatial/work-areas.geojson for GeoJSON.' })
  @ApiResponse({ status: 200, type: PaginatedWorkAreasDto })
  findAll(@Query() dto: ListWorkAreasDto): Promise<PaginatedWorkAreasDto> {
    return this.workAreasService.findAll(dto);
  }

  /**
   * GET /api/v1/work-areas/:id
   * Detail view including geometry as GeoJSON.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get WorkArea detail (includes GeoJSON geometry)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: WorkAreaDetailDto })
  @ApiResponse({ status: 404, description: 'WorkArea not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<WorkAreaDetailDto> {
    return this.workAreasService.findOne(id);
  }

  /**
   * POST /api/v1/work-areas
   * Create a new WK. ADMIN + REGULATOR only.
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.REGULATOR)
  @ApiOperation({ summary: 'Create WorkArea (ADMIN + REGULATOR only)' })
  @ApiResponse({ status: 201, type: WorkAreaDetailDto })
  @ApiResponse({ status: 400, description: 'Invalid geometry or validation error' })
  @ApiResponse({ status: 409, description: 'Slug or name already exists' })
  create(
    @Body() dto: CreateWorkAreaDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<WorkAreaDetailDto> {
    return this.workAreasService.create(dto, user);
  }

  /**
   * PATCH /api/v1/work-areas/:id
   * Partial update. ADMIN + REGULATOR can update any; KKKS_OPERATOR own org only.
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.REGULATOR, UserRole.KKKS_OPERATOR)
  @ApiOperation({ summary: 'Update WorkArea (partial). KKKS_OPERATOR restricted to own org.' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: WorkAreaDetailDto })
  @ApiResponse({ status: 403, description: 'Insufficient privileges' })
  @ApiResponse({ status: 404, description: 'WorkArea not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkAreaDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<WorkAreaDetailDto> {
    return this.workAreasService.update(id, dto, user);
  }

  /**
   * DELETE /api/v1/work-areas/:id
   * Soft delete (status → TERMINATED). ADMIN only.
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete WorkArea (ADMIN only, sets status=TERMINATED)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'WorkArea terminated' })
  @ApiResponse({ status: 403, description: 'Insufficient privileges' })
  @ApiResponse({ status: 404, description: 'WorkArea not found' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.workAreasService.remove(id, user);
  }
}
