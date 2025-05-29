import { Injectable } from '@nestjs/common';
import { NaverStockTechnicalDto } from './dto/technical-data.dto';
import { NaverStockFundamentalDto } from './dto/fundamental-data.dto';
import { NaverStockService } from './naver-stock.service';

@Injectable()
export class NaverFinanceService {
  constructor(private readonly naverStockService: NaverStockService) {}

  public getTechnicalData = async (symbol: string): Promise<NaverStockTechnicalDto> => {
    const stockHistory = await this.naverStockService.getStockHistory(symbol);

    const technicalData: NaverStockTechnicalDto = {
      ohlcvAndIndicators: 
        stockHistory?.data?.reduce(
          (acc, cur) => {
            acc[cur.date] = {
              open: cur.open,
              high: cur.high,
              low: cur.low,
              close: cur.close,
              volume: cur.volume,
            };
            return acc;
          },
          {} as Record<string, { open: number; high: number; low: number; close: number; volume: number }>
        ) ?? {},
      currentPrice: stockHistory?.data?.[0]?.close ?? 0,
      changePercent: 
        stockHistory?.data?.[0] && stockHistory?.data?.[1]
          ? ((stockHistory.data[0].close - stockHistory.data[1].close) / stockHistory.data[1].close) * 100
          : 0,
      marketCap: stockHistory?.marketCap ?? 0,
      high52Week: stockHistory?.high52Week ?? 0,
      low52Week: stockHistory?.low52Week ?? 0,
    };

    return technicalData;
  };

  public getFundamentalData = async (symbol: string): Promise<NaverStockFundamentalDto> => {
    const stockInfo = await this.naverStockService.getStockInfo(symbol);

    const fundamentalData: NaverStockFundamentalDto = {
      currentPrice: stockInfo?.summaryDetail?.regularMarketOpen ?? 0,
      PER: stockInfo?.summaryDetail?.forwardPE ?? 0,
      EPS: stockInfo?.defaultKeyStatistics?.trailingEps ?? 0,
      VOLUME: stockInfo?.summaryDetail?.regularMarketVolume ?? 0,
      marketCap: stockInfo?.summaryDetail?.marketCap ?? 0,
      sharesOutstanding: stockInfo?.defaultKeyStatistics?.sharesOutstanding ?? 0,
      capital: stockInfo?.financialData?.totalCash ?? 0,
    };

    return fundamentalData;
  };
}
