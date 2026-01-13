import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createUserDto: CreateUserDto, @Request() req) {
    return this.userService.create(createUserDto, req.user.masjidId);
  }

  @Get()
  @Roles('ADMIN')
  findAll(@Request() req) {
    return this.userService.findAll(req.user.masjidId);
  }

  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string, @Request() req) {
    return this.userService.findOne(id, req.user.masjidId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string, @Request() req) {
    return this.userService.remove(id, req.user.masjidId, req.user.id);
  }

  @Patch(':id/toggle-active')
  @Roles('ADMIN')
  toggleActive(@Param('id') id: string, @Request() req) {
    return this.userService.toggleActive(id, req.user.masjidId);
  }
}
