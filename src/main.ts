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
  logger.log('ConfigService loaded');

  // Добавляем задержку для обеспечения полной загрузки конфигурации
  await new Promise(resolve => setTimeout(resolve, 100));

  logger.log(`NODE_ENV from process.env: ${process.env.NODE_ENV}`);
  logger.log(`NODE_ENV from ConfigService: ${configService.get('NODE_ENV')}`);

  const environment = process.env.NODE_ENV || configService.get('NODE_ENV') || 'development';
  logger.log(`Final environment: ${environment}`);

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: '*',
  });

  const environmentInfo = {
    environment: environment.toUpperCase(),
    databaseHost: configService.get('DB_HOST'),
    nodeEnv: process.env.NODE_ENV,
    configNodeEnv: configService.get('NODE_ENV'),
  };

  logger.log(`Environment Info: ${process.env.NODE_ENV}`);

  const config = new DocumentBuilder()
    .setTitle(`API ${JSON.stringify(environmentInfo)}`)
    .setDescription(`API description (Environment Info: ${JSON.stringify(environmentInfo)})
                     Raw NODE_ENV: ${process.env.NODE_ENV}
                     ConfigService NODE_ENV: ${configService.get('NODE_ENV')}
                     Final environment: ${environment}`)
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

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  const host = process.env.HOST || 'localhost';
  logger.log(`Server is running on http://${host}:${port}`);
  logger.log(`Environment: ${environment.toUpperCase()}`);
}

bootstrap();
