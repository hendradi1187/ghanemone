import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
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
import { SpatialService } from './spatial.service';
import { BboxQueryDto } from './dto/bbox-query.dto';
import { WithinQueryDto } from './dto/within-query.dto';
import { TransformGeometryDto, TransformGeometryResponseDto } from './dto/transform-geometry.dto';
import {
  BboxQueryResponseDto,
  GeoJsonFeatureCollectionDto,
} from './dto/geojson-response.dto';

/**
 * SpatialController — generic GIS endpoints for Ghanem.one.
 *
 * Prefix: /api/v1/spatial
 *
 * All read endpoints require a valid JWT (JwtAuthGuard is global).
 * No write operations here — mutations live in resource-specific controllers.
 */
@ApiTags('spatial')
@ApiBearerAuth()
@Controller('spatial')
export class SpatialController {
  constructor(private readonly spatialService: SpatialService) {}

  // ---------------------------------------------------------------------------
  // Spatial query endpoints
  // ---------------------------------------------------------------------------

  /**
   * GET /api/v1/spatial/bbox
   * Find features intersecting a bounding box.
   * Mandatory bbox filter ensures GIST index is always used.
   */
  @Get('bbox')
  @ApiOperation({
    summary: 'Bbox spatial query',
    description:
      'Return features (any layer type) that intersect the given WGS84 bounding box. ' +
      'Uses ST_Intersects with ST_MakeEnvelope — GIST index always engaged.',
  })
  @ApiResponse({ status: 200, type: BboxQueryResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid bbox or unsupported type' })
  bboxQuery(@Query() dto: BboxQueryDto): Promise<BboxQueryResponseDto> {
    return this.spatialService.bboxQuery(dto);
  }

  /**
   * GET /api/v1/spatial/within
   * Find features contained within a polygon.
   * Supply ?wktPolygon=POLYGON(...) or ?geojson={...} plus ?type=...
   */
  @Get('within')
  @ApiOperation({
    summary: 'Within-polygon spatial query',
    description:
      'Return features whose geometry is completely inside the supplied polygon. ' +
      'Uses ST_Within — GIST index on geometry column engaged.',
  })
  @ApiResponse({ status: 200, type: BboxQueryResponseDto })
  @ApiResponse({ status: 400, description: 'Missing polygon or unsupported type' })
  withinQuery(@Query() dto: WithinQueryDto): Promise<BboxQueryResponseDto> {
    return this.spatialService.withinQuery(dto);
  }

  /**
   * POST /api/v1/spatial/transform
   * Transform a GeoJSON geometry between coordinate reference systems via PostGIS ST_Transform.
   */
  @Post('transform')
  @ApiOperation({
    summary: 'CRS transform',
    description:
      'Transform any GeoJSON geometry between coordinate reference systems. ' +
      'Delegates to PostGIS ST_Transform — supports all PROJ 9 SRIDs including ' +
      'EPSG:3857 (Web Mercator), UTM zones 47S–54S (EPSG:32747–32754), and ' +
      'DGN95 / Indonesia TM-3 zones (EPSG:23830–23845).',
  })
  @ApiResponse({ status: 200, type: TransformGeometryResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid geometry or unsupported SRID' })
  transform(@Body() dto: TransformGeometryDto): Promise<TransformGeometryResponseDto> {
    return this.spatialService.transformGeometry(dto);
  }

  // ---------------------------------------------------------------------------
  // GeoJSON export endpoints — full FeatureCollection per resource
  // Cache 5 minutes — data is relatively static
  // ---------------------------------------------------------------------------

  @Get('work-areas.geojson')
  @Header('Content-Type', 'application/geo+json')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({ summary: 'Export all WorkAreas as GeoJSON FeatureCollection' })
  @ApiResponse({ status: 200, type: GeoJsonFeatureCollectionDto })
  exportWorkAreas(): Promise<GeoJsonFeatureCollectionDto> {
    return this.spatialService.exportWorkAreas();
  }

  @Get('wells.geojson')
  @Header('Content-Type', 'application/geo+json')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({ summary: 'Export all Wells as GeoJSON FeatureCollection' })
  @ApiResponse({ status: 200, type: GeoJsonFeatureCollectionDto })
  exportWells(): Promise<GeoJsonFeatureCollectionDto> {
    return this.spatialService.exportWells();
  }

  @Get('pipelines.geojson')
  @Header('Content-Type', 'application/geo+json')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({ summary: 'Export all Pipelines as GeoJSON FeatureCollection' })
  @ApiResponse({ status: 200, type: GeoJsonFeatureCollectionDto })
  exportPipelines(): Promise<GeoJsonFeatureCollectionDto> {
    return this.spatialService.exportPipelines();
  }

  @Get('facilities.geojson')
  @Header('Content-Type', 'application/geo+json')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({ summary: 'Export all Facilities as GeoJSON FeatureCollection' })
  @ApiResponse({ status: 200, type: GeoJsonFeatureCollectionDto })
  exportFacilities(): Promise<GeoJsonFeatureCollectionDto> {
    return this.spatialService.exportFacilities();
  }

  @Get('seismic-coverages.geojson')
  @Header('Content-Type', 'application/geo+json')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({ summary: 'Export all SeismicCoverages as GeoJSON FeatureCollection' })
  @ApiResponse({ status: 200, type: GeoJsonFeatureCollectionDto })
  exportSeismicCoverages(): Promise<GeoJsonFeatureCollectionDto> {
    return this.spatialService.exportSeismicCoverages();
  }

  /**
   * GET /api/v1/spatial/datasets/:id/geojson
   * Export single dataset bbox as GeoJSON Feature.
   */
  @Get('datasets/:id/geojson')
  @Header('Content-Type', 'application/geo+json')
  @Header('Cache-Control', 'public, max-age=60')
  @ApiOperation({ summary: 'Export single dataset bbox as GeoJSON Feature' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Dataset not found' })
  exportDatasetById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Record<string, unknown>> {
    return this.spatialService.exportDatasetById(id);
  }
}
