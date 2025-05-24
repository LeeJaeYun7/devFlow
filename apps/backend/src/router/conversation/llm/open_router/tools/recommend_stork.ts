import yahooFinance from 'yahoo-finance2';
import { RSI, SMA } from 'trading-signals';

interface RecommendStockResult {
  timestamp: string;
  ticker: string;
  marketCap: number;
  rsi: number;
  deviation: number;
  volumeChange: number;
  rsiChange: string;
  obvChange: string;
  strategyA: boolean;
  strategyB: boolean;
  strategyC: boolean;
  strategyD: boolean;
  strategyE: boolean;
  strategyF: boolean;
  strategyG: boolean;
  strategyH: boolean;
  strategyI: boolean;
}

// OBV 계산 함수
function calculateOBV(closes: number[], volumes: number[]): number[] {
  const obv: number[] = [0]; // 첫 번째 값은 0으로 시작

  for (let i = 1; i < closes.length; i++) {
    const prevClose = closes[i - 1];
    const currClose = closes[i];
    const currVolume = volumes[i];

    if (currClose > prevClose) {
      // 상승: 거래량을 더함
      obv[i] = obv[i - 1] + currVolume;
    } else if (currClose < prevClose) {
      // 하락: 거래량을 뺌
      obv[i] = obv[i - 1] - currVolume;
    } else {
      // 보합: 변화 없음
      obv[i] = obv[i - 1];
    }
  }

  return obv;
}

// 볼린저 밴드 계산 함수
function calculateBollingerBands(
  closes: number[],
  period = 20,
  multiplier = 2
): {
  upper: number[];
  middle: number[];
  lower: number[];
} {
  const upper: number[] = [];
  const middle: number[] = [];
  const lower: number[] = [];

  for (let i = period - 1; i < closes.length; i++) {
    const slice = closes.slice(i - period + 1, i + 1);
    const sma = slice.reduce((a, b) => a + b, 0) / period;
    const squaredDiffs = slice.map((x) => Math.pow(x - sma, 2));
    const standardDeviation = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / period);

    middle.push(sma);
    upper.push(sma + multiplier * standardDeviation);
    lower.push(sma - multiplier * standardDeviation);
  }

  // 시작 부분을 NaN으로 채움
  const padding = Array(period - 1).fill(NaN);
  return {
    upper: [...padding, ...upper],
    middle: [...padding, ...middle],
    lower: [...padding, ...lower],
  };
}

