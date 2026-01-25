import { Module, Global } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantMiddleware } from './tenant.middleware';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [TenantMiddleware],
  exports: [TenantMiddleware],
})
export class TenantModule {}
