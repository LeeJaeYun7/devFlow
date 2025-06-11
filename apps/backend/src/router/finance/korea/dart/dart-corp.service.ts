import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DartCorpCode } from '../../../../module/mongo/model/korea/dart/models/dart-corp-code-model';
import { BaseConfigService } from '@lia/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { DartCompanyInfo } from '../../../../module/mongo/model/korea/dart/models/dart-company-info.model';

@Injectable()
export class DartCorpService implements OnModuleInit {
  private readonly logger = new Logger(DartCorpService.name);
  private readonly apiKey: string;

  constructor(
    @InjectModel(DartCorpCode.name)
    private readonly dartCorpCodeModel: Model<DartCorpCode>,
    @InjectModel(DartCompanyInfo.name)
    private readonly dartCompanyInfoModel: Model<DartCompanyInfo>,
    private readonly configService: BaseConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    const config = configService.getConfig();
    this.apiKey = config.dartApiKey;
    if (!this.apiKey) {
      throw new Error('DART_API_KEY is not set');
    }
  }

  /**
   * NestJS 애플리케이션 시작 시 매일 오전 11:50에 전체 기업 실적 조회 예약
   */
  async onModuleInit() {
    const targetDate = new Date();
    targetDate.setHours(17, 3, 0, 0);

    const now = new Date();
    let delay = targetDate.getTime() - now.getTime();

    if (delay <= 0) {
      targetDate.setDate(targetDate.getDate() + 1);
      delay = targetDate.getTime() - now.getTime();
    }

    this.logger.log(`전체 기업 실적 조회 예약됨: ${targetDate}`);

    const timeout = setTimeout(async () => {
      try {
        await this.fetchAllQuarterlyFinancials(2015, 2025);
        this.logger.log(`전체 기업 실적 조회 완료`);
      } catch (error) {
        this.logger.error(`전체 기업 실적 조회 실패: ${error.message}`);
      }

      // 다음날 예약 반복
      this.onModuleInit();
    }, delay);

    this.schedulerRegistry.addTimeout('allQuarterlyFinancials', timeout);
  }

  /**
   * stockCode가 6자리인 기업들을 순회하며 분기별 실적을 조회
   * @param startYear
   * @param endYear
   */
  async fetchAllQuarterlyFinancials(startYear: number, endYear: number) {
    try {
      // stockCode가 6자리인 기업만 필터링
      const companies = await this.dartCorpCodeModel.find({
        stockCode: { $regex: /^\d{6}$/ }
      });

      this.logger.log(`총 ${companies.length}개의 기업 실적을 가져옵니다.`);

      for (const company of companies) {
        const { stockCode } = company;
        if (!stockCode) {
          continue;
        }

        this.logger.log(`기업 [${company.corpName}] (${stockCode}) 실적 가져오기 시작`);
        try {
          await this.getQuarterlyFinancials(stockCode, startYear, endYear);
          this.logger.log(`기업 [${company.corpName}] (${stockCode}) 실적 가져오기 완료`);
        } catch (error) {
          this.logger.error(
            `기업 [${company.corpName}] (${stockCode}) 실적 가져오기 실패: ${error.message}`
          );
        }
      }

      this.logger.log(`모든 기업 실적 가져오기 완료`);
    } catch (error) {
      this.logger.error(`전체 실적 가져오기 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * stockCode로 기업코드를 조회 후 분기별 실적 조회
   * @param stockCode
   * @param startYear
   * @param endYear
   */
  async getQuarterlyFinancials(stockCode: string, startYear: number, endYear: number) {
    try {
      const corp = await this.dartCorpCodeModel.findOne({ stockCode });
      if (!corp) {
        this.logger.warn(`stockCode ${stockCode}에 해당하는 기업을 찾을 수 없습니다.`);
        return;
      }

      const corpCode = corp.corpCode;

      for (let year = startYear; year <= endYear; year++) {
        const reprtCodes = ['11013', '11012', '11014', '11011']; // 1Q, 반기, 3Q, 사업보고서
        for (const reprtCode of reprtCodes) {
           await new Promise((resolve) => setTimeout(resolve, 2000));
           
           const response = await axios.get(
            `https://opendart.fss.or.kr/api/fnlttSinglAcntAll.json`,         {
              params: {
                crtfc_key: this.apiKey,
                corp_code: corpCode,
                bsns_year: year.toString(),
                reprt_code: reprtCode,
                fs_div: 'C', // 연결재무제표
              },
            }
          );

          if (response.data.status !== '000') {
            this.logger.warn(
              `DART API 호출 실패 (Year: ${year}, ReprtCode: ${reprtCode}): ${response.data.message}`
            );
            continue;
          }

          // MongoDB에 저장
          await this.dartCompanyInfoModel.updateOne(
            { corpCode, bsnsYear: year, reprtCode },
            {
              corpCode,
              stockCode,
              bsnsYear: year,
              reprtCode,
              financials: response.data.list,
              updatedAt: new Date(),
            },
            { upsert: true }
          );

          this.logger.log(
            `${corp.corpName} ${year}년 ${reprtCode} 분기실적 저장 완료 (건수: ${response.data.list?.length ?? 0})`
          );
     }
    } catch (error: unknown) {
      this.logger.error(`분기별 실적 조회 실패: ${error.message}`);
      throw error;
    }
  }
}
