import { SetMetadata, applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { ProjectRole } from '../common/enums/project-role.enum';

export const Roles = (...roles: ProjectRole[]) => {
  return applyDecorators(
    SetMetadata('roles', roles),
    ApiOperation({
      summary: 'Protected resource',
      description: `Required roles: ${roles.join(', ')}`,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized. JWT token is missing or invalid',
    }),
    ApiForbiddenResponse({
      description: `Forbidden. Required roles: ${roles.join(', ')}. Your role doesn't match the required roles.`,
    })
  );
};
