import { Injectable } from '@nestjs/common';
import { NaverStockTechnicalDto } from './dto/technical-data.dto';
import { NaverStockFundamentalDto } from './dto/fundamental-data.dto';
import { NaverStockService } from './naver-stock.service';

@Injectable()
export class NaverFinanceService {
  constructor(private readonly naverStockService: NaverStockService) {}

  public getTechnicalData = async (symbol: string): Promise<NaverStockTechnicalDto> => {
    console.log('naver get technical data', symbol);
    const stockHistory = await this.naverStockService.getStockHistory(symbol);

    if (!stockHistory?.data) {
      return {
        ohlcvAndIndicators: [],
        currentPrice: 0,
        changePercent: 0,
        marketCap: 0,
        high52Week: 0,
        low52Week: 0,
      };
    }

    const ohlcvMap = stockHistory.data;

    const sorted = stockHistory.data.sort((a, b) => (a.date < b.date ? 1 : -1)); // 내림차순 정렬
    const latest = sorted[0];
    const previous = sorted[1];

    const technicalData: NaverStockTechnicalDto = {
      ohlcvAndIndicators: ohlcvMap,
      currentPrice: latest?.close ?? 0,
      changePercent: latest && previous ? ((latest.close - previous.close) / previous.close) * 100 : 0,
      marketCap: stockHistory.marketCap ?? 0,
      high52Week: stockHistory.high52Week ?? 0,
      low52Week: stockHistory.low52Week ?? 0,
    };

    return technicalData;
  };

  public getFundamentalData = async (symbol: string): Promise<NaverStockFundamentalDto> => {
    console.log('naver get fundamental data', symbol);
    const stockInfo = await this.naverStockService.getStockInfo(symbol);

    console.log('naver get stockInfo', stockInfo);

    const fundamentalData: NaverStockFundamentalDto = {
      currentPrice: stockInfo?.summaryDetail?.currentPrice ?? 0,
      PER: stockInfo?.defaultKeyStatistics?.PER ?? 0,
      EPS: stockInfo?.defaultKeyStatistics?.EPS ?? 0,
      VOLUME: stockInfo?.summaryDetail?.volume ?? 0,
      marketCap: stockInfo?.summaryDetail?.marketCap ?? 0,
      sharesOutstanding: stockInfo?.defaultKeyStatistics?.sharesOutstanding ?? 0,
      capital: stockInfo?.financialData?.totalCash ?? 0,
    };

    return fundamentalData;
  };
}
