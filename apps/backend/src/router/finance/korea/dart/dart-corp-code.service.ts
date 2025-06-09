import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';
import * as xml2js from 'xml2js';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DartCorpCode } from '../../../../module/mongo/model/korea/dart/models/dart-corp-code-model';
import { BaseConfigService } from '@lia/config';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class DartCorpCodeService implements OnModuleInit {
  private readonly logger = new Logger(DartCorpCodeService.name);
  private readonly apiKey: string;
  private readonly downloadUrl: string;

  constructor(
    @InjectModel(DartCorpCode.name)
    private readonly dartCorpCodeModel: Model<DartCorpCode>,
    private readonly configService: BaseConfigService,
    private readonly schedulerRegistry: SchedulerRegistry, 
  ) {
    const config = configService.getConfig();
    this.apiKey = '0304c13b889649282b75686aa618045d255175eb';
    if (!this.apiKey) {
      throw new Error('DART_API_KEY is not set');
    }
    this.downloadUrl = `https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key=${this.apiKey}`;
  }

  
  async onModuleInit() {
    const corpCodeCount = await this.dartCorpCodeModel.estimatedDocumentCount();
    if (corpCodeCount > 0) {
      this.logger.log(`기업코드가 이미 ${corpCodeCount}개 존재합니다. 다운로드 예약하지 않음.`);
      return;
    }

    this.scheduleSingleExecution();
  }

  private scheduleSingleExecution() {
    const targetDate = new Date();
    targetDate.setHours(1, 20, 0, 0); // 예: 오늘 1:20에 실행

    const now = new Date();
    const delay = targetDate.getTime() - now.getTime();

    if (delay > 0) {
      this.logger.log(`기업코드 다운로드 예약됨: ${targetDate}`);
      const timeout = setTimeout(async () => {
        try {
          await this.downloadAndSaveCorpCodes();
          this.logger.log(`기업코드 다운로드 및 저장 완료!`);
        } catch (error) {
          this.logger.error(`기업코드 다운로드 실패: ${error.message}`);
        }
      }, delay);

      this.schedulerRegistry.addTimeout('dartCorpCodeDownload', timeout);
    } else {
      this.logger.warn(`지정한 시각(${targetDate})이 이미 지났습니다. 실행되지 않습니다.`);
    }
  }

  async downloadAndSaveCorpCodes(): Promise<void> {
    try {
      // 1. 다운로드
      const response = await axios.get(this.downloadUrl, { responseType: 'arraybuffer' });
      const zipPath = path.join(__dirname, 'corpCode.zip');
      fs.writeFileSync(zipPath, response.data);

      // 2. 압축 해제
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(path.join(__dirname, 'corpCodeExtract'), true);

      // 3. XML 파싱
      const xmlPath = path.join(__dirname, 'corpCodeExtract', 'CORPCODE.xml');
      const xmlData = fs.readFileSync(xmlPath, 'utf-8');
      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(xmlData);

      const corpList = result.result.list;
      const corpArray = Array.isArray(corpList) ? corpList : [corpList];

      // 4. MongoDB에 저장
      for (const corp of corpArray) {
        await this.dartCorpCodeModel.updateOne(
          { corpCode: corp.corp_code },
          {
            corpCode: corp.corp_code,
            corpName: corp.corp_name,
            stockCode: corp.stock_code || null,
          },
          { upsert: true }
        );
      }

      this.logger.log(`기업코드 총 ${corpArray.length}개 저장 완료!`);
    } catch (error: unknown) {
      this.logger.error(`기업코드 저장 실패: ${error.message}`);
      throw error;
    }
  }
}
