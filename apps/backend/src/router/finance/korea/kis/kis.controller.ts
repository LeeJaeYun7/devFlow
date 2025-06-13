import { Controller, Get, Param } from '@nestjs/common';
import { KisStockService } from './kis.stock.service';
import { Public } from 'apps/backend/src/common/decorator/public.decorator';

@Controller('kis')
export class KisController {
  constructor(private readonly kisStockService: KisStockService) {}

  @Get('fundamental/:symbol')
  @Public()
  async getFundamental(@Param('symbol') symbol: string) {
    return this.kisStockService.fetchFundamental(symbol);
  }

  @Get('technical/:symbol')
  @Public()
  async getTechnical(@Param('symbol') symbol: string) {
    return this.kisStockService.fetchTechnical(symbol);
  }
}
