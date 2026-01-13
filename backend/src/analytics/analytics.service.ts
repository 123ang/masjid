import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSummary(masjidId: string) {
    const [
      totalHouseholds,
      totalDependentsResult,
      ownHouseCount,
      rentHouseCount,
      assistanceCount,
      disabilityCount,
      avgIncomeResult,
      thisMonthCount,
      staleRecordsCount,
    ] = await Promise.all([
      // Total households
      this.prisma.household.count({ where: { masjidId } }),

      // Total dependents
      this.prisma.householdVersionDependent.aggregate({
        _count: { id: true },
        where: {
          householdVersion: {
            household: { masjidId },
            currentOfHousehold: { isNot: null },
          },
        },
      }),

      // Own house count
      this.prisma.household.count({
        where: {
          masjidId,
          currentVersion: { housingStatus: 'SENDIRI' },
        },
      }),

      // Rent house count
      this.prisma.household.count({
        where: {
          masjidId,
          currentVersion: { housingStatus: 'SEWA' },
        },
      }),

      // Receiving assistance count
      this.prisma.household.count({
        where: {
          masjidId,
          currentVersion: { assistanceReceived: true },
        },
      }),

      // With disability count
      this.prisma.household.count({
        where: {
          masjidId,
          currentVersion: { disabilityInFamily: true },
        },
      }),

      // Average income
      this.prisma.householdVersion.aggregate({
        _avg: { netIncome: true },
        where: {
          household: { masjidId },
          currentOfHousehold: { isNot: null },
        },
      }),

      // This month registrations
      this.prisma.household.count({
        where: {
          masjidId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),

      // Stale records (not updated > 12 months)
      this.prisma.household.count({
        where: {
          masjidId,
          updatedAt: {
            lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const totalDependents = totalDependentsResult._count.id || 0;
    const averageHouseholdSize = totalHouseholds > 0 
      ? (totalHouseholds + totalDependents) / totalHouseholds 
      : 0;

    return {
      totalHouseholds,
      totalDependents,
      averageHouseholdSize: parseFloat(averageHouseholdSize.toFixed(2)),
      totalOwnHouse: ownHouseCount,
      totalRentHouse: rentHouseCount,
      totalReceivingAssistance: assistanceCount,
      totalWithDisability: disabilityCount,
      averageIncome: avgIncomeResult._avg.netIncome 
        ? parseFloat(avgIncomeResult._avg.netIncome.toString()) 
        : 0,
      householdsThisMonth: thisMonthCount,
      staleRecords: staleRecordsCount,
    };
  }

  async getIncomeDistribution(masjidId: string) {
    const households = await this.prisma.household.findMany({
      where: { masjidId },
      include: {
        currentVersion: {
          select: { netIncome: true },
        },
      },
    });

    const ranges = [
      { label: 'Kurang RM1000', min: 0, max: 999.99, count: 0 },
      { label: 'RM1000 - RM2000', min: 1000, max: 2000, count: 0 },
      { label: 'RM2001 - RM3000', min: 2001, max: 3000, count: 0 },
      { label: 'RM3001 - RM5000', min: 3001, max: 5000, count: 0 },
      { label: 'Lebih RM5000', min: 5001, max: Infinity, count: 0 },
      { label: 'Tidak Dinyatakan', min: null, max: null, count: 0 },
    ];

    households.forEach((household) => {
      const income = household.currentVersion?.netIncome;
      
      if (!income) {
        ranges[5].count++;
      } else {
        const incomeNum = parseFloat(income.toString());
        for (const range of ranges) {
          if (range.min !== null && range.max !== null) {
            if (incomeNum >= range.min && incomeNum <= range.max) {
              range.count++;
              break;
            }
          }
        }
      }
    });

    return ranges.map(({ label, count }) => ({ range: label, count }));
  }

  async getHousingStatus(masjidId: string) {
    const [own, rent] = await Promise.all([
      this.prisma.household.count({
        where: {
          masjidId,
          currentVersion: { housingStatus: 'SENDIRI' },
        },
      }),
      this.prisma.household.count({
        where: {
          masjidId,
          currentVersion: { housingStatus: 'SEWA' },
        },
      }),
    ]);

    return { own, rent };
  }

  async getRecentSubmissions(masjidId: string, limit: number = 5) {
    const households = await this.prisma.household.findMany({
      where: { masjidId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        currentVersion: {
          select: {
            applicantName: true,
            icNo: true,
            createdAt: true,
          },
        },
      },
    });

    return households.map((h) => ({
      id: h.id,
      applicantName: h.currentVersion?.applicantName || '-',
      icNo: h.currentVersion?.icNo || '-',
      createdAt: h.createdAt,
    }));
  }
}
