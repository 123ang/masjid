import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('kampungs')
  getKampungs(@Request() req) {
    return this.analyticsService.getKampungs(req.user.masjidId);
  }

  @Get('summary')
  getSummary(@Request() req, @Query('kampung') kampung?: string) {
    return this.analyticsService.getSummary(req.user.masjidId, kampung);
  }

  @Get('income-distribution')
  getIncomeDistribution(@Request() req, @Query('kampung') kampung?: string) {
    return this.analyticsService.getIncomeDistribution(req.user.masjidId, kampung);
  }

  @Get('housing-status')
  getHousingStatus(@Request() req, @Query('kampung') kampung?: string) {
    return this.analyticsService.getHousingStatus(req.user.masjidId, kampung);
  }

  @Get('recent-submissions')
  getRecentSubmissions(@Request() req, @Query('kampung') kampung?: string) {
    return this.analyticsService.getRecentSubmissions(req.user.masjidId, 5, kampung);
  }

  @Get('gender-distribution')
  getGenderDistribution(@Request() req, @Query('kampung') kampung?: string) {
    return this.analyticsService.getGenderDistribution(req.user.masjidId, kampung);
  }
}
