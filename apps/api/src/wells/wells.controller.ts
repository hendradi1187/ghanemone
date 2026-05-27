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
import { WellsService } from './wells.service';
import { CreateWellDto } from './dto/create-well.dto';
import { UpdateWellDto } from './dto/update-well.dto';
import { ListWellsDto } from './dto/list-wells.dto';
import { PaginatedWellsDto, WellDetailDto } from './dto/well-response.dto';

@ApiTags('wells')
@ApiBearerAuth()
@Controller('wells')
export class WellsController {
  constructor(private readonly wellsService: WellsService) {}

  @Get()
  @ApiOperation({ summary: 'List wells', description: 'Paginated. Geometry excluded — use /spatial/wells.geojson for GeoJSON.' })
  @ApiResponse({ status: 200, type: PaginatedWellsDto })
  findAll(@Query() dto: ListWellsDto): Promise<PaginatedWellsDto> {
    return this.wellsService.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get well detail (includes GeoJSON point geometry)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: WellDetailDto })
  @ApiResponse({ status: 404, description: 'Well not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<WellDetailDto> {
    return this.wellsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.REGULATOR, UserRole.KKKS_OPERATOR)
  @ApiOperation({ summary: 'Create well. KKKS_OPERATOR can create for own org only.' })
  @ApiResponse({ status: 201, type: WellDetailDto })
  @ApiResponse({ status: 409, description: 'UWI already exists' })
  create(
    @Body() dto: CreateWellDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<WellDetailDto> {
    return this.wellsService.create(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.REGULATOR, UserRole.KKKS_OPERATOR)
  @ApiOperation({ summary: 'Update well (partial). Lat/lon updates regenerate point geometry.' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: WellDetailDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWellDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<WellDetailDto> {
    return this.wellsService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.REGULATOR, UserRole.KKKS_OPERATOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete well (status → ABANDONED)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204 })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.wellsService.remove(id, user);
  }
}
