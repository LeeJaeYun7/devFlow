export interface NaverSummaryDetail {
  currentPrice: number;
  marketCap: number;
  high52Week: number;
  low52Week: number;
  volume: number;
}
export interface NaverDefaultKeyStatistics {
  PER: number;
  EPS: number;
  sharesOutstanding: number;
}

export interface NaverFinancialData {
  returnOnEquity: number | null;
  totalCash: number;
}
