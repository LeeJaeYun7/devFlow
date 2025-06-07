import { Controller, Post } from '@nestjs/common';
import { DartCorpCodeService } from './dart-corp-code.service';
import { Public } from '../../../../common/decorator/public.decorator';

@Controller('dart-corp-code')
export class DartCorpCodeController {
  constructor(private readonly dartCorpCodeService: DartCorpCodeService) {}

  @Post('fetch')
  @Public()
  async fetchAndSaveCorpCodes(): Promise<{ message: string }> {
    await this.dartCorpCodeService.downloadAndSaveCorpCodes();
    return { message: '기업코드 다운로드 및 저장 완료' };
  }
}
