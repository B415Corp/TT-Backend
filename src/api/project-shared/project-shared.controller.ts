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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProjectRole } from 'src/common/enums/project-role.enum';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from 'src/entities/user.entity';
import { Roles } from 'src/guards/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ProjectMember } from '../../entities/project-shared.entity';
import { RoleGuard } from '../../guards/role.guard';
import { AssignRoleDto } from './dto/assign-role.dto';
import { PatchRoleDto } from './dto/patch-role.dto.js';
import { ProjectSharedService } from './project-shared.service';
import { ProjectWithMembersDto } from '../projects/dto/project-with-members.dto';

@ApiTags('project-shared')
@Controller('projects/shared')
export class ProjectMembersController {
  constructor(private readonly projectMembersService: ProjectSharedService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get projects with members' })
  @ApiResponse({ status: 200, type: [ProjectWithMembersDto] })
  @UseGuards(JwtAuthGuard)
  @Get('')
  async getProjectsWithMembers(
    @GetUser() user: User
  ): Promise<ProjectWithMembersDto[]> {
    return this.projectMembersService.findProjectsWithMembers(user.user_id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get projects with members' })
  @ApiResponse({ status: 200, type: [ProjectMember] })
  @UseGuards(JwtAuthGuard)
  @Get('invitations')
  async getInvitations(
    @GetUser() user: User
  ): Promise<ProjectMember[]> {
    return this.projectMembersService.getInvitations(user.user_id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get project members by approval status' })
  @ApiResponse({ status: 200, type: [ProjectMember] })
  @UseGuards(JwtAuthGuard)
  @Get(':project_id')
  async getMembers(
    @Param('project_id') projectId: string
  ): Promise<ProjectMember[]> {
    return this.projectMembersService.getMembersByApprovalStatus(projectId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get project members by approval status' })
  @ApiResponse({ status: 200, type: [ProjectMember] })
  @UseGuards(JwtAuthGuard)
  @Get('/friends-on-project/:project_id')
  async getFriendsOnProject(
    @GetUser() user: User,
    @Param('project_id') projectId: string
  ) {
    return this.projectMembersService.getFriendsOnProject(
      user.user_id,
      projectId
    );
  }

  // @ApiBearerAuth()
  // @UseGuards(RoleGuard)
  // @Get(':id/shared/:userId/role')
  // async getUserRole(
  //   @Param('id') projectId: string,
  //   @Param('userId') userId: string
  // ) {
  //   return this.projectMembersService.getUserRoleInProject(projectId, userId);
  // }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign role to a user in a project' })
  @ApiResponse({ status: 200, type: ProjectMember })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles([ProjectRole.OWNER, ProjectRole.MANAGER], 'project')
  @Post(':project_id')
  async assignRole(
    @Param('project_id') projectId: string,
    @Body() assignRoleDto: AssignRoleDto,
    @GetUser() user: User
  ) {
    return this.projectMembersService.assignRole(
      projectId,
      assignRoleDto,
      user.user_id
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a user invitation' })
  @ApiResponse({ status: 200, type: ProjectMember })
  @UseGuards(JwtAuthGuard)
  @Post(':project_id/approve-invitation')
  async approveMember(
    @Param('project_id') projectId: string,
    @GetUser() user: User
  ): Promise<ProjectMember> {
    return this.projectMembersService.approveMember(projectId, user.user_id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change role on project' })
  @ApiResponse({ status: 200, type: ProjectMember })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles([ProjectRole.OWNER, ProjectRole.MANAGER], 'project')
  @Patch(':project_id')
  async patchRole(
    @Param('project_id') projectId: string,
    @Body() assignRoleDto: PatchRoleDto
    // @GetUser() user: User
  ) {
    return this.projectMembersService.patchSharedRole(
      projectId,
      assignRoleDto.role,
      assignRoleDto.user_id
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user from a project' })
  @ApiResponse({ status: 200, type: ProjectMember })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles([ProjectRole.OWNER, ProjectRole.MANAGER], 'project')
  @Delete(':project_id/:user_id')
  async removeMember(
    @Param('project_id') project_id: string,
    @Param('user_id') user_id: string,
    @GetUser() user: User
  ) {
    return this.projectMembersService.removeMember(project_id, user_id, user.user_id);
  }
}
