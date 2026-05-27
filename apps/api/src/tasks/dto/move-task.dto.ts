import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class MoveTaskDto {
  @ApiPropertyOptional({
    enum: TaskStatus,
    description: 'New status column (for Kanban column change)',
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({
    description: 'New display order within the status column',
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order!: number;
}
