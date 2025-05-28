import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NaverStockService } from './naver-market-data-service';
import { KoreaStockSymbol } from '../../../module/mongo/model/korea/models/korea-stock-symbol.model';
import puppeteer from 'puppeteer';

interface DailyData {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

@Injectable()
export class NaverMarketScheduler {
  private readonly logger = new Logger(NaverMarketScheduler.name);

  constructor(
    private readonly naverStockService: NaverStockService,
    @InjectModel(KoreaStockSymbol.name)
    private readonly stockSymbolModel: Model<KoreaStockSymbol>
  ) {}

  @Cron('30 17 * * 1-5')
  private async fetchNaverStockHistory(): Promise<void> {
    this.logger.log('Starting Naver technical data update...');

    // MongoDB에서 심볼 목록 가져오기
    const symbols = await this.stockSymbolModel.find().select('symbol').lean();
    this.logger.log(`Found ${symbols.length} symbols in database`);

    for (const { symbol } of symbols) {
      try {
        this.logger.log(`Updating naver stock history for symbol: ${symbol}`);
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        );

        try {
          const baseUrl = `https://finance.naver.com/item/sise_day.naver?code=${symbol}`;
          const dailyData: DailyData[] = [];

          // 최근 3개월치 약 9페이지
          for (let i = 1; i <= 9; i++) {
            const url = `${baseUrl}&page=${i}`;
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            const pageData = await page.evaluate(() => {
              const rows = Array.from(document.querySelectorAll('table.type2 tr'));
              const data: DailyData[] = [];

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

          // 중복 제거 (날짜 기준)
          const uniqueData = Array.from(new Map(dailyData.map((d) => [d.date, d])).values());

          if (uniqueData.length < 2) {
            throw new Error('Not enough data');
          }

          const ohlcvAndIndicators = uniqueData.reduce<
            Record<string, { open: number; high: number; low: number; close: number; volume: number }>
          >((acc, cur) => {
            acc[cur.date] = {
              open: cur.open,
              high: cur.high,
              low: cur.low,
              close: cur.close,
              volume: cur.volume,
            };
            return acc;
          }, {});

          // MongoDB에 저장
          await this.naverStockService.saveStockHistory(symbol, ohlcvAndIndicators, '1d');

          this.logger.log(`Successfully updated technical data for symbol: ${symbol}`);
        } catch (error: unknown) {
          this.logger.error(
            `Failed to update technical data for symbol ${symbol}: ${error instanceof Error ? error.message : String(error)}`
          );
        } finally {
          await browser.close();
        }
      } catch (error: unknown) {
        this.logger.error(
          `Failed to process symbol ${symbol}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    this.logger.log('Completed Naver stock history update');
  }

  @Cron('30 17 * * 1-5')
  private async fetchNaverStockInfo(): Promise<void> {
    this.logger.log('Starting Naver Stock Info update...');

    // MongoDB에서 심볼 목록 가져오기
    const symbols = await this.stockSymbolModel.find().select('symbol').lean();
    this.logger.log(`Found ${symbols.length} symbols in database`);

    for (const { symbol } of symbols) {
      try {
        this.logger.log(`Updating Naver Stock Info for symbol: ${symbol}`);
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
        );

        try {
          const fundamentalUrl = `https://finance.naver.com/item/sise.naver?code=${symbol}`;
          await page.goto(fundamentalUrl, { waitUntil: 'domcontentloaded' });

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

            const currentPrice = cleanText(document.querySelector('.no_today .blind')?.textContent ?? null);
            const per = getTextByThLabel('PER');
            const eps = getTextByThLabel('EPS');
            const marketCap = getTextByThLabel('시가총액');
            const high52Week = getTextByThLabel('52주 최고');
            const low52Week = getTextByThLabel('52주 최저');

            return {
              currentPrice: Number(currentPrice) || 0,
              PER: Number(per) || 0,
              EPS: Number(eps) || 0,
              marketCap: Number(marketCap) || 0,
              high52Week: Number(high52Week) || 0,
              low52Week: Number(low52Week) || 0,
            };
          });

          // MongoDB에 저장
          await this.naverStockService.saveStockInfo(symbol, {
            summaryDetail: {
              regularMarketOpen: fundamentalData.currentPrice,
              marketCap: fundamentalData.marketCap,
              fiftyTwoWeekHigh: fundamentalData.high52Week,
              fiftyTwoWeekLow: fundamentalData.low52Week,
            },
            defaultKeyStatistics: {
              trailingEps: fundamentalData.EPS,
            },
            financialData: {
              returnOnEquity: fundamentalData.PER ? 1 / Number(fundamentalData.PER) : null,
            },
          });

          this.logger.log(`Successfully updated naver stock info for symbol: ${symbol}`);
        } catch (error: unknown) {
          this.logger.error(
            `Failed to update naver stock info for symbol ${symbol}: ${error instanceof Error ? error.message : String(error)}`
          );
        } finally {
          await browser.close();
        }
      } catch (error: unknown) {
        this.logger.error(
          `Failed to process symbol ${symbol}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    this.logger.log('Completed Naver Stock Info update');
  }
}
