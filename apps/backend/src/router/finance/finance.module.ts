import { Module } from '@nestjs/common';
import { YahooFinanceFetcherService } from '../finance/fetchers/yahoo-finance-fetcher.service';
import { FinanceService } from './finance.service';

@Module({
  providers: [YahooFinanceFetcherService, FinanceService],
  exports: [YahooFinanceFetcherService, FinanceService],
})
export class FinanceModule {}