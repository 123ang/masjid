import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { HouseholdService } from './household.service';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { UpdateHouseholdDto } from './dto/update-household.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('household')
@UseGuards(JwtAuthGuard)
export class HouseholdController {
  constructor(private readonly householdService: HouseholdService) {}

  @Post()
  create(@Body() createHouseholdDto: CreateHouseholdDto, @Request() req) {
    return this.householdService.create(
      createHouseholdDto,
      req.user.id,
      req.user.masjidId,
    );
  }

  @Get()
  findAll(@Request() req, @Query() query: any) {
    return this.householdService.findAll(req.user.masjidId, query);
  }

  @Get('check-ic/:icNo')
  checkIc(@Param('icNo') icNo: string, @Request() req) {
    return this.householdService.checkIcExists(icNo, req.user.masjidId);
  }

  @Get('disability-types')
  getDisabilityTypes() {
    return this.householdService.getDisabilityTypes();
  }

  @Get(':id/versions')
  getVersionHistory(@Param('id') id: string) {
    return this.householdService.getVersionHistory(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.householdService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateHouseholdDto: UpdateHouseholdDto,
    @Request() req,
  ) {
    return this.householdService.update(id, updateHouseholdDto, req.user.id);
  }
}
