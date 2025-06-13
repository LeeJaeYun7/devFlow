import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { BaseConfigService } from '@lia/config';
import { KisAuthService } from './kis.auth.service';
import { KisStockFundamentalDto } from './dto/kis-stock-fundamental.dto';
import { KisStockTechnicalDto } from './dto/kis-stock-technical.dto';
import { KisStockHistoryItem } from './dto/kis-stock-history.interface';

/**
 * 한국투자증권(KIS Developers) 시세·호가 API 래퍼 서비스
 *  - 실전투자 환경 기준 (모의투자는 baseUrl 및 tr_id 만 바꾸면 동일하게 동작)
 *  - 퍼포먼스를 위해 access-token 캐싱은 {@link KisAuthService} 에서 처리한다.
 */
@Injectable()
export class KisStockService {
  private readonly logger = new Logger(KisStockService.name);
  private readonly baseUrl: string;
  private readonly appKey: string;
  private readonly appSecret: string;

  constructor(
    private readonly http: HttpService,
    private readonly auth: KisAuthService,
    private readonly configService: BaseConfigService
  ) {
    const config = configService.getConfig();
    this.baseUrl = config.kisBaseUrl;
    this.appKey = config.kisAppKey;
    this.appSecret = config.kisAppSecret;

    if (!this.appKey || !this.appSecret) {
      throw new Error('[KIS] APP_KEY/APP_SECRET 가 설정되지 않았습니다.');
    }
  }

  /**
   * 현재가 + PER/EPS/시가총액 등 기본 지표 조회
   * @param symbol 6자리 종목코드 (ex: "005930")
   */
  async fetchFundamental(symbol: string): Promise<KisStockFundamentalDto | null> {
    if (!symbol) {
      this.logger.warn('Symbol is required');
      return null;
    }

    try {
      const token = await this.auth.getAccessToken();
      const url = `${this.baseUrl}/uapi/domestic-stock/v1/quotations/inquire-price`;

      const headers = this.buildHeaders('FHKST01010100', token);
      const params = {
        fid_cond_mrkt_div_code: 'J', // KRX 통합(코스피·코스닥)
        fid_input_iscd: symbol,
      } as const;

      const { data } = await firstValueFrom(this.http.get(url, { headers, params }));

      if (data.rt_cd !== '0') {
        this.logger.warn(`[${symbol}] KIS 현재가 호출 실패: ${data.msg1}`);
        return null;
      }

      const o = data.output;
      return {
        currentPrice: +o.stck_prpr,
        PER: +o.per,
        EPS: +o.eps,
        VOLUME: +o.acml_vol,
        marketCap: +o.hts_avls, // 원 단위
        sharesOutstanding: +o.lstn_stcn,
        capital: +o.basc_stck_cnt,
      };
    } catch (err) {
      this.logger.error(`[${symbol}] fetchFundamental 오류: ${err}`);
      return null;
    }
  }

  /**
   * 일자별 OHLCV + 52주 고저, 당일 변동률 계산
   * @param symbol 6자리 종목코드
   */
  async fetchTechnical(symbol: string): Promise<KisStockTechnicalDto | null> {
    if (!symbol) {
      this.logger.warn('Symbol is required');
      return null;
    }

    try {
      const token = await this.auth.getAccessToken();
      const url = `${this.baseUrl}/uapi/domestic-stock/v1/quotations/inquire-daily-price`;

      const headers = this.buildHeaders('FHKST01010400', token);
      const params = {
        fid_cond_mrkt_div_code: 'J',
        fid_input_iscd: symbol,
        fid_period_div_code: 'D', // D=일봉, W=주봉, M=월봉
        fid_org_adj_prc: '1', // 수정주가 반영
      } as const;

      const { data } = await firstValueFrom(this.http.get(url, { headers, params }));
      if (data.rt_cd !== '0' || !Array.isArray(data.output) || data.output.length < 2) {
        this.logger.warn(`[${symbol}] KIS 일자별 시세 조회 실패: ${data.msg1 ?? 'no data'}`);
        return null;
      }

      // output: 최신→과거 순 정렬
      const candles: KisStockHistoryItem[] = data.output.map((d: any) => ({
        date: d.stck_bsop_date, // YYYYMMDD
        open: +d.stck_oprc,
        high: +d.stck_hgpr,
        low: +d.stck_lwpr,
        close: +d.stck_clpr,
        volume: +d.acml_vol,
      }));

      const [today, prev] = candles;
      const changePercent = +(((today.close - prev.close) / prev.close) * 100).toFixed(2);

      // 일부 계좌권한에서 52주 데이터가 별도 output_52 배열에 포함
      const high52Week = +data.output_52?.[0]?.stck_hgpr || 0;
      const low52Week = +data.output_52?.[0]?.stck_lwpr || 0;

      return {
        ohlcvAndIndicators: candles,
        currentPrice: today.close,
        changePercent,
        high52Week,
        low52Week,
      };
    } catch (err) {
      this.logger.error(`[${symbol}] fetchTechnical 오류: ${err}`);
      return null;
    }
  }

  /**
   * 공통 헤더 빌더
   */
  private buildHeaders(trId: string, token: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
      appKey: this.appKey,
      appSecret: this.appSecret,
      tr_id: trId,
    };
  }
}
