import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LlmService } from './llm.service';
import { YahooFinanceModule } from '../../finance/yahoo/yahoo-finance.module';
import { OpenRouterService } from './open_router/open_router.service';

@Module({
  imports: [ConfigModule, YahooFinanceModule],
  providers: [LlmService, OpenRouterService],
  exports: [LlmService],
})
export class LlmModule {}
