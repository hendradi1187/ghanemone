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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/dto/jwt-payload.interface';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { ListTasksDto } from './dto/list-tasks.dto';
import { KanbanBoardDto, TaskResponseDto } from './dto/task-response.dto';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * GET /api/v1/projects/:projectId/tasks
   * Returns tasks grouped by status for Kanban board.
   */
  @Get('projects/:projectId/tasks')
  @ApiOperation({
    summary: 'List tasks for a project (Kanban grouped by status)',
    description: 'Returns tasks grouped into TODO/IN_PROGRESS/REVIEW/DONE columns.',
  })
  @ApiParam({ name: 'projectId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: KanbanBoardDto })
  listByProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: ListTasksDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<KanbanBoardDto> {
    return this.tasksService.listByProject(projectId, query, user);
  }

  /**
   * POST /api/v1/projects/:projectId/tasks
   * Create a new task within a project.
   */
  @Post('projects/:projectId/tasks')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create task in project' })
  @ApiParam({ name: 'projectId', type: String, format: 'uuid' })
  @ApiResponse({ status: 201, type: TaskResponseDto })
  create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<TaskResponseDto> {
    return this.tasksService.create(projectId, dto, user);
  }

  /**
   * PATCH /api/v1/tasks/:id
   * Update task fields.
   */
  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update task' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  @ApiResponse({ status: 404, description: 'Task not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<TaskResponseDto> {
    return this.tasksService.update(id, dto, user);
  }

  /**
   * DELETE /api/v1/tasks/:id
   * Delete a task permanently.
   */
  @Delete('tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete task' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Task deleted' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.tasksService.remove(id, user);
  }

  /**
   * PATCH /api/v1/tasks/:id/move
   * Move task to a new status column and/or order position (drag-drop safe).
   */
  @Patch('tasks/:id/move')
  @ApiOperation({
    summary: 'Move task (drag-drop reorder)',
    description:
      'Updates task status and/or order position atomically. Shifts conflicting tasks in a DB transaction.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  @ApiResponse({ status: 404, description: 'Task not found' })
  move(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MoveTaskDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<TaskResponseDto> {
    return this.tasksService.move(id, dto, user);
  }
}
