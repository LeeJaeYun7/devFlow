export class NaverStockTechnicalDto {
  ohlcvAndIndicators!: NaverStockHistoryItem[];
  currentPrice!: number;
  changePercent!: number;
  marketCap!: number;
  high52Week!: number;
  low52Week!: number;
}
