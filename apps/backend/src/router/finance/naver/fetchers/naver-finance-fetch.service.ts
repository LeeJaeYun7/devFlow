import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { NaverStockTechnicalDto } from '../dto/technical-data.dto';
import { NaverStockFundamentalDto } from '../dto/fundamental-data.dto';
import { NaverStockHistoryItem } from '../../../../module/mongo/model/naver/interfaces/naver-stock-history-interface';

@Injectable()
export class NaverStockFetcherService {
  private readonly logger = new Logger(NaverStockFetcherService.name);

  public async fetchFundamentalData(symbol: string): Promise<NaverStockFundamentalDto | null> {
    if (!symbol) {
      this.logger.warn('Symbol is required');
      return null;
    }

    try {
      this.logger.debug(`[${symbol}] Launching Puppeteer...`);
      const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/usr/lib/chromium/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      this.logger.debug(`[${symbol}] Puppeteer launched.`);

      const page = await browser.newPage();
      this.logger.debug(`[${symbol}] New page created.`);

      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
      );
      this.logger.debug(`[${symbol}] User agent set.`);

      const fundamentalUrl = `https://finance.naver.com/item/sise.naver?code=${symbol}`;
      this.logger.debug(`[${symbol}] Navigating to URL: ${fundamentalUrl}`);
      const response = await page.goto(fundamentalUrl, { waitUntil: 'domcontentloaded' });
      this.logger.debug(`[${symbol}] Navigation completed.`);

      if (!response || response.status() === 404) {
        this.logger.warn(`Symbol ${symbol} not found in Naver Finance`);
        await browser.close();
        return null;
      }

      this.logger.debug(`[${symbol}] Evaluating page content...`);
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
      this.logger.debug(`[${symbol}] Page content evaluated.`);

      if (!fundamentalResult) {
        this.logger.warn(`No data found for symbol ${symbol} in Naver Finance`);
        await browser.close();
        return null;
      }

      await browser.close();
      this.logger.debug(`[${symbol}] Browser closed successfully.`);

      return {
        currentPrice: Number(fundamentalResult.currentPrice) || 0,
        PER: Number(fundamentalResult.PER) || 0,
        EPS: Number(fundamentalResult.EPS) || 0,
        VOLUME: Number(fundamentalResult.VOLUME) || 0,
        marketCap: this.parseMarketCap(fundamentalResult.marketCap) || 0,
        sharesOutstanding: Number(fundamentalResult.sharesOutstanding) || 0,
        capital: Number(fundamentalResult.capital) || 0,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching fundamental data for ${symbol}: ${error instanceof Error ? error.stack : String(error)}`
      );
      return null;
    }
  }

  public async fetchTechnicalData(symbol: string): Promise<NaverStockTechnicalDto | null> {
    if (!symbol) {
      this.logger.warn('Symbol is required');
      return null;
    }

    try {
      this.logger.debug(`[${symbol}] Launching Puppeteer...`);
      const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/usr/lib/chromium/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      this.logger.debug(`[${symbol}] Puppeteer launched.`);

      const page = await browser.newPage();
      this.logger.debug(`[${symbol}] New page created.`);

      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      );
      this.logger.debug(`[${symbol}] User agent set.`);

      const baseUrl = `https://finance.naver.com/item/sise_day.naver?code=${symbol}`;
      this.logger.debug(`[${symbol}] Navigating to URL: ${baseUrl}`);
      const response = await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
      this.logger.debug(`[${symbol}] Navigation completed.`);

      if (!response || response.status() === 404) {
        this.logger.warn(`Symbol ${symbol} not found in Naver Finance`);
        await browser.close();
        return null;
      }

      const dailyData: {
        date: string;
        close: number;
        open: number;
        high: number;
        low: number;
        volume: number;
      }[] = [];

      for (let i = 1; i <= 9; i++) {
        const url = `${baseUrl}&page=${i}`;
        this.logger.debug(`[${symbol}] Navigating to page ${i}: ${url}`);
        const pageResponse = await page.goto(url, { waitUntil: 'domcontentloaded' });
        this.logger.debug(`[${symbol}] Page ${i} navigation completed.`);

        if (!pageResponse || pageResponse.status() === 404) {
          this.logger.warn(`Page ${i} not found for symbol ${symbol} in Naver Finance`);
          break;
        }

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
        this.logger.debug(`[${symbol}] Page ${i} data evaluated.`);

        if (pageData.length === 0) {
          this.logger.warn(`No data found on page ${i} for symbol ${symbol}`);
          break;
        }

        dailyData.push(...pageData);
        await new Promise((res) => setTimeout(res, 300));
      }

      const uniqueData = Array.from(new Map(dailyData.map((d) => [d.date, d])).values());

      if (uniqueData.length < 2) {
        this.logger.warn(`Not enough data found for symbol ${symbol}`);
        await browser.close();
        return null;
      }

      const fundUrl = `https://finance.naver.com/item/sise.naver?code=${symbol}`;
      this.logger.debug(`[${symbol}] Navigating to fundamental URL: ${fundUrl}`);
      const fundResponse = await page.goto(fundUrl, { waitUntil: 'domcontentloaded' });
      this.logger.debug(`[${symbol}] Fundamental navigation completed.`);

      if (!fundResponse || fundResponse.status() === 404) {
        this.logger.warn(`Fundamental data not found for symbol ${symbol} in Naver Finance`);
        await browser.close();
        return null;
      }

      this.logger.debug(`[${symbol}] Evaluating fundamental data...`);
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
      this.logger.debug(`[${symbol}] Fundamental data evaluated.`);

      if (!fundamentalData) {
        this.logger.warn(`No fundamental data found for symbol ${symbol}`);
        await browser.close();
        return null;
      }

      const prices = uniqueData.map((d) => d.close);
      const ohlcvAndIndicators: NaverStockHistoryItem[] = uniqueData.map((d) => ({
        date: d.date,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        volume: d.volume,
      }));

      const currentPrice = prices[0];
      const previousPrice = prices[1];
      const changePercent = Number((((currentPrice - previousPrice) / previousPrice) * 100).toFixed(2));

      await browser.close();
      this.logger.debug(`[${symbol}] Browser closed successfully.`);

      return {
        ohlcvAndIndicators,
        currentPrice,
        changePercent,
        marketCap: this.parseMarketCap(fundamentalData.marketCap) || 0,
        high52Week: Number(fundamentalData.high52Week) || 0,
        low52Week: Number(fundamentalData.low52Week) || 0,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching technical data for ${symbol}: ${error instanceof Error ? error.stack : String(error)}`
      );
      return null;
    }
  }

  private parseMarketCap(value: string | number | undefined | null): number {
    if (!value) return 0;
    const stringValue = String(value);
    const matched = stringValue.match(/[\d,.]+/);
    if (!matched) return 0;
    const eokValue = Number(matched[0].replace(/,/g, ''));
    return eokValue * 100_000_000;
  }
}
