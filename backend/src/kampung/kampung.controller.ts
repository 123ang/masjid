import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { KampungService } from './kampung.service';
import { CreateKampungDto, UpdateKampungDto } from './dto/create-kampung.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('kampung')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KampungController {
  constructor(private readonly kampungService: KampungService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createKampungDto: CreateKampungDto, @Request() req) {
    return this.kampungService.create(createKampungDto, req.user.masjidId);
  }

  @Get()
  findAll(@Request() req) {
    return this.kampungService.findAll(req.user.masjidId);
  }

  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string, @Request() req) {
    return this.kampungService.findOne(id, req.user.masjidId);
  }

  @Put(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateKampungDto: UpdateKampungDto, @Request() req) {
    return this.kampungService.update(id, updateKampungDto, req.user.masjidId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string, @Request() req) {
    return this.kampungService.remove(id, req.user.masjidId);
  }
}
