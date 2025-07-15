import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from '../../module/mongo/model/user/models/user.model';
import { AuthService } from './auth.service';
import { SsoGithubStrategy } from './sso_strategy/github.strategy';
import { GithubWebhookController } from './github-webhook.controller';
import { MetricModule } from '../../module/metric/metric.module';
import { UserMessageQuotaModel } from '../../module/mongo/model/user/models/user_message_quota.model';
import { UserMessageQuotaSchema } from '../../module/mongo/model/user/models/user_message_quota.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserMessageQuotaModel.name, schema: UserMessageQuotaSchema }]),
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
    PassportModule,
    MetricModule,
  ],
  controllers: [AuthController, GithubWebhookController],
  providers: [SsoGithubStrategy, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
