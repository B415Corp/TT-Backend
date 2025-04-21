import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TaskStatusService } from './task-status.service';
import { CreateTaskStatusDTO } from './dto/create-task-status.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('task-status')
export class TaskStatusController {
  constructor(private readonly taskStatusService: TaskStatusService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.taskStatusService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.taskStatusService.getByTaskId(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateTaskStatusDTO) {
    // Получаем TaskStatusColumn по id
    const statusColumn = await this.taskStatusService.findColumnById(dto.task_status_column_id);
    if (!statusColumn) {
      throw new Error('TaskStatusColumn not found');
    }
    // Создаём TaskStatus, связанный только с колонкой статуса
    return this.taskStatusService.create({
      taskStatusColumn: statusColumn,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateTaskStatusDTO>
  ) {
    // Обновляем только task_status_column_id (или оба поля, если нужно)
    const updateData: any = {};
    if (dto.task_status_column_id) {
      updateData.taskStatusColumn = { id: dto.task_status_column_id };
    }
    if (dto.task_id) {
      updateData.task = { task_id: dto.task_id };
    }
    return this.taskStatusService.update(id, updateData);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.taskStatusService.remove(id);
  }
}
