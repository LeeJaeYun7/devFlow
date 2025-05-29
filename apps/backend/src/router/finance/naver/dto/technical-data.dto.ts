export class NaverStockTechnicalDto {
  ohlcvAndIndicators!: Record<
    string,
    {
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }
  >;
  currentPrice!: number;
  changePercent!: number;
  marketCap!: number;
  high52Week!: number;
  low52Week!: number;
}
