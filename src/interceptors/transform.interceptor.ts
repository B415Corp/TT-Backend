import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResponse } from '../common/pagination/paginated-response.interface';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (this.isPaginatedResponse(data)) {
          // Если это пагинированный ответ, сохраняем структуру
          return {
            data: data.data,
            meta: data.meta,
          };
        }
        // Если это не пагинированный ответ, оборачиваем его в { data }
        return { data };
      })
    );
  }

  private isPaginatedResponse(data: any): data is PaginatedResponse<any> {
    return (
      data &&
      'data' in data &&
      'meta' in data &&
      'total' in data.meta &&
      'page' in data.meta &&
      'limit' in data.meta &&
      'totalPages' in data.meta
    );
  }
}
