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
  earningsDate: Array<{
    raw: number;
    fmt: string;
  }>;
  earningsAverage: {
    raw: number;
    fmt: string;
  };
  earningsHigh: {
    raw: number;
    fmt: string;
  };
  earningsLow: {
    raw: number;
    fmt: string;
  };
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
  trend: Array<{
    period: string;
    endDate: string;
    growth: {
      raw: number;
      fmt: string;
    };
    earningsEstimate: {
      avg: {
        raw: number;
        fmt: string;
      };
    };
  }>;
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
    quarter: string;
    epsActual: {
      raw: number;
      fmt: string;
    };
    epsEstimate: {
      raw: number;
      fmt: string;
    };
  }>;
  maxAge: number;
}
