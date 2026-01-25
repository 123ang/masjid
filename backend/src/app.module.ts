import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HouseholdModule } from './household/household.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ExportModule } from './export/export.module';
import { UserModule } from './user/user.module';
import { KampungModule } from './kampung/kampung.module';
import { MasterModule } from './master/master.module';
import { TenantModule } from './tenant/tenant.module';
import { TenantMiddleware } from './tenant/tenant.middleware';

@Module({
  imports: [
    PrismaModule,
    TenantModule,
    AuthModule,
    HouseholdModule,
    AnalyticsModule,
    ExportModule,
    UserModule,
    KampungModule,
    MasterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply tenant middleware to all routes except master routes
    consumer
      .apply(TenantMiddleware)
      .exclude('master/(.*)', 'health')
      .forRoutes('*');
  }
}
