import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsPublicController } from './analytics.public.controller';

@Module({
  controllers: [AnalyticsController, AnalyticsPublicController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
