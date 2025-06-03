import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NaverStockService } from './naver-market-data-service';
import puppeteer from 'puppeteer';
import { NaverStockFundamental } from '../../../module/mongo/model/naver/interfaces/naver-stock-fundamental.interface';
import { NaverStockHistoryItem } from '../../../module/mongo/model/naver/interfaces/naver-stock-history-interface';
@Injectable()
export class NaverMarketScheduler {
  private readonly logger = new Logger(NaverMarketScheduler.name);

  constructor(private readonly naverStockService: NaverStockService) {
    this.logger.log('NaverMarketScheduler initialized');
  }

  @Cron('30 17 * * 1-5')
  public async fetchNaverTechnicalData(): Promise<void> {
    this.logger.log('Starting Naver technical data update...');

    // MongoDB에서 심볼 목록 가져오기
    const symbols = await this.naverStockService.getStockSymbols();
    if (!symbols || symbols.length === 0) {
      this.logger.warn('No symbols found in database');
      return;
    }
    this.logger.log(`Found ${symbols.length} symbols in database`);

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/lib/chromium/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    );

    try {
      for (const { symbol } of symbols) {
        try {
          const baseUrl = `https://finance.naver.com/item/sise_day.naver?code=${symbol}`;
          const response = await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

          // 페이지가 존재하지 않는 경우
          if (!response || response.status() === 404) {
            this.logger.warn(`Symbol ${symbol} not found in Naver Finance`);
            continue;
          }

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
            const pageResponse = await page.goto(url, { waitUntil: 'domcontentloaded' });

            // 페이지가 존재하지 않는 경우
            if (!pageResponse || pageResponse.status() === 404) {
              this.logger.warn(`Page ${i} not found for symbol ${symbol} in Naver Finance`);
              break;
            }

            const pageData = await page.evaluate(() => {
              const rows = Array.from(document.querySelectorAll('table.type2 tr'));
              const data: { date: string; close: number; open: number; high: number; low: number; volume: number }[] =
                [];

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

            if (pageData.length === 0) {
              this.logger.warn(`No data found on page ${i} for symbol ${symbol}`);
              break;
            }

            dailyData.push(...pageData);
            await new Promise((res) => setTimeout(res, 300)); // 서버 과부하 방지
          }

          // ✅ 중복 제거 (날짜 기준)
          const uniqueData = Array.from(new Map(dailyData.map((d) => [d.date, d])).values());

          if (uniqueData.length < 2) {
            this.logger.warn(`Not enough data found for symbol ${symbol}`);
            continue;
          }

          // ✅ 2. fundamental 정보 크롤링
          const fundUrl = `https://finance.naver.com/item/sise.naver?code=${symbol}`;
          const fundResponse = await page.goto(fundUrl, { waitUntil: 'domcontentloaded' });

          // 페이지가 존재하지 않는 경우
          if (!fundResponse || fundResponse.status() === 404) {
            this.logger.warn(`Fundamental data not found for symbol ${symbol} in Naver Finance`);
            continue;
          }

          const fundamentalData: NaverStockFundamental = await page.evaluate(() => {
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

          if (!fundamentalData) {
            this.logger.warn(`No fundamental data found for symbol ${symbol}`);
            continue;
          }

          const ohlcvAndIndicators: NaverStockHistoryItem[] = uniqueData.map((d) => ({
            date: d.date,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
            volume: d.volume,
          }));

          await this.naverStockService.saveStockHistory(symbol, ohlcvAndIndicators, fundamentalData);

          // 서버 과부하 방지를 위한 딜레이
          await new Promise((res) => setTimeout(res, 300));
        } catch (error: any) {
          this.logger.error(`Error fetching technical data for ${symbol}: ${error.message}`);
        }
      }
    } finally {
      await browser.close();
    }
  }

  @Cron('30 17 * * 1-5')
  public async fetchNaverFundamentalData(): Promise<void> {
    this.logger.log('Starting Naver Stock Fundamental Data update...');

    // MongoDB에서 심볼 목록 가져오기
    const symbols = await this.naverStockService.getStockSymbols();
    if (!symbols || symbols.length === 0) {
      this.logger.warn('No symbols found in database');
      return;
    }
    this.logger.log(`Found ${symbols.length} symbols in database`);
  
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/lib/chromium/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
    );

    try {
      for (const { symbol } of symbols) {
        try {
          // 📌 1. 기본정보 페이지로 이동
          const fundamentalUrl = `https://finance.naver.com/item/sise.naver?code=${symbol}`;
          const response = await page.goto(fundamentalUrl, { waitUntil: 'domcontentloaded' });

          // 페이지가 존재하지 않는 경우
          if (!response || response.status() === 404) {
            this.logger.warn(`Symbol ${symbol} not found in Naver Finance`);
            continue;
          }

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
            const high52Week = getTextByThLabel('52주 최고');
            const low52Week = getTextByThLabel('52주 최저');

            return {
              currentPrice,
              PER: per,
              EPS: eps,
              VOLUME: volume,
              marketCap,
              sharesOutstanding,
              capital,
              high52Week,
              low52Week,
            };
          });

          // 데이터가 없는 경우
          if (!fundamentalResult) {
            this.logger.warn(`No fundamental data found for symbol ${symbol}`);
            continue;
          }

          // naverStockService를 통해 저장
          await this.naverStockService.saveStockInfo(symbol, {
            summaryDetail: {
              currentPrice: Number(fundamentalResult.currentPrice) || 0,
              marketCap: this.parseMarketCap(fundamentalResult.marketCap) || 0,
              high52Week: Number(fundamentalResult.high52Week) || 0,
              low52Week: Number(fundamentalResult.low52Week) || 0,
              volume: Number(fundamentalResult.VOLUME) || 0,
            },
            defaultKeyStatistics: {
              PER: Number(fundamentalResult.PER) || 0,
              EPS: Number(fundamentalResult.EPS) || 0,
              sharesOutstanding: Number(fundamentalResult.sharesOutstanding) || 0,
            },
            financialData: {
              returnOnEquity: null,
              totalCash: Number(fundamentalResult.capital) || 0,
            },
          });

          // 서버 과부하 방지를 위한 딜레이
          await new Promise((res) => setTimeout(res, 300));
        } catch (error: any) {
          this.logger.error(`Error fetching fundamental data for ${symbol}: ${error.message}`);
        }
      }
    } finally {
      await browser.close();
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
