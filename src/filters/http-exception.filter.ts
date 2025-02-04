import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Логируем исходную ошибку
    this.logger.error('Exception:', exception);
    if (exception instanceof Error) {
      this.logger.error('Stack:', exception.stack);
    }

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();

      // Check if responseBody is an object
      if (typeof responseBody === 'object' && responseBody !== null) {
        message = (responseBody as any).message || 'An error occurred';
      } else {
        message = responseBody as string; // If it's a string, use it directly
      }
    } else if (exception instanceof TokenExpiredError) {
      status = HttpStatus.UNAUTHORIZED;
      message = 'Сессия истекла. Пожалуйста, войдите снова.';
    } else if (exception instanceof JsonWebTokenError) {
      status = HttpStatus.UNAUTHORIZED;
      message = 'Недействительный токен. Пожалуйста, войдите снова.';
    } else if (exception instanceof UnauthorizedException) {
      status = HttpStatus.UNAUTHORIZED;
      message = 'Необходима авторизация';
    } else if (exception instanceof Error) {
      // Handle specific error types here
      if (exception.message.includes('invalid input syntax for type uuid')) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Неверный формат UUID';
      }
    }

    // Логируем обработанную ошибку
    this.logger.error(`Status: ${status}, Message: ${message}`);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
