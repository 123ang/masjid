import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { MasterAuthController } from './master-auth.controller';
import { MasterAuthService } from './master-auth.service';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { MasterAdminController } from './master-admin.controller';
import { MasterAdminService } from './master-admin.service';
import { TenantUserController } from './tenant-user.controller';
import { TenantUserService } from './tenant-user.service';
import { MasterAuthGuard } from './guards/master-auth.guard';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [MasterAuthController, TenantController, MasterAdminController, TenantUserController],
  providers: [MasterAuthService, TenantService, MasterAdminService, TenantUserService, MasterAuthGuard],
  exports: [TenantService],
})
export class MasterModule {}
