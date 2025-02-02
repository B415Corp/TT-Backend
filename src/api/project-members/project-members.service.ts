import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectMember } from '../../entities/project-member.entity';
import { AssignRoleDto } from './dto/assign-role.dto';
import { ErrorMessages } from '../../common/error-messages';

@Injectable()
export class ProjectMembersService {
    constructor(
        @InjectRepository(ProjectMember)
        private projectMemberRepository: Repository<ProjectMember>,
    ) {}

    async assignRole(projectId: string, assignRoleDto: AssignRoleDto): Promise<ProjectMember> {
        const projectMember = await this.projectMemberRepository.findOne({
            where: { project_id: projectId, user_id: assignRoleDto.user_id },
        });

        if (!projectMember) {
            throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
        }

        projectMember.role = assignRoleDto.role;
        return this.projectMemberRepository.save(projectMember);
    }
} 