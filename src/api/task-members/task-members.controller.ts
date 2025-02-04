import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  Get,
  Body,
} from '@nestjs/common';
import { TaskMembersService } from './task-members.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AssignUserDto } from './dto/assign-user.dto';
import { ProjectRole } from 'src/common/enums/project-role.enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/guards/roles.decorator';

@ApiTags('task-members')
@Controller('tasks')
export class TaskMembersController {
  constructor(private readonly taskMembersService: TaskMembersService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign a user to a task' })
  @ApiResponse({ status: 201, description: 'User assigned to task.' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(ProjectRole.OWNER, ProjectRole.MANAGER)
  @Post(':taskId/members')
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
  @Roles(ProjectRole.OWNER, ProjectRole.MANAGER)
  @Delete(':taskId/members/:userId')
  async removeUserFromTask(
    @Param('taskId') taskId: string,
    @Param('userId') userId: string
  ) {
    return this.taskMembersService.removeUserFromTask(taskId, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get users assigned to a task' })
  @ApiResponse({ status: 200, description: 'List of users assigned to task.' })
  @Get(':taskId/members')
  async getUsersAssignedToTask(@Param('taskId') taskId: string) {
    return this.taskMembersService.getUsersAssignedToTask(taskId);
  }
}
