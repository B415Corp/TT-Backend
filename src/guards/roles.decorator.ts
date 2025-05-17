import { SetMetadata, applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { PROJECT_ROLE } from '../common/enums/project-role.enum';
import { GetUser } from '../decorators/get-user.decorator'; // Импортируем декоратор для получения пользователя

export const Roles = (roles: PROJECT_ROLE[], source: 'project' | 'task') => {
  return applyDecorators(
    SetMetadata('roles', roles),
    SetMetadata('source', source),
    ApiOperation({
      summary: 'Protected resource',
      description: `Required roles: ${roles.join(', ')}, source: ${source}`,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized. JWT token is missing or invalid',
    }),
    ApiForbiddenResponse({
      description: `Forbidden. Required roles: ${roles.join(
        ', '
      )}. Your role doesn't match the required roles.`,
    }),
    GetUser, // Добавляем возможность получать user_id из токена
    SetMetadata('user_id', GetUser) // Добавляем user_id в метаданные
  );
};
