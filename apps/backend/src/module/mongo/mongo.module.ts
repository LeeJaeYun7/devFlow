import { BaseConfigService } from '@lia/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: BaseConfigService) => ({
        uri: configService.getConfig().mongodbUri,
      }),
      inject: [BaseConfigService],
    }),
  ],
  exports: [MongooseModule],
})
export class MongoModule {}
