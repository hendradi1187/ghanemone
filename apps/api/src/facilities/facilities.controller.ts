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
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { ListFacilitiesDto } from './dto/list-facilities.dto';
import { FacilityDetailDto, PaginatedFacilitiesDto } from './dto/facility-response.dto';

@ApiTags('facilities')
@ApiBearerAuth()
@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List facilities. Geometry excluded — use /spatial/facilities.geojson.' })
  @ApiResponse({ status: 200, type: PaginatedFacilitiesDto })
  findAll(@Query() dto: ListFacilitiesDto): Promise<PaginatedFacilitiesDto> {
    return this.facilitiesService.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get facility detail (includes GeoJSON point geometry)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: FacilityDetailDto })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<FacilityDetailDto> {
    return this.facilitiesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.REGULATOR, UserRole.KKKS_OPERATOR)
  @ApiOperation({ summary: 'Create facility. Point geometry auto-generated from lat/lon.' })
  @ApiResponse({ status: 201, type: FacilityDetailDto })
  create(
    @Body() dto: CreateFacilityDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<FacilityDetailDto> {
    return this.facilitiesService.create(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.REGULATOR, UserRole.KKKS_OPERATOR)
  @ApiOperation({ summary: 'Update facility. Lat/lon changes regenerate point geometry.' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: FacilityDetailDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFacilityDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<FacilityDetailDto> {
    return this.facilitiesService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.REGULATOR, UserRole.KKKS_OPERATOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete facility (status → DECOMMISSIONED)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204 })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.facilitiesService.remove(id, user);
  }
}
