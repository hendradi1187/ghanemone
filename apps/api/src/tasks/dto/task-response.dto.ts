import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '@prisma/client';

export class TaskAssigneeDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() email!: string;
}

export class TaskResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() projectId!: string;
  @ApiProperty() title!: string;
  @ApiPropertyOptional() description?: string | null;
  @ApiProperty({ enum: TaskStatus }) status!: TaskStatus;
  @ApiProperty({ enum: TaskPriority }) priority!: TaskPriority;
  @ApiPropertyOptional({ type: TaskAssigneeDto }) assignee?: TaskAssigneeDto | null;
  @ApiPropertyOptional() dueDate?: Date | null;
  @ApiProperty() order!: number;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class KanbanBoardDto {
  @ApiProperty({ type: [TaskResponseDto] }) TODO!: TaskResponseDto[];
  @ApiProperty({ type: [TaskResponseDto] }) IN_PROGRESS!: TaskResponseDto[];
  @ApiProperty({ type: [TaskResponseDto] }) REVIEW!: TaskResponseDto[];
  @ApiProperty({ type: [TaskResponseDto] }) DONE!: TaskResponseDto[];
}
