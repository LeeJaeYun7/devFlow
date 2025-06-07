import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';
import * as xml2js from 'xml2js';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DartCorpCode } from '../../../../module/mongo/model/korea/dart/models/dart-corp-code.model';
import { BaseConfigService } from '@lia/config';

@Injectable()
export class DartCorpCodeService {
  private readonly logger = new Logger(DartCorpCodeService.name);
  private readonly apiKey: string;
  private readonly downloadUrl: string;

  constructor(
    @InjectModel(DartCorpCode.name)
    private readonly dartCorpCodeModel: Model<DartCorpCode>,
    private readonly configService: BaseConfigService
  ) {
    const config = configService.getConfig();
    this.apiKey = config.dartApiKey;
    if (!this.apiKey) {
      throw new Error('DART_API_KEY is not set');
    }
    this.downloadUrl = `https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key=${this.apiKey}`;
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
