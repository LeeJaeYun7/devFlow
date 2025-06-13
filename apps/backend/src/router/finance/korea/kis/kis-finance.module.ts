import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { KisAuthService } from './kis.auth.service';
import { KisStockService } from './kis.stock.service';
import { KisController } from './kis.controller';
import { BaseConfigModule } from '@lia/config';

@Module({
  imports: [HttpModule, BaseConfigModule],
  providers: [KisAuthService, KisStockService],
  controllers: [KisController],
  exports: [KisStockService],
})
export class KisFinanceModule {}
