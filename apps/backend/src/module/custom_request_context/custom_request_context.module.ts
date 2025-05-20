import { Global, Module } from '@nestjs/common';
import { CustomRequestContextService } from './custom_request_context.service';

@Global()
@Module({
  providers: [CustomRequestContextService],
  exports: [CustomRequestContextService],
})
export class CustomRequestContextModule {}
