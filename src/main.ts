import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as process from 'node:process';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  logger.log('Application is starting...');

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: '*', // This allows all domains to access your resources
  });

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      tryItOutEnabled: true,
      tagsSorter: 'alpha',
      operationsSorter: (a, b) => {
        const methodsOrder = [
          'get',
          'post',
          'put',
          'delete',
          'patch',
          'options',
          'head',
        ];
        let result =
          methodsOrder.indexOf(a.get('method')) -
          methodsOrder.indexOf(b.get('method'));

        if (result === 0) {
          result = a.get('path').localeCompare(b.get('path'));
        }

        return result;
      },
    },
  });

  const currencyConfig = new DocumentBuilder()
    .setTitle('Currency API')
    .setDescription('API documentation for currency management')
    .setVersion('1.0')
    .build();
  const currencyDocument = SwaggerModule.createDocument(app, currencyConfig);
  SwaggerModule.setup('currency-api', app, currencyDocument);

  const port = process.env.PORT || 3000; // Use the port from the environment variable or default to 3000
  await app.listen(port);

  // Log the host and port information
  const host = process.env.HOST || 'localhost'; // Default to localhost if HOST is not set
  console.log(`Server is running on http://${host}:${port}`);
}

bootstrap();
