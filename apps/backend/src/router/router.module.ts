import { Module } from '@nestjs/common';
import { SampleModule } from './sample/sample.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule, SampleModule],
})
export class RouterModule {}
