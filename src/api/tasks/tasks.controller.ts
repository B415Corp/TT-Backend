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
import { TasksService } from './tasks.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetUser } from '../../decorators/get-user.decorator';
import { User } from '../../entities/user.entity';
import { Task } from '../../entities/task.entity';
import { PaginatedResponseDto } from '../../common/pagination/paginated-response.dto';
import { Paginate, PaginationParams } from 'src/decorators/paginate.decorator';
import { PaginationQueryDto } from 'src/common/pagination/pagination-query.dto';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({
    status: 201,
    description: 'The task has been successfully created.',
    type: Task,
  })
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: User
  ) {
    return this.tasksService.create(
      createTaskDto,
      user.user_id,
      createTaskDto.project_id
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved task.',
    type: Task,
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getTaskById(@Param('id') id: string) {
    return this.tasksService.findById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({
    status: 200,
    description: 'The task has been successfully updated.',
    type: Task,
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted the task.',
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: PaginatedResponseDto<Task> })
  @ApiOperation({ summary: 'Get all tasks for a specific project' })
  @ApiParam({ name: 'project_id', required: true, description: 'Project ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @UseGuards(JwtAuthGuard)
  @Get(':project_id/tasks')
  @Paginate()
  async getTasksByProjectId(
    @Param('project_id') projectId: string,
    @GetUser() user: User,
    @PaginationParams() paginationQuery: PaginationQueryDto
  ) {
    return this.tasksService.findByProjectId(
      projectId,
      user.user_id,
      paginationQuery
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all tasks by user ID' })
  @ApiResponse({ status: 200, type: [Task] })
  @Get('user/me')
  async getTasksByUserId(@GetUser() user: User): Promise<Task[]> {
    return this.tasksService.findTasksByUserId(user.user_id);
  }
}
