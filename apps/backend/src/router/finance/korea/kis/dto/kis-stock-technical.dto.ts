import { KisStockHistoryItem } from './kis-stock-history.interface';

export class KisStockTechnicalDto {
  ohlcvAndIndicators!: KisStockHistoryItem[];
  currentPrice!: number;
  changePercent!: number;
  high52Week!: number;
  low52Week!: number;
}