import {
  Body,
  Controller,
  Param,
  UseGuards,
  Post,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ProjectMembersService } from './project-members.service';
import { AssignRoleDto } from './dto/assign-role.dto';
import { ProjectMember } from '../../entities/project-member.entity';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from 'src/entities/user.entity';

@ApiTags('project-members')
@Controller('projects')
export class ProjectMembersController {
  constructor(private readonly projectMembersService: ProjectMembersService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign role to a user in a project' })
  @ApiResponse({ status: 200, type: ProjectMember })
  @UseGuards(JwtAuthGuard)
  @Post(':id/members')
  async assignRole(
    @Param('id') projectId: string,
    @Body() assignRoleDto: AssignRoleDto,
    @GetUser() user: User,
  ) {
    return this.projectMembersService.assignRole(
      projectId,
      assignRoleDto,
      user.user_id,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a user from a project' })
  @ApiResponse({ status: 204 })
  @UseGuards(JwtAuthGuard)
  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') projectId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    return this.projectMembersService.removeMember(projectId, userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a user invitation' })
  @ApiResponse({ status: 200, type: ProjectMember })
  @UseGuards(JwtAuthGuard)
  @Post(':id/members/:userId/approve')
  async approveMember(
    @Param('id') projectId: string,
    @Param('userId') userId: string,
  ): Promise<ProjectMember> {
    return this.projectMembersService.approveMember(projectId, userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get project members by approval status' })
  @ApiResponse({ status: 200, type: [ProjectMember] })
  @UseGuards(JwtAuthGuard)
  @Get(':id/members')
  async getMembers(
    @Param('id') projectId: string,
    @Query('approved') approved: boolean,
  ): Promise<ProjectMember[]> {
    return this.projectMembersService.getMembersByApprovalStatus(
      projectId,
      approved,
    );
  }
}
