import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginationQueryDto } from '../common/pagination/pagination-query.dto';
import { createPaginatedResponse } from '../common/pagination/create-paginated-response.util';

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { page = 1, limit = 10 } = request.query;
    const paginationQuery: PaginationQueryDto = {
      page: +page,
      limit: +limit,
    };

    request.paginationQuery = paginationQuery;

    return next.handle().pipe(
      map((data) => {
        if (
          Array.isArray(data) &&
          data.length === 2 &&
          typeof data[1] === 'number'
        ) {
          const [items, total] = data;
          return createPaginatedResponse(
            items,
            total,
            paginationQuery.page,
            paginationQuery.limit
          );
        }
        return data;
      })
    );
  }
}
