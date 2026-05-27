import { Module } from '@nestjs/common';
import { SpatialController } from './spatial.controller';
import { SpatialService } from './spatial.service';

/**
 * SpatialModule — generic GIS endpoints.
 *
 * Provides:
 *  - Bbox query (ST_Intersects + ST_MakeEnvelope)
 *  - Within query (ST_Within)
 *  - CRS transform (ST_Transform via PostGIS)
 *  - GeoJSON export for all geometry tables
 *
 * PrismaModule is global — no explicit import needed.
 */
@Module({
  controllers: [SpatialController],
  providers: [SpatialService],
  exports: [SpatialService],
})
export class SpatialModule {}