export async function recommendStock(ticker: string): Promise<RecommendStockResult | null> {
  try {
    // Yahoo Finance에서 데이터 가져오기
    const data = await yahooFinance.quote(ticker);
    const historicalData = await yahooFinance.historical(ticker, {
      period1: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3개월
      interval: '1d',
    });

    if (!historicalData || historicalData.length < 20) {
      console.warn(`${ticker} - 데이터 부족으로 스킵`);
      return null;
    }

    // 기술 지표 계산
    const closes = historicalData.map((d) => +d.close);
    const opens = historicalData.map((d) => +d.open);
    const volumes = historicalData.map((d) => +d.volume);

    // RSI 계산 - 현재값과 이전값을 따로 계산
    const rsiNowCalculator = new RSI(14);
    const rsiPrevCalculator = new RSI(14);

    // 현재 RSI 계산 (전체 데이터)
    rsiNowCalculator.updates(closes);

    // 이전 RSI 계산 (마지막 값을 제외한 데이터)
    rsiPrevCalculator.updates(closes.slice(0, -1));

    // OBV 계산 - 현재값과 이전값을 따로 계산
    const obvValues = calculateOBV(closes, volumes);
    const obvNow = obvValues[obvValues.length - 1];
    const obvPrev = obvValues[obvValues.length - 2];

    // 볼린저 밴드 계산
    const bb = calculateBollingerBands(closes);

    // SMA 계산
    const sma20 = new SMA(20);
    const sma60 = new SMA(60);
    sma20.updates(closes);
    sma60.updates(closes);

    // 결과가 준비되지 않은 경우 처리
    const rsiNowResult = rsiNowCalculator.getResult();
    const rsiPrevResult = rsiPrevCalculator.getResult();
    const sma20Result = sma20.getResult();
    const sma60Result = sma60.getResult();

    if (!rsiNowResult || !rsiPrevResult || !sma20Result || !sma60Result) {
      console.warn(`${ticker} - 지표 계산 결과가 준비되지 않음`);
      return null;
    }

    // 최근 데이터
    const closeNow = +closes[closes.length - 1];
    const openNow = +opens[opens.length - 1];
    const closePrev = +closes[closes.length - 2];
    const bbLowerPrev = bb.lower[bb.lower.length - 2];
    const ma20Value = +sma20Result.valueOf();
    const ma60Value = +sma60Result.valueOf();
    const rsiNow = +rsiNowResult.valueOf();
    const rsiPrev = +rsiPrevResult.valueOf();
    const volumeNow = +volumes[volumes.length - 1];
    const avgVol5d = +volumes.slice(-6, -1).reduce((a, b) => a + b, 0) / 5;

    // OBV 추세 계산을 위한 값들
    const obv1 = obvValues[obvValues.length - 2];
    const obv2 = obvValues[obvValues.length - 3];

    // 추가 계산
    const deviation = ((closeNow - ma20Value) / ma20Value) * 100;
    const volumeChange = ((volumeNow - avgVol5d) / avgVol5d) * 100;
    const marketCap = data?.marketCap ? +data.marketCap : 0;

    // 다이버전스 조건
    const isDivergence = closeNow < closePrev && rsiNow > rsiPrev;
    const isHiddenDivergence = closeNow > closePrev && rsiNow < rsiPrev;

    // 전략 계산
    const strategyA =
      closePrev < bbLowerPrev && closeNow > openNow && closeNow > closePrev && volumeNow > avgVol5d * 1.5;
    const strategyB =
      Math.abs(+closes[closes.length - 10] - closeNow) / +closes[closes.length - 10] < 0.03 &&
      rsiNow > rsiPrev &&
      closeNow > ma20Value &&
      closeNow > ma60Value &&
      obv2 < obv1 &&
      obv1 < obvNow;
    const strategyC =
      +closes[closes.length - 4] > +closes[closes.length - 3] &&
      +closes[closes.length - 3] > +closes[closes.length - 2] &&
      closeNow > openNow &&
      volumeNow > +volumes[volumes.length - 2] * 1.5 &&
      (closeNow - openNow) / openNow > 0.02;
    const strategyD =
      marketCap < 300_000_000 && 25 <= rsiNow && rsiNow <= 40 && deviation <= -8 && volumeChange <= -60 && isDivergence;
    const strategyE = marketCap < 1_000_000_000 && 40 <= rsiNow && rsiNow <= 60 && deviation < 3 && isHiddenDivergence;
    const strategyF = deviation < 1 && volumeChange > 50 && 45 < rsiNow && rsiNow < 65;
    const strategyG =
      Math.abs(closeNow - closePrev) / closePrev < 0.01 && obv2 < obv1 && obv1 < obvNow && volumeChange > 30;
    const strategyH =
      volumeNow > +volumes[volumes.length - 2] * 1.5 &&
      closeNow < openNow &&
      rsiNow < rsiPrev &&
      obv2 > obv1 &&
      obv1 > obvNow;
    const strategyI = rsiNow > 75 && deviation > 8 && closeNow < openNow && volumeNow > avgVol5d * 1.5;

    if (
      strategyA ||
      strategyB ||
      strategyC ||
      strategyD ||
      strategyE ||
      strategyF ||
      strategyG ||
      strategyH ||
      strategyI
    ) {
      return {
        timestamp: new Date().toISOString(),
        ticker,
        marketCap,
        rsi: +rsiNow.toFixed(2),
        deviation: +deviation.toFixed(2),
        volumeChange: +volumeChange.toFixed(2),
        rsiChange: `${rsiPrev.toFixed(2)} → ${rsiNow.toFixed(2)}`,
        obvChange: `${obvPrev.toFixed(2)} → ${obvNow.toFixed(2)}`,
        strategyA,
        strategyB,
        strategyC,
        strategyD,
        strategyE,
        strategyF,
        strategyG,
        strategyH,
        strategyI,
      };
    }

    return null;
  } catch (error) {
    console.error(`[${ticker}] 오류 발생:`, error);
    return null;
  }
}
