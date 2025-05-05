import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserModel } from '../../module/mongo/model/user.model';
import { Model } from 'mongoose';
import { SsoUser } from './auth.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserModel>
  ) {}

  public async loginUser(user: SsoUser) {
    const existingUser = await this.userModel.findOne({
      email: user.email,
    });

    if (!existingUser) {
      const newUser = await this.userModel.create({
        email: user.email,
        provider: user.provider,
        providerId: user.id,
        name: user.name,
      });

      return newUser;
    }

    return existingUser;
  }
}
