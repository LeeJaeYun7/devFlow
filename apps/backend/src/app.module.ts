import { Module } from '@nestjs/common';
import { RouterModule } from './router/router.module';
import { MongoModule } from './module/mongo/mongo.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RouterModule,
    MongoModule,
  ],
})
export class AppModule {}
