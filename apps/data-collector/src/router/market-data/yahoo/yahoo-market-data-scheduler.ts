import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import YahooFinance from 'yahoo-finance2';
import dayjs from 'dayjs';
import { YahooStockService } from './yahoo-market-data-service';
import { NasdaqStockSymbol } from '../../../module/mongo/model/nasdaq/models/nasdaq-stock-symbol.model';

@Injectable()
export class YahooMarketScheduler {
  private readonly logger = new Logger(YahooMarketScheduler.name);

  constructor(
    private readonly yahooStockService: YahooStockService,
    @InjectModel(NasdaqStockSymbol.name)
    private readonly stockSymbolModel: Model<NasdaqStockSymbol>
  ) {
    this.logger.log('YahooMarketScheduler initialized');
  }

  @Cron('30 6 * * 1-5') // 매주 월~금 오전 6시 30분
  public async updateYahooMarketData() {
    try {
      this.logger.log('Starting Yahoo market data update...');

      // MongoDB에서 심볼 목록 가져오기
      const symbols = await this.stockSymbolModel.find().select('symbol').lean();
      if (!symbols || symbols.length === 0) {
        this.logger.warn('No symbols found in database');
        return;
      }
      this.logger.log(`Found ${symbols.length} symbols in database`);

      for (const { symbol } of symbols) {
        try {
          this.logger.log(`Updating data for symbol: ${symbol}`);

          // 주식 정보 업데이트
          const infoData = await YahooFinance.quoteSummary(symbol, {
            modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData'],
          });
          if (!infoData || !infoData.summaryDetail) {
            this.logger.warn(`No data found for symbol ${symbol} in Yahoo Finance`);
            continue;
          }
          await this.yahooStockService.saveStockInfo(symbol, infoData);

          // 주가 히스토리 업데이트
          const historyData = await YahooFinance.chart(symbol, {
            period1: dayjs().subtract(3, 'month').toDate(),
            interval: '1d',
          });
          if (!historyData) {
            this.logger.warn(`No historical data found for symbol ${symbol} in Yahoo Finance`);
            continue;
          }
          await this.yahooStockService.saveStockHistory(symbol, historyData.quotes, '1d');

          // 분석 데이터 업데이트
          const analysisData = await YahooFinance.quoteSummary(symbol, {
            modules: ['earningsTrend', 'recommendationTrend', 'earningsHistory', 'earnings'],
          });
          if (!analysisData) {
            this.logger.warn(`No analysis data found for symbol ${symbol} in Yahoo Finance`);
            continue;
          }
          await this.yahooStockService.saveStockAnalysis(symbol, {
            recommendationTrend: analysisData.recommendationTrend,
            earnings: analysisData.earnings,
            earningsTrend: analysisData.earningsTrend,
            earningsHistory: analysisData.earningsHistory,
          });

          this.logger.log(`Successfully updated data for symbol: ${symbol}`);
          await new Promise((res) => setTimeout(res, 1000)); // API 제한을 피하기 위한 딜레이
        } catch (error: unknown) {
          if (error instanceof Error && error.message.includes('Quote not found')) {
            this.logger.warn(`Symbol ${symbol} not found in Yahoo Finance`);
          } else {
            this.logger.error(
              `Failed to update data for symbol ${symbol}: ${error instanceof Error ? error.message : String(error)}`
            );
          }
          continue;
        }
      }

      this.logger.log('Completed Yahoo market data update');
    } catch (error: unknown) {
      this.logger.error(
        `Failed to update Yahoo market data: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  @Cron('0 0,6,12,18 * * *') // 매일 6시간 단위로 실행: 00시, 06시, 12시, 18시
  public async updateYahooNews() {
    try {
      this.logger.log('Starting Yahoo news update...');

      // MongoDB에서 심볼 목록 가져오기
      const symbols = await this.stockSymbolModel.find().select('symbol').lean();
      if (!symbols || symbols.length === 0) {
        this.logger.warn('No symbols found in database');
        return;
      }
      this.logger.log(`Found ${symbols.length} symbols in database`);

      for (const { symbol } of symbols) {
        try {
          this.logger.log(`Updating news for symbol: ${symbol}`);

          // 뉴스 데이터 업데이트
          const result = await YahooFinance.search(symbol);
          if (!result) {
            this.logger.warn(`No search results found for symbol ${symbol} in Yahoo Finance`);
            continue;
          }

          const news = (result?.news ?? []).map((item) => ({
            title: item.title,
            content: item.link, // Yahoo Finance API는 content를 제공하지 않아 link를 대체값으로 사용
            relatedTickers: item.relatedTickers ?? [],
            pubDate: item.providerPublishTime.toISOString(),
          }));

          if (news.length === 0) {
            this.logger.warn(`No news found for symbol ${symbol} in Yahoo Finance`);
            continue;
          }

          // 뉴스 데이터 저장
          await this.yahooStockService.saveStockNews(symbol, news);

          this.logger.log(`Successfully updated news for symbol: ${symbol}`);
          await new Promise((res) => setTimeout(res, 1000)); // API 제한을 피하기 위한 딜레이
        } catch (error: unknown) {
          if (error instanceof Error && error.message.includes('Quote not found')) {
            this.logger.warn(`Symbol ${symbol} not found in Yahoo Finance`);
          } else {
            this.logger.error(
              `Failed to update news for symbol ${symbol}: ${error instanceof Error ? error.message : String(error)}`
            );
          }
          continue;
        }
      }

      this.logger.log('Completed Yahoo news update');
    } catch (error: unknown) {
      this.logger.error(`Failed to update Yahoo news: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
