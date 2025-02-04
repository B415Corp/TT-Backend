import {
  Body,
  Controller,
  Param,
  UseGuards,
  Post,
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
import { ProjectSharedService } from './project-shared.service';
import { AssignRoleDto } from './dto/assign-role.dto';
import { ProjectMember } from '../../entities/project-shared.entity';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from 'src/entities/user.entity';
import { RoleGuard } from '../../guards/role.guard';
import { ProjectRole } from 'src/common/enums/project-role.enum';
import { Roles } from 'src/guards/roles.decorator';

@ApiTags('project-members')
@Controller('projects')
export class ProjectMembersController {
  constructor(private readonly projectMembersService: ProjectSharedService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign role to a user in a project' })
  @ApiResponse({ status: 200, type: ProjectMember })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(ProjectRole.OWNER, ProjectRole.MANAGER)
  @Post(':id/members')
  async assignRole(
    @Param('id') projectId: string,
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
  @Post(':id/members/approve')
  async approveMember(
    @Param('id') projectId: string,
    @GetUser() user: User
  ): Promise<ProjectMember> {
    return this.projectMembersService.approveMember(projectId, user.user_id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get project members by approval status' })
  @ApiResponse({ status: 200, type: [ProjectMember] })
  @UseGuards(JwtAuthGuard)
  @Get(':id/members')
  async getMembers(
    @Param('id') projectId: string,
    @Query('approved') approved: boolean | undefined // Changed to allow undefined
  ): Promise<ProjectMember[]> {
    return this.projectMembersService.getMembersByApprovalStatus(
      projectId,
      approved
    );
  }

  @ApiBearerAuth()
  @UseGuards(RoleGuard)
  @Get(':id/members/:userId/role')
  async getUserRole(
    @Param('id') projectId: string,
    @Param('userId') userId: string
  ) {
    return this.projectMembersService.getUserRoleInProject(projectId, userId);
  }
}
