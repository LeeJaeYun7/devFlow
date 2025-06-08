import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserModel } from '../../module/mongo/model/user/models/user.model';
import { Model } from 'mongoose';
import { SsoUser } from './auth.type';
import { UserMetricService } from '../../module/metric/user_metric.service';
import { JwtService } from '@nestjs/jwt';
import { UserMessageQuotaModel } from '../../module/mongo/model/user/models/user_message_quota.model';
import { DEFAULT_MESSAGE_FIRST_QUOTA } from '../../constants/message.constant';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserModel>,

    @InjectModel(UserMessageQuotaModel.name)
    private readonly userMessageQuotaModel: Model<UserMessageQuotaModel>,

    private readonly userMetricService: UserMetricService,

    private readonly jwtService: JwtService
  ) {}

  public async loginUser(user: SsoUser) {
    let userData = await this.userModel.findOne({
      email: user.email,
      provider: user.provider,
    });

    if (!userData) {
      userData = await this.userModel.create({
        email: user.email,
        provider: user.provider,
        providerId: user.id,
        name: user.name,
        lastLoginAt: new Date(),
      });

      await this.userMetricService.createNewUser(userData._id);
      await this.userMessageQuotaModel.create({
        userId: userData._id,
        remainingMessages: DEFAULT_MESSAGE_FIRST_QUOTA,
        lastReset: new Date(),
      });
    } else {
      userData.lastLoginAt = new Date();
      await userData.save();
      await this.userMetricService.accessToday(userData._id);
    }

    const payload = {
      id: userData._id,
      email: userData.email,
      name: userData.name,
      provider: userData.provider,
    } satisfies SsoUser;

    return await this.jwtService.signAsync(payload);
  }

  public async validateToken(token: string) {
    await this.jwtService.verifyAsync<SsoUser>(token);
  }
}
