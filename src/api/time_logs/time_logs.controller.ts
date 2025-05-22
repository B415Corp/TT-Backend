import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TimeLogsService } from './time_logs.service';
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
import { GetUser } from '../../decorators/get-user.decorator';
import { User } from '../../entities/user.entity';
import {
  Paginate,
  PaginationParams,
} from '../../decorators/paginate.decorator';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import { TimeLog } from '../../entities/time-logs.entity';
import { TimeLogsPaginatedResponse } from './dto/time-logs-paginated-response.dto';
import { PROJECT_ROLE } from 'src/common/enums/project-role.enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/guards/roles.decorator';
import { SubscriptionGuard } from 'src/guards/subscription.guard';
// import { Subscription } from 'src/decorators/subscription.decorator';
// import { SubscriptionType } from 'src/common/enums/subscription-type.enum';

@ApiTags('time-logs')
@Controller('time-logs')
export class TimeLogsController {
  constructor(private readonly timeLogsService: TimeLogsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получить общее затраченное время по всем задачам проекта' })
  @ApiResponse({ status: 200, type: Number, description: 'Общее время (duration) по проекту в миллисекундах' })
  @Get('/project/:project_id/total-duration')
  async getTotalDurationByProject(@Param('project_id') project_id: string) {
    const total = await this.timeLogsService.getTotalDurationByProject(project_id);
    return { total_duration: total };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the latest time log for the user' })
  @ApiResponse({ status: 200, type: TimeLog })
  @Get('/latest')
  async getLatestTimeLog(@GetUser() user: User) {
    return this.timeLogsService.findLatestLogByUserId(user.user_id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the latest time log for the user' })
  @ApiResponse({ status: 200, type: TimeLog })
  @Get('/stats/task/:task_id')
  async timeLogsStatsByTask(@Param('task_id') task_id: string) {
    return this.timeLogsService.timeLogsStatsByTask(task_id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, type: TimeLog })
  @ApiOperation({ summary: 'Get a time-log by id' })
  @Get(':id')
  async getClientById(@Param('id') id: string) {
    return this.timeLogsService.findById(id);
  }

  @ApiOperation({ summary: 'Start a time-log' })
  @ApiResponse({ status: 200, type: TimeLog })
  @ApiResponse({
    status: 200,
    description: 'The time-log has been successfully started.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles([PROJECT_ROLE.OWNER, PROJECT_ROLE.EXECUTOR], 'project')
  @Post(':task_id/start')
  async start(@Param('task_id') id: string, @GetUser() user: User) {
    return this.timeLogsService.start(id, user.user_id);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: TimeLog })
  @ApiOperation({ summary: 'Stop a time-log' })
  @ApiResponse({
    status: 200,
    description: 'The time-log has been successfully stopped.',
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles([PROJECT_ROLE.OWNER, PROJECT_ROLE.EXECUTOR], 'project')
  @Patch(':task_id/stop')
  async stop(
    @Param('task_id') id: string,
    @Query('client_time') client_time: string
  ) {
    return this.timeLogsService.stop(id, client_time);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get latest time-log in a task' })
  @ApiResponse({ status: 200, type: TimeLog })
  @ApiResponse({
    status: 200,
    description: 'The latest time-log has been successfully received.',
  })
  @Get(':task_id/latest')
  async getLatest(@Param('task_id') id: string, @GetUser() user: User) {
    return this.timeLogsService.findLatestLogInTask(id, user.user_id);
  }

  @ApiOkResponse({ type: TimeLogsPaginatedResponse })
  @ApiOperation({ summary: 'Get all my time-logs in a task', description: '' })
  @ApiParam({ name: 'task_id', required: true, description: 'Task ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @Get(':task_id/logs')
  // @Subscription(SubscriptionType.BASIC, SubscriptionType.PREMIUM)
  @Paginate()
  async getMe(
    @Param('task_id') id: string,
    @GetUser() user: User,
    @PaginationParams() paginationQuery: PaginationQueryDto
  ) {
    return this.timeLogsService.findTimeLogsByTaskId(
      id,
      user.user_id,
      paginationQuery
    );
  }
}
