import 'source-map-support/register';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BaseConfigService } from '@lia/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const baseConfigService = app.get(BaseConfigService);
  const config = baseConfigService.getConfig();
  const port = config.dataCollectorPort;

  app.setGlobalPrefix('api');
  await app.listen(port);
  Logger.log(`🚀 Data Collector is running on: http://localhost:${port}/api`);
}

bootstrap();
