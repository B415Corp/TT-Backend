import { Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
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

@ApiTags('time-logs')
@Controller('time-logs')
export class TimeLogsController {
  constructor(private readonly timeLogsService: TimeLogsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, type: TimeLog })
  @ApiOperation({ summary: 'Get a time-log by id' })
  @Get(':id')
  async getClientById(@Param('id') id: string) {
    return this.timeLogsService.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Start a time-log' })
  @ApiResponse({ status: 200, type: TimeLog })
  @ApiResponse({
    status: 200,
    description: 'The time-log has been successfully started.',
  })
  @Post(':task_id/start')
  async start(@Param('task_id') id: string, @GetUser() user: User) {
    return this.timeLogsService.start(id, user.user_id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, type: TimeLog })
  @ApiOperation({ summary: 'Stop a time-log' })
  @ApiResponse({
    status: 200,
    description: 'The time-log has been successfully stopped.',
  })
  @Patch(':task_id/stop')
  async stop(@Param('task_id') id: string) {
    return this.timeLogsService.stop(id);
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all my time-logs in a task', description: '' })
  @ApiParam({ name: 'task_id', required: true, description: 'Task ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @UseGuards(JwtAuthGuard)
  @Get(':task_id/logs')
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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the latest time log for the user' })
  @ApiResponse({ status: 200, type: TimeLog })
  @Get('latest')
  async getLatestTimeLog(@GetUser() user: User): Promise<TimeLog> {
    return this.timeLogsService.findLatestLogByUserId(user.user_id);
  }
}
