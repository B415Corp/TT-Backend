import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();

      // Check if responseBody is an object
      if (typeof responseBody === 'object' && responseBody !== null) {
        message = (responseBody as any).message || 'An error occurred';
      } else {
        message = responseBody as string; // If it's a string, use it directly
      }
    } else if (exception instanceof Error) {
      // Handle specific error types here
      if (exception.message.includes('invalid input syntax for type uuid')) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid UUID format provided.';
      }
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
} 