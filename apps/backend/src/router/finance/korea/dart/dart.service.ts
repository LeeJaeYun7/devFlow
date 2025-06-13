import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DartCompanyInfo } from '../../../../module/mongo/model/korea/dart/models/dart-company-info.model';
import { DartCorpCode } from '../../../../module/mongo/model/korea/dart/models/dart-corp-code-model';

@Injectable()
export class DartService {
  private readonly logger = new Logger(DartService.name);

  constructor(
    @InjectModel(DartCompanyInfo.name)
    private readonly dartCompanyInfoModel: Model<DartCompanyInfo>,
    @InjectModel(DartCorpCode.name)
    private readonly dartCorpCodeModel: Model<DartCorpCode>,
  ) {}

  async getAllFinancialSummaries(stockCode: string) {
    const corp = await this.dartCorpCodeModel.findOne({ stockCode });

    if (!corp) {
      throw new Error(`No corpCode found for stockCode: ${stockCode}`);
    }

    const corpCode = corp.corpCode;

    const rawData = await this.dartCompanyInfoModel
      .find({
        corpCode,
        bsnsYear: { $gte: 2015, $lte: 2025 },
      })
      .sort({ bsnsYear: -1 }) // 최신 순
      .lean();

    const reprtCodeMap: Record<string, string> = {
      '11013': '1Q',
      '11012': '2Q',
      '11014': '3Q',
      '11011': '4Q',
    };

    const normalize = (str: string) => str.replace(/\s/g, '').trim();

    const findAmount = (financials: any[], targetNames: string[]) => {
      return financials?.find((f: any) => f.account_nm && targetNames.includes(normalize(f.account_nm)))?.thstrm_amount;
    };

    const summaries = rawData.map((entry) => {
      const revenue = findAmount(entry.financials, ['수익', '매출액']);
      const operatingProfit = findAmount(entry.financials, ['영업이익']);
      const netIncome = findAmount(entry.financials, ['당기순이익']);

      return {
        year: entry.bsnsYear,
        quarter: reprtCodeMap[entry.reprtCode ?? ''] ?? entry.reprtCode,
        revenue,
        operatingProfit,
        netIncome,
      };
    });

    console.log('summaries');
    console.log(summaries);

    return {
      symbol: `${stockCode}.KS`,
      corpName: corp.corpName,
      financials: summaries.filter((f) => f.revenue || f.operatingProfit || f.netIncome),
    };
  }
}
