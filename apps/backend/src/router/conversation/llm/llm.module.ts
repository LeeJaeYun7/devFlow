import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LlmService } from './llm.service';
import { YahooFinanceModule } from '../../finance/yahoo/yahoo-finance.module';
import { YahooFinanceService } from '../../finance/yahoo/yahoo-finance.service';

@Module({
  imports: [ConfigModule, YahooFinanceModule],
  providers: [
    {
      provide: LlmService,
      useFactory: (configService: ConfigService, yahooFinanceService: YahooFinanceService) => {
        return new LlmService(configService, yahooFinanceService);
      },
      inject: [ConfigService, YahooFinanceService],
    },
  ],
  exports: [LlmService],
})
export class LlmModule {}
