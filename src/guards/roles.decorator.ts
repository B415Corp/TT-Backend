import { SetMetadata } from '@nestjs/common';
import { ProjectRole } from '../common/enums/project-role.enum';

export const Roles = (...roles: ProjectRole[]) => SetMetadata('roles', roles); 