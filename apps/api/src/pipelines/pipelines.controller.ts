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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/dto/jwt-payload.interface';
import { PipelinesService } from './pipelines.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { ListPipelinesDto } from './dto/list-pipelines.dto';
import { PaginatedPipelinesDto, PipelineDetailDto } from './dto/pipeline-response.dto';

@ApiTags('pipelines')
@ApiBearerAuth()
@Controller('pipelines')
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @Get()
  @ApiOperation({ summary: 'List pipelines. Geometry excluded — use /spatial/pipelines.geojson.' })
  @ApiResponse({ status: 200, type: PaginatedPipelinesDto })
  findAll(@Query() dto: ListPipelinesDto): Promise<PaginatedPipelinesDto> {
    return this.pipelinesService.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pipeline detail (includes GeoJSON LineString geometry)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PipelineDetailDto })
  @ApiResponse({ status: 404, description: 'Pipeline not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PipelineDetailDto> {
    return this.pipelinesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.REGULATOR, UserRole.KKKS_OPERATOR)
  @ApiOperation({ summary: 'Create pipeline with GeoJSON LineString. length_km computed server-side.' })
  @ApiResponse({ status: 201, type: PipelineDetailDto })
  @ApiResponse({ status: 400, description: 'Invalid LineString geometry' })
  create(
    @Body() dto: CreatePipelineDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PipelineDetailDto> {
    return this.pipelinesService.create(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.REGULATOR, UserRole.KKKS_OPERATOR)
  @ApiOperation({ summary: 'Update pipeline. Providing new line geometry recomputes length_km.' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PipelineDetailDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePipelineDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PipelineDetailDto> {
    return this.pipelinesService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.REGULATOR, UserRole.KKKS_OPERATOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete pipeline (status → DECOMMISSIONED)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204 })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.pipelinesService.remove(id, user);
  }
}
