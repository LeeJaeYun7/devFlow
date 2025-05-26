import { Module } from '@nestjs/common';
import { HealthCheckModule } from './router/health-check/health_check.module';
import { BaseConfigModule } from '@lia/config';

@Module({
  imports: [BaseConfigModule, HealthCheckModule],
})
export class AppModule {}
