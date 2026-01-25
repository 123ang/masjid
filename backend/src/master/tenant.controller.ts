import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/create-tenant.dto';
import { MasterAuthGuard } from './guards/master-auth.guard';

@Controller('master/tenants')
@UseGuards(MasterAuthGuard)
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Post()
  async create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.tenantService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
    );
  }

  @Get('stats')
  async getStats() {
    return this.tenantService.getStats();
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.tenantService.findBySlug(slug);
  }

  @Put(':slug')
  async update(
    @Param('slug') slug: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return this.tenantService.update(slug, updateTenantDto);
  }

  @Delete(':slug')
  async delete(@Param('slug') slug: string) {
    return this.tenantService.delete(slug);
  }
}
