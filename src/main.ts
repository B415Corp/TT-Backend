import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as process from 'node:process';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  logger.log('Application is starting...');

  const configService = app.get(ConfigService);
  const environment = configService.get('NODE_ENV') || 'development';

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: '*', // This allows all domains to access your resources
  });

  const environmentInfo = {
    environment: environment.toUpperCase(),
    databaseHost: configService.get('DB_HOST'),
    // Add other relevant information, but be careful with sensitive data
  };

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription(`API description (Environment Info: ${JSON.stringify(environmentInfo)})`)
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

  const port = process.env.PORT || 3000; // Use the port from the environment variable or default to 3000
  await app.listen(port, '0.0.0.0');

  // Log the host and port information
  const host = process.env.HOST || 'localhost'; // Default to localhost if HOST is not set
  console.log(`Server is running on http://${host}:${port}`);
  console.log(`Environment: ${environment.toUpperCase()}`);
}

bootstrap();
