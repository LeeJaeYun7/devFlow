export interface EarningsChart {
  quarterly: Array<{
    date: string;
    actual: number;
    estimate: number;
  }>;
  currentQuarterEstimate: number;
  currentQuarterEstimateDate: string;
  currentQuarterEstimateYear: number;
  earningsDate: Array<{
    raw: number;
    fmt: string;
  }>;
  isEarningsDateEstimate: boolean;
}

export interface FinancialsChart {
  yearly: Array<{
    date: number;
    revenue: number;
    earnings: number;
  }>;
  quarterly: Array<{
    date: string;
    revenue: number;
    earnings: number;
  }>;
}

export interface Earnings {
  maxAge: number;
  earningsChart: EarningsChart;
  financialsChart: FinancialsChart;
  financialCurrency: string;
}

export interface TrendItem {
  period: string;
  endDate: string;
  growth: number;
  earningsEstimate: {
    avg: number;
    low: number;
    high: number;
    yearAgoEps: number;
    numberOfAnalysts: number;
    growth: number;
  };
  revenueEstimate: {
    avg: number;
    low: number;
    high: number;
    yearAgoRevenue: number;
    numberOfAnalysts: number;
    growth: number;
  };
  epsTrend: {
    current: number;
    sevenDaysAgo: number;
    thirtyDaysAgo: number;
    sixtyDaysAgo: number;
    ninetyDaysAgo: number;
  };
  epsRevisions: {
    upLast7days: number;
    upLast30days: number;
    downLast7days: number;
    downLast30days: number;
  };
}

export interface EarningsTrend {
  trend: TrendItem[];
  maxAge: number;
}

export interface RecommendationTrend {
  trend: Array<{
    period: string;
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
    strongSell: number;
  }>;
  maxAge: number;
}

export interface EarningsHistory {
  history: Array<{
    maxAge: number;
    epsActual: number;
    epsEstimate: number;
    epsDifference: number;
    surprisePercent: number;
    quarter: string;
    period: string;
  }>;
  maxAge: number;
}
  