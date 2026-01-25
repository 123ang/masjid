import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  private calcPercent(part: number, total: number) {
    if (!total) return 0;
    return parseFloat(((part / total) * 100).toFixed(1));
  }

  async resolveMasjidId(masjidId?: string) {
    if (masjidId) return masjidId;
    const masjid = await this.prisma.masjid.findFirst({
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });
    if (!masjid) {
      throw new NotFoundException('Masjid not configured');
    }
    return masjid.id;
  }

  async getKampungs(masjidId: string) {
    const rows = await this.prisma.householdVersion.findMany({
      where: {
        household: { masjidId },
        currentOfHousehold: { isNot: null },
        village: { not: null },
      },
      distinct: ['village'],
      select: { village: true },
      orderBy: { village: 'asc' },
    });
    return rows.map((r) => r.village).filter((v): v is string => Boolean(v));
  }

  async getSummary(masjidId: string, kampung?: string) {
    // Build currentVersion conditions properly to avoid overwriting
    const baseCurrentVersionCondition = kampung ? { village: kampung } : {};

    const currentVersionWhere = kampung
      ? {
          household: { masjidId },
          currentOfHousehold: { isNot: null },
          village: kampung,
        }
      : {
          household: { masjidId },
          currentOfHousehold: { isNot: null },
        };

    const [
      totalHouseholds,
      totalDependentsResult,
      ownHouseCount,
      rentHouseCount,
      assistanceCount,
      disabilityCount,
      assistedThisYearCount,
      manyDependentsGroups,
      avgIncomeResult,
      thisMonthCount,
      staleRecordsCount,
    ] = await Promise.all([
      // Total households
      this.prisma.household.count({
        where: {
          masjidId,
          ...(kampung ? { currentVersion: { village: kampung } } : {}),
        },
      }),

      // Total dependents
      this.prisma.householdVersionDependent.aggregate({
        _count: { id: true },
        where: {
          householdVersion: {
            ...currentVersionWhere,
          },
        },
      }),

      // Own house count
      this.prisma.household.count({
        where: {
          masjidId,
          currentVersion: { ...baseCurrentVersionCondition, housingStatus: 'SENDIRI' },
        },
      }),

      // Rent house count
      this.prisma.household.count({
        where: {
          masjidId,
          currentVersion: { ...baseCurrentVersionCondition, housingStatus: 'SEWA' },
        },
      }),

      // Receiving assistance count
      this.prisma.household.count({
        where: {
          masjidId,
          currentVersion: { ...baseCurrentVersionCondition, assistanceReceived: true },
        },
      }),

      // With disability count
      this.prisma.household.count({
        where: {
          masjidId,
          currentVersion: { ...baseCurrentVersionCondition, disabilityInFamily: true },
        },
      }),

      // Assisted households (current year)
      this.prisma.household.count({
        where: {
          masjidId,
          currentVersion: { ...baseCurrentVersionCondition, assistanceReceived: true },
          updatedAt: {
            gte: new Date(new Date().getFullYear(), 0, 1),
          },
        },
      }),

      // Households with many dependents (>= 4 tanggungan)
      this.prisma.householdVersionDependent.groupBy({
        by: ['householdVersionId'],
        _count: { id: true },
        where: {
          householdVersion: {
            ...currentVersionWhere,
          },
        },
        having: {
          id: {
            _count: {
              gte: 4,
            },
          },
        },
      }),

      // Average income
      this.prisma.householdVersion.aggregate({
        _avg: { netIncome: true },
        where: {
          ...currentVersionWhere,
        },
      }),

      // This month registrations
      this.prisma.household.count({
        where: {
          masjidId,
          ...(kampung ? { currentVersion: { village: kampung } } : {}),
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),

      // Stale records (not updated > 12 months)
      this.prisma.household.count({
        where: {
          masjidId,
          ...(kampung ? { currentVersion: { village: kampung } } : {}),
          updatedAt: {
            lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const totalDependents = totalDependentsResult._count.id || 0;
    const totalIndividuals = totalHouseholds + totalDependents;
    const averageHouseholdSize =
      totalHouseholds > 0
        ? (totalHouseholds + totalDependents) / totalHouseholds
        : 0;
    const totalManyDependentsHouseholds = manyDependentsGroups.length;

    return {
      totalHouseholds,
      totalDependents,
      totalIndividuals,
      averageHouseholdSize: parseFloat(averageHouseholdSize.toFixed(2)),
      totalOwnHouse: ownHouseCount,
      totalRentHouse: rentHouseCount,
      totalReceivingAssistance: assistanceCount,
      totalWithDisability: disabilityCount,
      totalManyDependentsHouseholds,
      assistedHouseholdsThisYear: assistedThisYearCount,
      percentOwnHouse: this.calcPercent(ownHouseCount, totalHouseholds),
      percentRentHouse: this.calcPercent(rentHouseCount, totalHouseholds),
      percentReceivingAssistance: this.calcPercent(assistanceCount, totalHouseholds),
      percentWithDisability: this.calcPercent(disabilityCount, totalHouseholds),
      percentManyDependents: this.calcPercent(totalManyDependentsHouseholds, totalHouseholds),
      averageIncome: avgIncomeResult._avg.netIncome
        ? parseFloat(avgIncomeResult._avg.netIncome.toString())
        : 0,
      householdsThisMonth: thisMonthCount,
      staleRecords: staleRecordsCount,
    };
  }

  async getIncomeDistribution(masjidId: string, kampung?: string) {
    const households = await this.prisma.household.findMany({
      where: kampung ? { masjidId, currentVersion: { village: kampung } } : { masjidId },
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

  async getHousingStatus(masjidId: string, kampung?: string) {
    const baseCurrentVersionCondition = kampung ? { village: kampung } : {};

    const [own, rent] = await Promise.all([
      this.prisma.household.count({
        where: {
          masjidId,
          currentVersion: { ...baseCurrentVersionCondition, housingStatus: 'SENDIRI' },
        },
      }),
      this.prisma.household.count({
        where: {
          masjidId,
          currentVersion: { ...baseCurrentVersionCondition, housingStatus: 'SEWA' },
        },
      }),
    ]);

    return { own, rent };
  }

  async getRecentSubmissions(masjidId: string, limit: number = 5, kampung?: string) {
    const households = await this.prisma.household.findMany({
      where: kampung ? { masjidId, currentVersion: { village: kampung } } : { masjidId },
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

  async getGenderDistribution(masjidId: string, kampung?: string) {
    const currentVersionWhere = kampung
      ? {
          household: { masjidId },
          currentOfHousehold: { isNot: null },
          village: kampung,
        }
      : {
          household: { masjidId },
          currentOfHousehold: { isNot: null },
        };

    // Count applicants by gender
    const applicantGenderCounts = await this.prisma.householdVersion.groupBy({
      by: ['gender'],
      _count: { gender: true },
      where: currentVersionWhere,
    });

    // Count dependents by gender through Person table
    const dependentGenderCounts = await this.prisma.person.groupBy({
      by: ['gender'],
      _count: { gender: true },
      where: {
        dependentOf: {
          some: {
            householdVersion: currentVersionWhere,
          },
        },
      },
    });

    // Initialize counts
    let lelakiCount = 0;
    let perempuanCount = 0;
    let unknownCount = 0;

    // Sum applicant gender counts
    applicantGenderCounts.forEach((item) => {
      if (item.gender === 'LELAKI') {
        lelakiCount += item._count.gender;
      } else if (item.gender === 'PEREMPUAN') {
        perempuanCount += item._count.gender;
      } else if (item.gender === null) {
        unknownCount += item._count.gender;
      }
    });

    // Sum dependent gender counts
    dependentGenderCounts.forEach((item) => {
      if (item.gender === 'LELAKI') {
        lelakiCount += item._count.gender;
      } else if (item.gender === 'PEREMPUAN') {
        perempuanCount += item._count.gender;
      } else if (item.gender === null) {
        unknownCount += item._count.gender;
      }
    });

    const total = lelakiCount + perempuanCount + unknownCount;

    return {
      lelaki: lelakiCount,
      perempuan: perempuanCount,
      unknown: unknownCount,
      total,
      percentLelaki: this.calcPercent(lelakiCount, total),
      percentPerempuan: this.calcPercent(perempuanCount, total),
      percentUnknown: this.calcPercent(unknownCount, total),
    };
  }
}
