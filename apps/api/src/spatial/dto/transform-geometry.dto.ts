import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsObject, IsPositive } from 'class-validator';

/**
 * Request body for CRS transform endpoint.
 * Transforms a GeoJSON geometry from one SRID to another using PostGIS ST_Transform.
 *
 * Supported source/target SRIDs:
 *   - 4326  (WGS84 geographic — canonical storage CRS)
 *   - 3857  (Web Mercator — tile display)
 *   - 32747..32754 (UTM zones 47S–54S for Indonesian archipelago)
 *   - 23830..32845 (DGN95 / Indonesia TM-3 zones)
 */
export class TransformGeometryDto {
  @ApiProperty({
    description: 'GeoJSON geometry object to transform (any geometry type)',
    example: { type: 'Point', coordinates: [107.5, -6.3] },
  })
  @IsObject()
  geometry!: Record<string, unknown>;

  @ApiProperty({ description: 'Source SRID (e.g. 4326)', example: 4326 })
  @IsNumber()
  @IsPositive()
  fromSrid!: number;

  @ApiProperty({ description: 'Target SRID (e.g. 3857)', example: 3857 })
  @IsNumber()
  @IsPositive()
  toSrid!: number;
}

export class TransformGeometryResponseDto {
  @ApiProperty({ description: 'Transformed GeoJSON geometry' })
  geometry!: Record<string, unknown>;

  @ApiProperty({ description: 'Output SRID', example: 3857 })
  srid!: number;

  @ApiProperty({ description: 'Source SRID', example: 4326 })
  fromSrid!: number;
}
