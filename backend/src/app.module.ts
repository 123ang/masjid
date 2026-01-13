import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HouseholdModule } from './household/household.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ExportModule } from './export/export.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [PrismaModule, AuthModule, HouseholdModule, AnalyticsModule, ExportModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
