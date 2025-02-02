import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ProjectMembersService } from './project-members.service';
import { AssignRoleDto } from './dto/assign-role.dto';
import { ProjectMember } from '../../entities/project-member.entity';

@ApiTags('project-members')
@Controller('projects/:project_id/members')
export class ProjectMembersController {
    constructor(private readonly projectMembersService: ProjectMembersService) {}

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Assign role to a user in a project' })
    @ApiResponse({ status: 200, type: ProjectMember })
    @UseGuards(JwtAuthGuard)
    @Patch('assign-role')
    async assignRole(
        @Param('project_id') projectId: string,
        @Body() assignRoleDto: AssignRoleDto,
    ) {
        return this.projectMembersService.assignRole(projectId, assignRoleDto);
    }
} 