import { Injectable } from "@nestjs/common";
import { CustomRequestContextService } from "../../module/custom_request_context/custom_request_context.service";
import { ServiceReturnType } from "@lia/api/types";
import { UserGetMySelfDto, UserGetMySelfResponse } from "@lia/api/user/myself.dto";
import { UserModel } from "../../module/mongo/model/user.model";
import { UserMessageQuotaModel } from "../../module/mongo/model/user_message_quota.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserError } from "../../util/base.error";

@Injectable()
export class UserService {
  constructor(
    private readonly customRequestContext: CustomRequestContextService,

    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserModel>,

    @InjectModel(UserMessageQuotaModel.name)
    private readonly userMessageQuotaModel: Model<UserMessageQuotaModel>,
  ) {}

  public async getMySelf(_: UserGetMySelfDto): ServiceReturnType<UserGetMySelfResponse> {
    const user = this.customRequestContext.get('user');
    const userData = await this.userModel.findById(user.id);

    if (!userData) {
      throw new UserError('User not found');
    }

    const userMessageQuota = await this.userMessageQuotaModel.findOne({ userId: user.id });

    return {
        name: userData.name,
        email: userData.email,
        provider: userData.provider,
        remainMessageQuota: userMessageQuota?.remainingChats ?? 0,
    };
  }
}