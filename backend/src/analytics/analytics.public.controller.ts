import { Controller, Get, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AnalyticsService } from './analytics.service';

@Controller('analytics/public')
export class AnalyticsPublicController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // Helper to get masjidId from tenant context or query param
  private async getMasjidId(req: Request, queryMasjidId?: string): Promise<string> {
    // Priority: 1. Tenant context from subdomain, 2. Query param, 3. Fallback to first masjid
    if (req.tenant?.masjidId) {
      return req.tenant.masjidId;
    }
    return this.analyticsService.resolveMasjidId(queryMasjidId);
  }

  @Get('kampungs')
  async getKampungs(
    @Req() req: Request,
    @Query('masjidId') masjidId?: string,
  ) {
    const resolvedMasjidId = await this.getMasjidId(req, masjidId);
    return this.analyticsService.getKampungs(resolvedMasjidId);
  }

  @Get('summary')
  async getSummary(
    @Req() req: Request,
    @Query('masjidId') masjidId?: string,
    @Query('kampung') kampung?: string,
  ) {
    const resolvedMasjidId = await this.getMasjidId(req, masjidId);
    return this.analyticsService.getSummary(resolvedMasjidId, kampung);
  }

  @Get('income-distribution')
  async getIncomeDistribution(
    @Req() req: Request,
    @Query('masjidId') masjidId?: string,
    @Query('kampung') kampung?: string,
  ) {
    const resolvedMasjidId = await this.getMasjidId(req, masjidId);
    return this.analyticsService.getIncomeDistribution(resolvedMasjidId, kampung);
  }

  @Get('housing-status')
  async getHousingStatus(
    @Req() req: Request,
    @Query('masjidId') masjidId?: string,
    @Query('kampung') kampung?: string,
  ) {
    const resolvedMasjidId = await this.getMasjidId(req, masjidId);
    return this.analyticsService.getHousingStatus(resolvedMasjidId, kampung);
  }

  @Get('recent-submissions')
  async getRecentSubmissions(
    @Req() req: Request,
    @Query('masjidId') masjidId?: string,
    @Query('kampung') kampung?: string,
  ) {
    const resolvedMasjidId = await this.getMasjidId(req, masjidId);
    return this.analyticsService.getRecentSubmissions(resolvedMasjidId, 5, kampung);
  }

  @Get('gender-distribution')
  async getGenderDistribution(
    @Req() req: Request,
    @Query('masjidId') masjidId?: string,
    @Query('kampung') kampung?: string,
  ) {
    const resolvedMasjidId = await this.getMasjidId(req, masjidId);
    return this.analyticsService.getGenderDistribution(resolvedMasjidId, kampung);
  }

  // Endpoint to get tenant branding info for public pages
  @Get('tenant-info')
  async getTenantInfo(@Req() req: Request) {
    if (!req.tenant) {
      return null;
    }
    return {
      name: req.tenant.name,
      logo: req.tenant.logo,
      primaryColor: req.tenant.primaryColor,
      secondaryColor: req.tenant.secondaryColor,
    };
  }
}
