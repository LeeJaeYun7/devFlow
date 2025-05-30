import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NasdaqSymbolService } from './nasdaq-symbol.service';

@Injectable()
export class NasdaqSymbolScheduler {
  private readonly logger = new Logger(NasdaqSymbolScheduler.name);

  constructor(private readonly nasdaqSymbolService: NasdaqSymbolService) {
    this.logger.log('NasdaqSymbolScheduler initialized');
  }

  @Cron('0 6 * * 1-5') // 월~금 오전 6시
  public async updateSymbols(): Promise<void> {
    try {
      this.logger.log('Starting Nasdaq symbols update...');
      await this.nasdaqSymbolService.fetchAndStoreTopSymbols();
      this.logger.log('Completed Nasdaq symbols update');
    } catch (error) {
      this.logger.error(`Failed to update Nasdaq symbols: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
