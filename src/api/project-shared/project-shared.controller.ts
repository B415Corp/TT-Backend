import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
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

@ApiTags('project-shared')
@Controller('projects')
export class ProjectMembersController {
  constructor(private readonly projectMembersService: ProjectSharedService) { }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get project members by approval status' })
  @ApiResponse({ status: 200, type: [ProjectMember] })
  @UseGuards(JwtAuthGuard)
  @Get(':id/shared')
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
  @Get(':id/shared/:userId/role')
  async getUserRole(
    @Param('id') projectId: string,
    @Param('userId') userId: string
  ) {
    return this.projectMembersService.getUserRoleInProject(projectId, userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign role to a user in a project' })
  @ApiResponse({ status: 200, type: ProjectMember })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles([ProjectRole.OWNER, ProjectRole.MANAGER], 'project')
  @Post(':id/shared')
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
  @Post(':id/shared/approve')
  async approveMember(
    @Param('id') projectId: string,
    @GetUser() user: User
  ): Promise<ProjectMember> {
    return this.projectMembersService.approveMember(projectId, user.user_id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change role on project' })
  @ApiResponse({ status: 200, type: ProjectMember })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles([ProjectRole.OWNER, ProjectRole.MANAGER], 'project')
  @Patch(':id/shared')
  async patchRole(
    @Param('id') projectId: string,
    @Body() assignRoleDto: PatchRoleDto,
    // @GetUser() user: User
  ) {
    return this.projectMembersService.patchSharedRole(
      projectId,
      assignRoleDto.role,
      assignRoleDto.user_id,
    );
  }
}
