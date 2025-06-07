import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { DartFundamentalDto } from '../dto/dart-fundamental-data.dto';
import { BaseConfigService } from '@lia/config';

@Injectable()
export class DartStockFetcherService {
  private readonly logger = new Logger(DartStockFetcherService.name);
  private readonly apiUrl = 'https://opendart.fss.or.kr/api'; // DART API Endpoint
  private readonly apiKey: string;

  constructor(private readonly configService: BaseConfigService) {
    const config = configService.getConfig();
    this.apiKey = config.dartApiKey;
    if (!this.apiKey) {
      throw new Error('DART_API_KEY is not set');
    }
  }

  async fetchDartFundamental(corpCode: string): Promise<DartFundamentalDto> {
    try {
      const url = `${this.apiUrl}/fnlttSinglAcnt.json?crtfc_key=${this.apiKey}&corp_code=${corpCode}&bsns_year=2024&reprt_code=11011`;

      const response = await axios.get(url);
      const data = response.data;

      if (data.status !== '000') {
        this.logger.warn(`DART API Error: ${data.message}`);
        throw new Error(`DART API Error: ${data.message}`);
      }

      // 예시로 첫 번째 항목만 사용
      const financials = data.list[0];

      return {
        corpCode,
        corpName: financials.corp_name,
        financials,
      };
    } catch (error: any) {
      this.logger.error(`Failed to fetch fundamental data: ${error.message}`);
      throw error;
    }
  }
}
