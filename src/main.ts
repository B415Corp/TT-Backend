import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as process from 'node:process';
import { TransformInterceptor } from './interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new TransformInterceptor());

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

  SwaggerModule.setup('api', app, document);

  const currencyConfig = new DocumentBuilder()
    .setTitle('Currency API')
    .setDescription('API documentation for currency management')
    .setVersion('1.0')
    .build();
  const currencyDocument = SwaggerModule.createDocument(app, currencyConfig);
  SwaggerModule.setup('currency-api', app, currencyDocument);

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
