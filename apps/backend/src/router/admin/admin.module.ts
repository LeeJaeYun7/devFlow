import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { SystemPromptModule } from './system_prompt/system_prompt.module';
import { AdminUserModule } from './user/user.module';
import { IsAdminMiddleware } from '../../common/middleware/is_admin.middleware';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUserModel, AdminUserSchema } from '../../module/mongo/model/user/models/admin_user.model';

@Module({
  imports: [
    SystemPromptModule,
    AdminUserModule,
    MongooseModule.forFeature([{ name: AdminUserModel.name, schema: AdminUserSchema }]),
  ],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IsAdminMiddleware).forRoutes({ path: 'admin/*', method: RequestMethod.ALL });
  }
}
