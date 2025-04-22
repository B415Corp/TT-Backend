import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TaskStatusService } from './task-status.service';
import { CreateTaskStatusDTO } from './dto/create-task-status.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('task-status')
export class TaskStatusController {
  constructor(private readonly taskStatusService: TaskStatusService) {}

  @ApiBearerAuth()
  @ApiOkResponse({ type: CreateTaskStatusDTO })
  @ApiOperation({ summary: 'Create new note' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async setStatusToTask(@Body() dto: CreateTaskStatusDTO) {
    return this.taskStatusService.setStatusToTask(dto);
  }
}
