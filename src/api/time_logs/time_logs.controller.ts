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
import { PaginatedResponseDto } from '../../common/pagination/paginated-response.dto';
import {
  Paginate,
  PaginationParams,
} from '../../decorators/paginate.decorator';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import { TimeLog } from '../../entities/time-logs.entity';

@ApiTags('time-logs')
@Controller('time-logs')
export class TimeLogsController {
  constructor(private readonly timeLogsService: TimeLogsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a time-log by id' })
  @Get(':id')
  async getClientById(@Param('id') id: string) {
    return this.timeLogsService.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Start a time-log' })
  @ApiResponse({
    status: 200,
    description: 'The time-log has been successfully started.',
  })
  @Post(':task_id/start/me')
  async start(@Param('task_id') id: string, @GetUser() user: User) {
    return this.timeLogsService.start(id, user.user_id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Stop a time-log' })
  @ApiResponse({
    status: 200,
    description: 'The time-log has been successfully stopped.',
  })
  @Patch(':log_id/stop/me')
  async stop(@Param('log_id') id: string) {
    return this.timeLogsService.stop(id);
  }

  @ApiOkResponse({ type: PaginatedResponseDto<TimeLog> })
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
  @Get(':task_id/logs/me')
  @Paginate()
  async getMe(
    @Param('task_id') id: string,
    @GetUser() user: User,
    @PaginationParams() paginationQuery: PaginationQueryDto,
  ) {
    return this.timeLogsService.findTimeLogsByTaskId(
      id,
      user.user_id,
      paginationQuery,
    );
  }
}
