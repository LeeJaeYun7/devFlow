import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { KisAuthService } from './kis.auth.service';
import { KisStockService } from './kis.stock.service';
import { BaseConfigModule } from '@lia/config';

@Module({
  imports: [HttpModule, BaseConfigModule],
  providers: [KisAuthService, KisStockService],
  exports: [KisStockService],
})
export class KisFinanceModule {}
