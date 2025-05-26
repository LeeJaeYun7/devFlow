import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { TechnicalResponse } from '../dto/technical-data.dto';
import { FundamentalResponse } from '../dto/fundamental-data.dto';

@Injectable()
export class NaverStockFetcherService {
  private readonly logger = new Logger(NaverStockFetcherService.name);

  public async fetchFundamentalData(symbol: string): Promise<FundamentalResponse> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
    );

    // 📌 1. 기본정보 페이지로 이동
    const fundamentalUrl = `https://finance.naver.com/item/sise.naver?code=${symbol}`;
    await page.goto(fundamentalUrl, { waitUntil: 'domcontentloaded' });

    const fundamentalResult = await page.evaluate(() => {
      const cleanText = (text: string | null) => text?.trim().replace(/,/g, '') ?? null;

      const getTextByThLabel = (label: string) => {
        const thElements = Array.from(document.querySelectorAll('th'));
        for (const th of thElements) {
          if (th.textContent?.includes(label)) {
            const td = th.nextElementSibling;
            return cleanText(td?.textContent ?? null);
          }
        }
        return null;
      };

      const currentPrice = cleanText(document.querySelector('.no_today .blind')?.textContent ?? null);
      const per = getTextByThLabel('PER');
      const eps = getTextByThLabel('EPS');
      const volume = getTextByThLabel('거래량');
      const marketCap = getTextByThLabel('시가총액');
      const sharesOutstanding = getTextByThLabel('상장주식수');
      const capital = getTextByThLabel('자본금');

      return {
        currentPrice,
        PER: per,
        EPS: eps,
        VOLUME: volume,
        marketCap,
        sharesOutstanding,
        capital,
      };
    });

    await browser.close();
    return fundamentalResult;
  }

  public async fetchTechnicalData(symbol: string): Promise<TechnicalResponse> {
    try {
      const baseUrl = `https://finance.naver.com/item/sise_day.naver?code=${symbol}`;
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      );

      const dailyData: {
        date: string;
        close: number;
        open: number;
        high: number;
        low: number;
        volume: number;
      }[] = [];

      // ✅ 1. 여러 페이지 순회 (예: 최근 3개월치 약 9페이지)
      for (let i = 1; i <= 9; i++) {
        const url = `${baseUrl}&page=${i}`;
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const pageData = await page.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('table.type2 tr'));
          const data: { date: string; close: number; open: number; high: number; low: number; volume: number }[] = [];

          rows.forEach((row) => {
            const tds = row.querySelectorAll('td');
            if (tds.length < 7) return;

            const date = tds[0].textContent?.trim() || '';
            const close = parseInt(tds[1].textContent?.replace(/,/g, '') || '0');
            const open = parseInt(tds[3].textContent?.replace(/,/g, '') || '0');
            const high = parseInt(tds[4].textContent?.replace(/,/g, '') || '0');
            const low = parseInt(tds[5].textContent?.replace(/,/g, '') || '0');
            const volume = parseInt(tds[6].textContent?.replace(/,/g, '') || '0');

            if (date && !isNaN(close)) {
              data.push({ date, close, open, high, low, volume });
            }
          });

          return data;
        });

        dailyData.push(...pageData);
        await new Promise((res) => setTimeout(res, 300)); // 서버 과부하 방지
      }

      // ✅ 중복 제거 (날짜 기준)
      const uniqueData = Array.from(new Map(dailyData.map((d) => [d.date, d])).values());

      if (uniqueData.length < 2) {
        await browser.close();
        throw new Error('Not enough data');
      }

      // ✅ 2. fundamental 정보 크롤링
      const fundUrl = `https://finance.naver.com/item/sise.naver?code=${symbol}`;
      await page.goto(fundUrl, { waitUntil: 'domcontentloaded' });

      const fundamentalData = await page.evaluate(() => {
        const cleanText = (text: string | null) => text?.trim().replace(/,/g, '') ?? null;

        const getTextByThLabel = (label: string) => {
          const thElements = Array.from(document.querySelectorAll('th'));
          for (const th of thElements) {
            if (th.textContent?.includes(label)) {
              const td = th.nextElementSibling;
              return cleanText(td?.textContent ?? null);
            }
          }
          return null;
        };

        return {
          marketCap: getTextByThLabel('시가총액'),
          high52Week: getTextByThLabel('52주 최고'),
          low52Week: getTextByThLabel('52주 최저'),
        };
      });

      await browser.close();

      const prices = uniqueData.map((d) => d.close);
      const ohlcvAndIndicators = uniqueData.reduce(
        (acc, cur) => {
          acc[cur.date] = {
            open: cur.open,
            high: cur.high,
            low: cur.low,
            close: cur.close,
            volume: cur.volume,
          };
          return acc;
        },
        {} as Record<string, any>
      );

      const currentPrice = prices[0];
      const previousPrice = prices[1];
      const changePercent = Number((((currentPrice - previousPrice) / previousPrice) * 100).toFixed(2));

      return {
        ohlcvAndIndicators,
        currentPrice,
        changePercent,
        marketCap: Number(fundamentalData.marketCap) || 0,
        high52Week: Number(fundamentalData.high52Week) || 0,
        low52Week: Number(fundamentalData.low52Week) || 0,
      };
    } catch (error: any) {
      this.logger.error(`Error fetching technical data for ${symbol}: ${error.message}`);
      return {
        ohlcvAndIndicators: {},
        currentPrice: 0,
        changePercent: 0,
        marketCap: 0,
        high52Week: 0,
        low52Week: 0,
      };
    }
  }
}
