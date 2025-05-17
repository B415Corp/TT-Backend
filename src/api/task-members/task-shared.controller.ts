import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  Get,
  Body,
} from '@nestjs/common';
import { TaskSharedService } from './task-shared.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AssignUserDto } from './dto/assign-user.dto';
import { PROJECT_ROLE } from 'src/common/enums/project-role.enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/guards/roles.decorator';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from 'src/entities/user.entity';

@ApiTags('task-shared')
@Controller('tasks/shared')
export class TaskSharedController {
  constructor(private readonly taskMembersService: TaskSharedService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get users assigned to a task' })
  @ApiResponse({ status: 200, description: 'List of users assigned to task.' })
  @Get(':taskId/role')
  async getUserRoleByTask(
    @Param('taskId') taskId: string,
    @GetUser() user: User
  ) {
    return this.taskMembersService.getUserRoleInTask(taskId, user.user_id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get users assigned to a task' })
  @ApiResponse({ status: 200, description: 'List of users assigned to task.' })
  @Get(':taskId')
  async getUsersAssignedToTask(@Param('taskId') taskId: string) {
    return this.taskMembersService.getUsersAssignedToTask(taskId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign a user to a task' })
  @ApiResponse({ status: 201, description: 'User assigned to task.' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles([PROJECT_ROLE.OWNER, PROJECT_ROLE.MANAGER], 'task')
  @Post(':taskId')
  async assignUserToTask(
    @Param('taskId') taskId: string,
    @Body() assignUserDto: AssignUserDto
  ) {
    return this.taskMembersService.assignUserToTask(
      taskId,
      assignUserDto.userId
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a user from a task' })
  @ApiResponse({ status: 204, description: 'User removed from task.' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles([PROJECT_ROLE.OWNER, PROJECT_ROLE.MANAGER], 'project')
  @Delete(':taskId/:userId')
  async removeUserFromTask(
    @Param('taskId') taskId: string,
    @Param('userId') userId: string
  ) {
    return this.taskMembersService.removeUserFromTask(taskId, userId);
  }
}
