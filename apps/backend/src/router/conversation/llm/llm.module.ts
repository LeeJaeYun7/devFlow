import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LlmService } from './llm.service';
import { FinanceModule } from '../../finance/finance.module';
import { FinanceService } from '../../finance/finance.service';

@Module({
  imports: [ConfigModule, FinanceModule],
  providers: [
    {
      provide: LlmService,
      useFactory: (configService: ConfigService, financeService: FinanceService) => {
        return new LlmService(configService, financeService);
      },
      inject: [ConfigService, FinanceService],
    },
  ],
  exports: [LlmService],
})
export class LlmModule {}
