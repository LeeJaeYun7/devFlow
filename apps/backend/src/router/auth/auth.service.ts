import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserModel } from '../../module/mongo/model/user.model';
import { Model } from 'mongoose';
import { SsoUser } from './auth.type';
import { UserMetricService } from '../../module/metric/user_metric.service';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserModel>,

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
      });

      await this.userMetricService.createNewUser(userData._id);
    }

    const payload = {
      id: userData._id,
      email: userData.email,
      name: userData.name,
      provider: userData.provider,
    } satisfies SsoUser;

    return await this.jwtService.signAsync(payload);
  }
}
