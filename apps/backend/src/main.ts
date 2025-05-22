/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import 'source-map-support/register';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { JWT_SECRET } from './constants/jwt.constant';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const isProd = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || 4600;

  app.use(cookieParser(JWT_SECRET));
  app.enableCors({
    origin: isProd ? 'https://asklia.io' : 'http://localhost:4500',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('LIA API')
      .setDescription('LIA API description')
      .setVersion('1.0')
      .addTag('lia')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/docs', app, document);
  }

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
  logger.log(`🚀 Swagger is running on: http://localhost:${port}/api/docs`);
}

bootstrap();
