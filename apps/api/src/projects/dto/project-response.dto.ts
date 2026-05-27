import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';

export class ProjectOwnerDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() email!: string;
}

export class ProjectOrgDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
}

export class TaskStatusCountsDto {
  @ApiProperty() TODO!: number;
  @ApiProperty() IN_PROGRESS!: number;
  @ApiProperty() REVIEW!: number;
  @ApiProperty() DONE!: number;
}

export class ProjectResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiPropertyOptional() description?: string | null;
  @ApiProperty({ enum: ProjectStatus }) status!: ProjectStatus;
  @ApiPropertyOptional() color?: string | null;
  @ApiProperty({ type: ProjectOwnerDto }) owner!: ProjectOwnerDto;
  @ApiProperty({ type: ProjectOrgDto }) organization!: ProjectOrgDto;
  @ApiProperty() taskCount!: number;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class ProjectDetailResponseDto extends ProjectResponseDto {
  @ApiProperty({ type: TaskStatusCountsDto }) taskCounts!: TaskStatusCountsDto;
}

export class PaginatedProjectsResponseDto {
  @ApiProperty({ type: [ProjectResponseDto] }) items!: ProjectResponseDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() totalPages!: number;
}
