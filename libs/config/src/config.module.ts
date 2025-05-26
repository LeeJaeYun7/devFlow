import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BaseConfigService } from './config.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [BaseConfigService],
  exports: [BaseConfigService],
})
export class BaseConfigModule {}
