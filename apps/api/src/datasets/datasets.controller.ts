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
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/dto/jwt-payload.interface';
import { DatasetsService } from './datasets.service';
import { CreateDatasetDto } from './dto/create-dataset.dto';
import { UpdateDatasetDto } from './dto/update-dataset.dto';
import { ListDatasetsDto } from './dto/list-datasets.dto';
import { ApproveDatasetDto, RejectDatasetDto } from './dto/approve-dataset.dto';
import {
  DetailDatasetResponseDto,
  DownloadResponseDto,
  PaginatedDatasetsResponseDto,
} from './dto/dataset-response.dto';

@ApiTags('datasets')
@ApiBearerAuth()
@Controller('datasets')
export class DatasetsController {
  constructor(private readonly datasetsService: DatasetsService) {}

  /**
   * GET /api/v1/datasets
   * Paginated, filterable dataset list.
   * RBAC sensitivity scoping applied server-side.
   */
  @Get()
  @ApiOperation({
    summary: 'List datasets',
    description:
      'Returns a paginated list of datasets. Sensitivity-level RBAC scoping is applied server-side based on the requesting user role and organization.',
  })
  @ApiResponse({ status: 200, type: PaginatedDatasetsResponseDto })
  findAll(
    @Query() query: ListDatasetsDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedDatasetsResponseDto> {
    return this.datasetsService.findAll(query, user);
  }

  /**
   * GET /api/v1/datasets/:id
   * Dataset detail. Sensitivity check performed inside service.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get dataset detail by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: DetailDatasetResponseDto })
  @ApiResponse({ status: 403, description: 'Insufficient sensitivity access' })
  @ApiResponse({ status: 404, description: 'Dataset not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<DetailDatasetResponseDto> {
    return this.datasetsService.findOne(id, user);
  }

  /**
   * POST /api/v1/datasets
   * Create a new dataset. KKKS_OPERATOR and ADMIN only.
   * Dataset starts with status=DRAFT.
   */
  @Post()
  @Roles(UserRole.KKKS_OPERATOR, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create dataset (KKKS_OPERATOR + ADMIN)',
    description: 'Creates a new dataset record with status=DRAFT. Files are uploaded separately via /upload.',
  })
  @ApiResponse({ status: 201, type: DetailDatasetResponseDto })
  create(
    @Body() dto: CreateDatasetDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ): Promise<DetailDatasetResponseDto> {
    return this.datasetsService.create(
      dto,
      user,
      req.ip,
      req.headers['user-agent'],
    );
  }

  /**
   * PATCH /api/v1/datasets/:id
   * Update dataset metadata. Uploader or ADMIN only.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update dataset (uploader or ADMIN)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: DetailDatasetResponseDto })
  @ApiResponse({ status: 403, description: 'Not the uploader or Admin' })
  @ApiResponse({ status: 404, description: 'Dataset not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDatasetDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ): Promise<DetailDatasetResponseDto> {
    return this.datasetsService.update(id, dto, user, req.ip, req.headers['user-agent']);
  }

  /**
   * DELETE /api/v1/datasets/:id
   * Soft delete — sets status=ARCHIVED. ADMIN or uploader only.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive (soft-delete) dataset (ADMIN or uploader)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Dataset archived' })
  @ApiResponse({ status: 403, description: 'Not the uploader or Admin' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ): Promise<void> {
    return this.datasetsService.remove(id, user, req.ip, req.headers['user-agent']);
  }

  /**
   * POST /api/v1/datasets/:id/approve
   * Approve a dataset. REGULATOR only.
   */
  @Post(':id/approve')
  @Roles(UserRole.REGULATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Approve dataset (REGULATOR)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: DetailDatasetResponseDto })
  @ApiResponse({ status: 403, description: 'Regulator role required' })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveDatasetDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ): Promise<DetailDatasetResponseDto> {
    return this.datasetsService.approve(id, dto, user, req.ip, req.headers['user-agent']);
  }

  /**
   * POST /api/v1/datasets/:id/reject
   * Reject a dataset. REGULATOR only.
   */
  @Post(':id/reject')
  @Roles(UserRole.REGULATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Reject dataset (REGULATOR)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: DetailDatasetResponseDto })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectDatasetDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ): Promise<DetailDatasetResponseDto> {
    return this.datasetsService.reject(id, dto, user, req.ip, req.headers['user-agent']);
  }

  /**
   * POST /api/v1/datasets/:id/download
   * Returns signed file download URL. Sensitivity check performed inside service.
   * Increments download counter + writes audit log.
   */
  @Post(':id/download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get dataset download URL',
    description:
      'Returns a (pre-)signed download URL and logs the download event in the audit trail. Sensitivity access check applied.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: DownloadResponseDto })
  @ApiResponse({ status: 403, description: 'Insufficient sensitivity access' })
  download(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ): Promise<DownloadResponseDto> {
    return this.datasetsService.download(id, user, req.ip, req.headers['user-agent']);
  }
}
