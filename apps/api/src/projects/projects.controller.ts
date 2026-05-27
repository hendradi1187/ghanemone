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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ListProjectsDto } from './dto/list-projects.dto';
import {
  PaginatedProjectsResponseDto,
  ProjectDetailResponseDto,
} from './dto/project-response.dto';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * GET /api/v1/projects
   * List projects — org-scoped for non-admin users.
   */
  @Get()
  @ApiOperation({
    summary: 'List projects',
    description:
      'Returns a paginated list of projects. Non-admin users see only their own organization projects.',
  })
  @ApiResponse({ status: 200, type: PaginatedProjectsResponseDto })
  findAll(
    @Query() query: ListProjectsDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedProjectsResponseDto> {
    return this.projectsService.findAll(query, user);
  }

  /**
   * GET /api/v1/projects/:id
   * Project detail with task counts grouped by status.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get project detail with task status counts' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: ProjectDetailResponseDto })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProjectDetailResponseDto> {
    return this.projectsService.findOne(id, user);
  }

  /**
   * POST /api/v1/projects
   * Create project. KKKS_OPERATOR and ADMIN only.
   */
  @Post()
  @Roles(UserRole.KKKS_OPERATOR, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new project (KKKS_OPERATOR+)' })
  @ApiResponse({ status: 201, type: ProjectDetailResponseDto })
  @ApiResponse({ status: 409, description: 'Slug already taken' })
  create(
    @Body() dto: CreateProjectDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProjectDetailResponseDto> {
    return this.projectsService.create(dto, user);
  }

  /**
   * PATCH /api/v1/projects/:id
   * Update project — owner or ADMIN only.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update project (owner or ADMIN)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: ProjectDetailResponseDto })
  @ApiResponse({ status: 403, description: 'Not the owner or Admin' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProjectDetailResponseDto> {
    return this.projectsService.update(id, dto, user);
  }

  /**
   * DELETE /api/v1/projects/:id
   * Soft delete — sets status=ARCHIVED. Owner or ADMIN only.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive project (soft delete) — owner or ADMIN' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Project archived' })
  @ApiResponse({ status: 403, description: 'Not the owner or Admin' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.projectsService.remove(id, user);
  }
}
