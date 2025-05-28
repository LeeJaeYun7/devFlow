import { Module } from '@nestjs/common';
import { HealthCheckModule } from './router/health-check/health_check.module';
import { BaseConfigModule } from '@lia/config';
import { MarketDataModule } from './router/market-data/market-data-module';

@Module({
  imports: [BaseConfigModule, HealthCheckModule, MarketDataModule],
})
export class AppModule {}
