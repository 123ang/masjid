import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  getSummary(@Request() req) {
    return this.analyticsService.getSummary(req.user.masjidId);
  }

  @Get('income-distribution')
  getIncomeDistribution(@Request() req) {
    return this.analyticsService.getIncomeDistribution(req.user.masjidId);
  }

  @Get('housing-status')
  getHousingStatus(@Request() req) {
    return this.analyticsService.getHousingStatus(req.user.masjidId);
  }

  @Get('recent-submissions')
  getRecentSubmissions(@Request() req) {
    return this.analyticsService.getRecentSubmissions(req.user.masjidId);
  }
}
