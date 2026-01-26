import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { TenantUserService } from './tenant-user.service';
import { CreateTenantUserDto } from './dto/create-tenant-user.dto';
import { UpdateTenantUserDto } from './dto/update-tenant-user.dto';
import { MasterAuthGuard } from './guards/master-auth.guard';

@Controller('master/tenants/:tenantSlug/users')
@UseGuards(MasterAuthGuard)
export class TenantUserController {
  constructor(private readonly tenantUserService: TenantUserService) {}

  @Get()
  async findAll(@Param('tenantSlug') tenantSlug: string) {
    return this.tenantUserService.findAllByTenant(tenantSlug);
  }

  @Get(':userId')
  async findOne(@Param('userId') userId: string) {
    return this.tenantUserService.findOne(userId);
  }

  @Post()
  async create(
    @Param('tenantSlug') tenantSlug: string,
    @Body(ValidationPipe) createDto: CreateTenantUserDto,
  ) {
    return this.tenantUserService.create(tenantSlug, createDto);
  }

  @Put(':userId')
  async update(
    @Param('userId') userId: string,
    @Body(ValidationPipe) updateDto: UpdateTenantUserDto,
  ) {
    return this.tenantUserService.update(userId, updateDto);
  }

  @Delete(':userId')
  async delete(@Param('userId') userId: string) {
    return this.tenantUserService.delete(userId);
  }
}
