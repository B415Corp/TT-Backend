import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TaskStatusColumnService } from './task-status-column.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateTaskStatusColumtDTO } from './dto/create-task-status-column.dto';
import { UpdateTaskStatusColumtDTO } from './dto/update-task-status-column.dto';

@Controller('task-status-column')
export class TaskStatusColumnController {
  constructor(
    private readonly taskStatusColumnService: TaskStatusColumnService
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get satus-columns by project id' })
  @UseGuards(JwtAuthGuard)
  @Get(':project_id')
  async getByProjectId(@Param('project_id') project_id: string) {
    return this.taskStatusColumnService.getByProjectId(project_id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new status-column' })
  @ApiResponse({
    status: 201,
    description: 'The project has been successfully created.',
    type: CreateTaskStatusColumtDTO,
  })
  @Post(':project_id')
  async createTaskStatusColumn(
    @Param('project_id') id: string,
    @Body() dto: CreateTaskStatusColumtDTO
  ) {
    return this.taskStatusColumnService.create(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a status list' })
  @ApiResponse({
    status: 201,
    description: 'The status list has been successfully update.',
    type: UpdateTaskStatusColumtDTO,
  })
  @Patch(':task_id')
  async patchTaskStatusColumn(
    @Param('task_id') task_id: string,
    @Body() dto: UpdateTaskStatusColumtDTO
  ) {
    return this.taskStatusColumnService.update(task_id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a status-column' })
  @Delete(':task_id')
  async deleteTaskStatusColumn(@Param('task_id') task_id: string) {
    return this.taskStatusColumnService.delete(task_id);
  }
}
