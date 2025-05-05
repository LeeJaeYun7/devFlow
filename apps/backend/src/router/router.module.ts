import { Module } from '@nestjs/common';
import { SampleModule } from './sample/sample.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule, SampleModule, AdminModule],
})
export class RouterModule {}
