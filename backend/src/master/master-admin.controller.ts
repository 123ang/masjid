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
import { MasterAdminService } from './master-admin.service';
import { CreateMasterAdminDto } from './dto/create-master-admin.dto';
import { UpdateMasterAdminDto } from './dto/update-master-admin.dto';
import { MasterAuthGuard } from './guards/master-auth.guard';

@Controller('master/admins')
@UseGuards(MasterAuthGuard)
export class MasterAdminController {
  constructor(private readonly masterAdminService: MasterAdminService) {}

  @Get()
  async findAll() {
    return this.masterAdminService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.masterAdminService.findOne(id);
  }

  @Post()
  async create(@Body(ValidationPipe) createDto: CreateMasterAdminDto) {
    return this.masterAdminService.create(createDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateDto: UpdateMasterAdminDto,
  ) {
    return this.masterAdminService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.masterAdminService.delete(id);
  }
}
