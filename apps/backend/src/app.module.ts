import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RouterModule } from './router/router.module';
import { MongoModule } from './module/mongo/mongo.module';
import { ConfigModule } from '@nestjs/config';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RouterModule,
    MongoModule,
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
