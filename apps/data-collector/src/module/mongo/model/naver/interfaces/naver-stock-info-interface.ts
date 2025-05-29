export interface NaverSummaryDetail {
  regularMarketOpen: number;
  marketCap: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  forwardPE: number;
  regularMarketVolume: number;
}

export interface NaverDefaultKeyStatistics {
  trailingEps: number;
  sharesOutstanding: number;
}

export interface NaverFinancialData {
  returnOnEquity: number | null;
  totalCash: number;
}
