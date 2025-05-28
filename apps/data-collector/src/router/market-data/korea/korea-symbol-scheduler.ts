import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { KoreaSymbolService } from './korea-symbol.service';

@Injectable()
export class KoreaSymbolScheduler {
  private readonly logger = new Logger(KoreaSymbolScheduler.name);

  constructor(private readonly koreaSymbolService: KoreaSymbolService) {}

  @Cron('0 17 * * 1-5') // 오후 5시
  async updateKoreaSymbols() {
    try {
      this.logger.log('Starting Korea stock symbols update...');
      await this.koreaSymbolService.fetchAndStoreTopSymbols();
      this.logger.log('Completed Korea stock symbols update');
    } catch (error: unknown) {
      this.logger.error(
        `Failed to update Korea stock symbols: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }
} 