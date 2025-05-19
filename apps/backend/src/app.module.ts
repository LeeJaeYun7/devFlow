import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RouterModule } from './router/router.module';
import { MongoModule } from './module/mongo/mongo.module';
import { ConfigModule } from '@nestjs/config';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET } from './constants/jwt.constant';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './common/guard/auth.guard';
import { APP_FILTER } from '@nestjs/core';
import { BaseExceptionFilter } from './common/filter/base.filter';
import { SlackModule } from './module/slack/slack.module';
import { CustomRequestContextModule } from './module/custom_request_context/custom_request_context.module';
import { CustomRequestContextMiddleware } from './common/middleware/custom_request_context.middleware';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RouterModule,
    MongoModule,
    JwtModule.register({
      global: true,
      secret: JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    SlackModule,
    CustomRequestContextModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: BaseExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
    consumer.apply(CustomRequestContextMiddleware).forRoutes('*');
  }
}
