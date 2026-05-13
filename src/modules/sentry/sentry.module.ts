import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EnvironmentModule } from '../environment/environment.module';
import { SentryService } from './sentry.service';

@Module({
  exports: [SentryService],
  imports: [ConfigModule, EnvironmentModule],
  providers: [SentryService],
})
export class SentryModule {}
