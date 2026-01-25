import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { MasterAuthController } from './master-auth.controller';
import { MasterAuthService } from './master-auth.service';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { MasterAuthGuard } from './guards/master-auth.guard';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [MasterAuthController, TenantController],
  providers: [MasterAuthService, TenantService, MasterAuthGuard],
  exports: [TenantService],
})
export class MasterModule {}
