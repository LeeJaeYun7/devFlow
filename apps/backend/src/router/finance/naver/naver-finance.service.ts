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
      ohlcvAndIndicators: stockHistory?.data ?? [],
    };

    return technicalData;
  };

  public getFundamentalData = async (symbol: string): Promise<NaverStockFundamentalDto> => {
    const stockInfo = await this.naverStockService.getStockInfo(symbol);

    const fundamentalData: NaverStockFundamentalDto = {
      currentPrice: stockInfo?.summaryDetail?.regularMarketOpen ?? 0,
      roe: stockInfo?.financialData?.returnOnEquity ?? 0,
      eps: stockInfo?.defaultKeyStatistics?.trailingEps ?? 0,
      marketCap: stockInfo?.summaryDetail?.marketCap ?? 0,
      high52Week: stockInfo?.summaryDetail?.fiftyTwoWeekHigh ?? 0,
      low52Week: stockInfo?.summaryDetail?.fiftyTwoWeekLow ?? 0,
    };

    return fundamentalData;
  };
}
