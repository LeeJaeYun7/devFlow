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
import { BaseConfigService } from '@lia/config';
import session from 'express-session';
import MongoStore from 'connect-mongo';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const baseConfigService = app.get(BaseConfigService);
  const config = baseConfigService.getConfig();
  const isProd = config.nodeEnv === 'production';
  const port = config.apiPort;

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({
    origin: isProd
      ? ['https://asklia.io', 'https://admin.asklia.io']
      : ['http://localhost:4500', 'http://localhost:4100'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const sessionTime = 60 * 60 * 24;
  const cookieTime = 7 * sessionTime;

  app.use(
    session({
      secret: JWT_SECRET,
      resave: false,
      saveUninitialized: false,
      rolling: false,
      store: MongoStore.create({
        mongoUrl: config.mongodbUri,
        collectionName: 'sessions',
        ttl: sessionTime,
      }),
      cookie: {
        maxAge: cookieTime * 1000,
        httpOnly: true,
      },
    })
  );

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
  logger.log(`🚀 API is running on: http://localhost:${port}/api`);
  logger.log(`🚀 Swagger is running on: http://localhost:${port}/api/docs`);
}

bootstrap();
