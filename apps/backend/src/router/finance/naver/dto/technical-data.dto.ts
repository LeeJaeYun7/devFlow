import { NaverStockHistoryItem } from '../../../../module/mongo/model/naver/interfaces/naver-stock-history-interface';

export class NaverStockTechnicalDto {
  ohlcvAndIndicators!: NaverStockHistoryItem[];
}
