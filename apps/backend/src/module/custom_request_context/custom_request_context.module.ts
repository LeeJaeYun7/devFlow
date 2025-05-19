import { Module } from '@nestjs/common';
import { CustomRequestContextService } from './custom_request_context.service';

@Module({
  providers: [CustomRequestContextService],
  exports: [CustomRequestContextService],
})
export class CustomRequestContextModule {}