import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MasterAuthService } from './master-auth.service';
import { MasterLoginDto } from './dto/master-login.dto';
import { MasterAuthGuard } from './guards/master-auth.guard';

@Controller('master/auth')
export class MasterAuthController {
  constructor(private masterAuthService: MasterAuthService) {}

  @Post('login')
  async login(@Body() loginDto: MasterLoginDto) {
    return this.masterAuthService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.masterAuthService.refreshToken(refreshToken);
  }

  @UseGuards(MasterAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.masterAuthService.getMe(req.user.sub);
  }
}
