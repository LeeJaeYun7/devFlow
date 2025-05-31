import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction } from 'express';
import { CustomRequestContextService } from '../../module/custom_request_context/custom_request_context.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminUserModel } from '../../module/mongo/model/user/models/admin_user.model';

@Injectable()
export class IsAdminMiddleware implements NestMiddleware {
  constructor(
    private readonly customRequestContextService: CustomRequestContextService,

    @InjectModel(AdminUserModel.name)
    private readonly adminUserModel: Model<AdminUserModel>
  ) {}

  public async use(req: Request, res: Response, next: NextFunction) {
    const user = this.customRequestContextService.get('user');

    const userId = user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    const adminUser = await this.adminUserModel.findOne({ userId }).lean();
    if (!adminUser) {
      throw new UnauthorizedException('Permission denied');
    }

    next();
  }
}
