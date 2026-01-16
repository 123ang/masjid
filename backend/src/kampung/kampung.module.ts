import { Module } from '@nestjs/common';
import { KampungController } from './kampung.controller';
import { KampungService } from './kampung.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KampungController],
  providers: [KampungService],
  exports: [KampungService],
})
export class KampungModule {}
