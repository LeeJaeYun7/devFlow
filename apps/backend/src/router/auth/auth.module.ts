import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { SsoGoogleStrategy } from './sso_strategy/google.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from '../../module/mongo/model/user.model';
import { AuthService } from './auth.service';
import { SsoKakaoStrategy } from './sso_strategy/kakao.strategy';
import { SsoNaverStrategy } from './sso_strategy/naver.strategy';
@Module({
  imports: [PassportModule, MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }])],
  controllers: [AuthController],
  providers: [SsoGoogleStrategy, SsoNaverStrategy, SsoKakaoStrategy, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
