import { Module } from '@nestjs/common';
import { KisFinanceModule } from './kis/kis-finance.module';
import { DartFinanceModule } from './dart/dart-financial.module';

@Module({
  imports: [KisFinanceModule, DartFinanceModule],
  exports: [KisFinanceModule, DartFinanceModule],
})
export class KoreaFinanceModule {}
