import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import puppeteer from 'puppeteer';
import { KoreaStockSymbol } from '../../../module/mongo/model/korea/models/korea-stock-symbol.model';

@Injectable()
export class KoreaSymbolService {
  private readonly logger = new Logger(KoreaSymbolService.name);

  constructor(
    @InjectModel(KoreaStockSymbol.name)
    private readonly stockSymbolModel: Model<KoreaStockSymbol>
  ) {}

  public async fetchAndStoreTopSymbols(): Promise<void> {
    
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/lib/chromium/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    const symbols = new Set<string>();

    try {
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      );

      // 코스피(0), 코스닥(1) 각각 페이지 순회
      for (const marketType of [0, 1]) {
        for (let pageNum = 1; pageNum <= 20; pageNum++) {
          const url = `https://finance.naver.com/sise/sise_market_sum.naver?sosok=${marketType}&page=${pageNum}`;
          await page.goto(url, { waitUntil: 'domcontentloaded' });
          await page.waitForSelector('table.type_2');

          const pageSymbols = await page.evaluate(() => {
            const anchors = Array.from(document.querySelectorAll('table.type_2 a[href*="item/main.naver?code="]'));
            return anchors
              .map((a) => {
                const href = a.getAttribute('href');
                const match = href?.match(/code=(\d+)/);
                return match ? match[1] : null;
              })
              .filter((code): code is string => !!code);
          });

          pageSymbols.forEach((symbol) => symbols.add(symbol));
          this.logger.log(`Page ${pageNum} (sosok=${marketType}): ${pageSymbols.length} symbols`);
          await new Promise((res) => setTimeout(res, 300));
        }
      }

      for (const symbol of symbols) {
        await this.stockSymbolModel.updateOne({ symbol }, { symbol }, { upsert: true });
      }

      this.logger.log(`✅ 총 ${symbols.size}개 한국 주식 symbol 저장 완료.`);
    } catch (err: unknown) {
      this.logger.error(`네이버 종목 수집 실패: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      await browser.close();
    }
  }
}
