import { Body, Controller, Param, UseGuards, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
        @GetUser() user: User
    ) {
        return this.projectMembersService.assignRole(projectId, assignRoleDto, user.user_id);
    }

    // @Delete(':id')
    // async remove(@Param('id') id: string): Promise<void> {
    //     return this.projectMembersService.deleteProject(id);
    // }

    // @Get(':id/members')
    // @ApiResponse({ status: 200, type: ProjectMember })
    // async getProjectMembers(@Param('id') id: string): Promise<ProjectMember[]> {
    //     return this.projectMembersService.getProjectMembers(id);
    // }


} 