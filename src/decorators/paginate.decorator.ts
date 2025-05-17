import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PaginationQueryDto } from '../common/pagination/pagination-query.dto';
import { createPaginatedResponse } from '../common/pagination/create-paginated-response.util';
import { ApiQuery } from '@nestjs/swagger';

export function Paginate(defaultLimit: number = 10) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Номер страницы',
    })(target, propertyKey, descriptor);
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Количество элементов на странице',
      example: defaultLimit,
    })(target, propertyKey, descriptor);

    descriptor.value = async function (...args: any[]) {
      let paginationQuery: PaginationQueryDto;

      // Найдем ExecutionContext в аргументах
      const ctx = args.find(
        (arg) =>
          arg && arg.switchToHttp && typeof arg.switchToHttp === 'function'
      );

      if (ctx) {
        const request = ctx.switchToHttp().getRequest();
        const { page = 1, limit = defaultLimit } = request.query;
        paginationQuery = {
          page: +page,
          limit: +limit,
        };
      } else {
        // Если ExecutionContext не найден, используем значения по умолчанию
        paginationQuery = { page: 1, limit: defaultLimit };
      }

      // Добавляем paginationQuery к аргументам метода
      const result = await originalMethod.apply(this, [
        ...args,
        paginationQuery,
      ]);

      if (Array.isArray(result)) {
        const [data, total] = result;
        return createPaginatedResponse(
          data,
          total,
          paginationQuery.page,
          paginationQuery.limit
        );
      }

      return result;
    };

    return descriptor;
  };
}

// Дополнительный декоратор для извлечения параметров пагинации
export const PaginationParams = createParamDecorator(
  (defaultLimit: number = 10, ctx: ExecutionContext): PaginationQueryDto => {
    const request = ctx.switchToHttp().getRequest();
    const { page = 1, limit = defaultLimit } = request.query;
    return {
      page: +page,
      limit: +limit,
    };
  }
);
