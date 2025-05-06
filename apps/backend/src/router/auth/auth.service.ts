import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserModel } from '../../module/mongo/model/user.model';
import { Model } from 'mongoose';
import { SsoUser } from './auth.type';
import { UserMetricService } from '../../module/metric/user_metric.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserModel>,

    private readonly userMetricService: UserMetricService
  ) {}

  public async loginUser(user: SsoUser) {
    let userData = await this.userModel.findOne({
      email: user.email,
    });

    if (!userData) {
      userData = await this.userModel.create({
        email: user.email,
        provider: user.provider,
        providerId: user.id,
        name: user.name,
      });

      await this.userMetricService.createNewUser(userData._id);
    }

    return userData;
  }
}
