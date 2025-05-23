export const DailyMetricMap = {
  dau: 'DAU',
  nru: 'NRU',
  message: 'MESSAGE',
  d1Retention: 'D1_RETENTION',
  d7Retention: 'D7_RETENTION',
  totalUser: 'TOTAL_USER',
} as const;

export const DailyMetricList = Object.values(DailyMetricMap);
export type DailyMetric = (typeof DailyMetricList)[number];

export const TotalMetricMap = {
  totalUser: 'TOTAL_USER',
  totalMessage: 'TOTAL_MESSAGE',
} as const;

export const TotalMetricList = Object.values(TotalMetricMap);
export type TotalMetric = (typeof TotalMetricList)[number];
