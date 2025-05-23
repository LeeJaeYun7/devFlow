export interface YahooDefaultKeyStatistics {
  maxAge: number;
  priceHint: number;
  enterpriseValue: number;
  forwardPE: number;
  profitMargins: number;
  floatShares: number;
  sharesOutstanding: number;
  sharesShort: number;
  sharesShortPriorMonth: Date;
  sharesShortPreviousMonthDate: Date;
  dateShortInterest: number;
  sharesPercentSharesOut: number;
  heldPercentInsiders: number;
  heldPercentInstitutions: number;
  shortRatio: number;
  shortPercentOfFloat: number;
  beta: number;
  impliedSharesOutstanding: number;
  category: string | null;
  bookValue: number;
  priceToBook: number;
  fundFamily: string | null;
  legalType: string | null;
  lastFiscalYearEnd: Date;
  nextFiscalYearEnd: Date;
} 

export interface YahooSummaryDetail {
  maxAge: number;
  priceHint: number;
  previousClose: number;
  open: number;
  dayLow: number;
  dayHigh: number;
  regularMarketPreviousClose: number;
  regularMarketOpen: number;
  regularMarketDayLow: number;
  regularMarketDayHigh: number;
  dividendRate: number;
  dividendYield: number;
  exDividendDate: Date;
  payoutRatio: number;
  fiveYearAvgDividendYield: number;
  beta: number;
  trailingPE: number;
  forwardPE: number;
  volume: number;
  regularMarketVolume: number;
  averageVolume: number;
  averageVolume10days: number;
  averageDailyVolume10Day: number;
  bid: number;
  ask: number;
}

export interface YahooFinancialData {
  maxAge: number;
  currentPrice: number;
  targetHighPrice: number;
  targetLowPrice: number;
  targetMeanPrice: number;
  targetMedianPrice: number;
  recommendationMean: number;
  recommendationKey: string;
  numberOfAnalystOpinions: number;
  totalCash: number;
  totalCashPerShare: number;
  ebitda: number;
  totalDebt: number;
  quickRatio: number;
  currentRatio: number;
  totalRevenue: number;
  debtToEquity: number;
  revenuePerShare: number;
  returnOnAssets: number;
  returnOnEquity: number;
  grossProfits: number;
  freeCashflow: number;
  operatingCashflow: number;
  earningsGrowth: number;
  revenueGrowth: number;
} 