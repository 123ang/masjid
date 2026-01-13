import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HouseholdModule } from './household/household.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ExportModule } from './export/export.module';

@Module({
  imports: [PrismaModule, AuthModule, HouseholdModule, AnalyticsModule, ExportModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
