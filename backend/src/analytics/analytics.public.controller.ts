import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics/public')
export class AnalyticsPublicController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('kampungs')
  async getKampungs(@Query('masjidId') masjidId?: string) {
    const resolvedMasjidId =
      await this.analyticsService.resolveMasjidId(masjidId);
    return this.analyticsService.getKampungs(resolvedMasjidId);
  }

  @Get('summary')
  async getSummary(
    @Query('masjidId') masjidId?: string,
    @Query('kampung') kampung?: string,
  ) {
    const resolvedMasjidId =
      await this.analyticsService.resolveMasjidId(masjidId);
    return this.analyticsService.getSummary(resolvedMasjidId, kampung);
  }

  @Get('income-distribution')
  async getIncomeDistribution(
    @Query('masjidId') masjidId?: string,
    @Query('kampung') kampung?: string,
  ) {
    const resolvedMasjidId =
      await this.analyticsService.resolveMasjidId(masjidId);
    return this.analyticsService.getIncomeDistribution(resolvedMasjidId, kampung);
  }

  @Get('housing-status')
  async getHousingStatus(
    @Query('masjidId') masjidId?: string,
    @Query('kampung') kampung?: string,
  ) {
    const resolvedMasjidId =
      await this.analyticsService.resolveMasjidId(masjidId);
    return this.analyticsService.getHousingStatus(resolvedMasjidId, kampung);
  }

  @Get('recent-submissions')
  async getRecentSubmissions(
    @Query('masjidId') masjidId?: string,
    @Query('kampung') kampung?: string,
  ) {
    const resolvedMasjidId =
      await this.analyticsService.resolveMasjidId(masjidId);
    return this.analyticsService.getRecentSubmissions(resolvedMasjidId, 5, kampung);
  }
}
