import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import { KoreaStockNews } from '../../../../module/mongo/model/korea/models/korea-stock-news.model';
import { KoreaStockFundamentals } from '../../../../module/mongo/model/korea/models/korea-stock-fundamentals.model';
import { KoreaStockDartFinancials } from '../../../../module/mongo/model/korea/models/korea-stock-dart-financials.model';

@Injectable()
export class KoreaStockFetcherService {
  private readonly logger = new Logger(KoreaStockFetcherService.name);

  constructor(
    @InjectModel(KoreaStockNews.name) private readonly stockNewsModel: Model<KoreaStockNews>,
    @InjectModel(KoreaStockFundamentals.name) private readonly stockFundamentalsModel: Model<KoreaStockFundamentals>,
    @InjectModel(KoreaStockDartFinancials.name) private readonly stockDartFinancialsModel: Model<KoreaStockDartFinancials>
  ) {}

  public async fetchFundamentals(symbol: string): Promise<any> {
    const cached = await this.stockFundamentalsModel.findOne({ symbol });
    if (cached) return cached.data;

    try {
      const url = `https://finance.naver.com/item/main.naver?code=${symbol}`;
      const { data: html } = await axios.get(url);
      const $ = cheerio.load(html);

      const extract = (sel: string) => $(sel).first().text().trim().replace(/,/g, '');

      const result = {
        currentPrice: extract('.no_today .blind'),
        PER: extract('em[data-reactid*="PER"]'),
        PBR: extract('em[data-reactid*="PBR"]'),
        ROE: extract('em[data-reactid*="ROE"]'),
        marketCap: extract('em[data-reactid*="시가총액"]'),
      };

      await this.stockFundamentalsModel.updateOne({ symbol }, { symbol, data: result }, { upsert: true });

      return result;
    } catch (error: any) {
      this.logger.error(`Error fetching fundamentals for ${symbol}: ${error.message}`);
      return {};
    }
  }

  public async fetchNews(symbol: string): Promise<any[]> {
    const cached = await this.stockNewsModel.findOne({ symbol });
    if (cached) return cached.articles;

    try {
      const url = `https://finance.naver.com/item/news_news.naver?code=${symbol}&page=1&sm=title_entity_id.basic&clusterId=`;
      const { data: html } = await axios.get(url);
      const $ = cheerio.load(html);

      const news: any[] = [];
      $('table.type5 tr').each((_, el) => {
        const title = $(el).find('a').text().trim();
        const link = 'https://finance.naver.com' + $(el).find('a').attr('href');
        const date = $(el).find('td.date').text().trim();
        if (title && link) news.push({ title, link, date });
      });

      await this.stockNewsModel.updateOne({ symbol }, { symbol, articles: news }, { upsert: true });

      return news;
    } catch (error: any) {
      this.logger.error(`Error fetching news for ${symbol}: ${error.message}`);
      return [];
    }
  }

  public async fetchDartFinancials(symbol: string, corpCode: string): Promise<any> {
    const cached = await this.stockDartFinancialsModel.findOne({ symbol });
    if (cached) return cached.data;

    const apiKey = process.env.DART_API_KEY;
    const year = dayjs().year() - 1;

    try {
      const url = `https://opendart.fss.or.kr/api/fnlttSinglAcnt.json?crtfc_key=${apiKey}&corp_code=${corpCode}&bsns_year=${year}&reprt_code=11011`;
      const { data } = await axios.get(url);

      if (data.status !== '013') {
        const result = data.list.reduce((acc: any, item: any) => {
          acc[item.account_nm] = item.thstrm_amount;
          return acc;
        }, {});

        await this.stockDartFinancialsModel.updateOne({ symbol }, { symbol, data: result }, { upsert: true });

        return result;
      }

      return {};
    } catch (error: any) {
      this.logger.error(`Error fetching DART data for ${symbol}: ${error.message}`);
      return {};
    }
  }

  public async fetchKrxListedCompanies(): Promise<any[]> {
    try {
      const { data } = await axios.post('https://kind.krx.co.kr/corpgeneral/corpList.do?method=download', null, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
      return data;
    } catch (error: any) {
      this.logger.error(`Error fetching KRX list: ${error.message}`);
      return [];
    }
  }
}
