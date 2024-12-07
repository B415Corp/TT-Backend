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
import {
  Paginate,
  PaginationParams,
} from '../../decorators/paginate.decorator';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import { PaginatedResponseDto } from '../../common/pagination/paginated-response.dto';
import { Task } from '../../entities/task.entity';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new task', description: '' })
  @ApiResponse({
    status: 201,
    description: 'The task has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createClient(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: User,
  ) {
    return this.tasksService.create(
      createTaskDto,
      user.user_id,
      createTaskDto.project_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a task by id' })
  @Get(':id')
  async getClientById(@Param('id') id: string) {
    return this.tasksService.findById(id);
  }

  @ApiOkResponse({ type: PaginatedResponseDto<Task> })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tasks by project id' })
  @ApiParam({ name: 'project_id', required: true, description: 'Project ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @UseGuards(JwtAuthGuard)
  @Get(':project_id/tasks')
  @Paginate()
  async getTasksByProjectId(
    @Param('project_id') project_id: string,
    @PaginationParams() paginationQuery: PaginationQueryDto,
  ) {
    return this.tasksService.findByProjectId(project_id, paginationQuery);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({
    status: 200,
    description: 'The task has been successfully updated.',
  })
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a task' })
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
}
