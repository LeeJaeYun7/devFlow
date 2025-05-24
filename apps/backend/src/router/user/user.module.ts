import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from '../../module/mongo/model/user/models/user.model';
import {
  UserMessageQuotaModel,
  UserMessageQuotaSchema,
} from '../../module/mongo/model/user/models/user_message_quota.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: UserMessageQuotaModel.name, schema: UserMessageQuotaSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
