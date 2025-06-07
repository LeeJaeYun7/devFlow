import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DartFundamental } from '../../../../module/mongo/model/korea/dart/models/dart-stock-fundamental.model';
import { DartStockFetcherService } from './fetchers/dart-finance-fetch.service';


@Injectable()
export class DartFinanceService {
  private readonly logger = new Logger(DartFinanceService.name);

  constructor(
    @InjectModel(DartFundamental.name)
    private readonly fundamentalModel: Model<DartFundamental>,
    private readonly dartStockFetcherService: DartStockFetcherService,
  ) {}

  async getFundamentalData(corpCode: string): Promise<DartFundamental> {
    const existing = await this.fundamentalModel.findOne({ corpCode });
    if (existing) {
      this.logger.log(`Updated fundamental data for ${corpCode}`);
      return existing;
    }

    const fundamentalDto = await this.dartStockFetcherService.fetchDartFundamental(corpCode);

    // 신규 삽입
    const newFundamental = new this.fundamentalModel(fundamentalDto);
    await newFundamental.save();
    this.logger.log(`Saved new fundamental data for ${corpCode}`);
    return newFundamental;
  }
}
