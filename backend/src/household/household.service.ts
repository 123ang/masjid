import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { UpdateHouseholdDto } from './dto/update-household.dto';

@Injectable()
export class HouseholdService {
  constructor(private prisma: PrismaService) {}

  async create(
    createHouseholdDto: CreateHouseholdDto,
    userId: string,
    masjidId: string,
  ) {
    // Check for duplicate IC if provided
    if (createHouseholdDto.icNo) {
      const existing = await this.checkIcExists(
        createHouseholdDto.icNo,
        masjidId,
      );
      if (existing) {
        throw new ConflictException('No. K/P sudah wujud dalam sistem');
      }
    }

    // Create household with first version
    const household = await this.prisma.household.create({
      data: {
        masjidId,
        versions: {
          create: {
            versionNo: 1,
            createdByUserId: userId,
            applicantName: createHouseholdDto.applicantName,
            icNo: createHouseholdDto.icNo,
            phone: createHouseholdDto.phone,
            address: createHouseholdDto.address,
            poskod: createHouseholdDto.poskod,
            daerah: createHouseholdDto.daerah,
            negeri: createHouseholdDto.negeri,
            village: createHouseholdDto.village,
            netIncome: createHouseholdDto.netIncome,
            housingStatus: createHouseholdDto.housingStatus,
            assistanceReceived: createHouseholdDto.assistanceReceived,
            assistanceProviderText: createHouseholdDto.assistanceProviderText,
            disabilityInFamily: createHouseholdDto.disabilityInFamily,
            disabilityNotesText: createHouseholdDto.disabilityNotesText,
            dependents: {
              create: await Promise.all(
                createHouseholdDto.dependents.map(async (dep) => {
                  const person = await this.prisma.person.create({
                    data: {
                      fullName: dep.fullName,
                      icNo: dep.icNo,
                      phone: dep.phone,
                    },
                  });
                  return {
                    personId: person.id,
                    relationship: dep.relationship,
                    occupation: dep.occupation,
                  };
                }),
              ),
            },
            disabilityMembers: {
              create: await Promise.all(
                createHouseholdDto.disabilityMembers.map(async (member) => {
                  const person = await this.prisma.person.create({
                    data: {
                      fullName: member.fullName,
                      icNo: member.icNo,
                    },
                  });
                  return {
                    personId: person.id,
                    disabilityTypeId: member.disabilityTypeId,
                    notesText: member.notesText,
                  };
                }),
              ),
            },
            emergencyContacts: {
              create: createHouseholdDto.emergencyContacts,
            },
          },
        },
      },
      include: {
        versions: {
          include: {
            dependents: { include: { person: true } },
            disabilityMembers: {
              include: { person: true, disabilityType: true },
            },
            emergencyContacts: true,
            createdByUser: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    // Set current version
    await this.prisma.household.update({
      where: { id: household.id },
      data: { currentVersionId: household.versions[0].id },
    });

    return this.findOne(household.id);
  }

  async findAll(masjidId: string, query: any = {}) {
    const {
      search,
      applicantName,
      icNo,
      address,
      housingStatus,
      incomeMin,
      incomeMax,
      dependentsMin,
      dependentsMax,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Convert page and limit to numbers
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const incomeMinNum =
      incomeMin !== undefined ? parseFloat(incomeMin) : undefined;
    const incomeMaxNum =
      incomeMax !== undefined ? parseFloat(incomeMax) : undefined;
    const dependentsMinNum =
      dependentsMin !== undefined ? parseInt(dependentsMin, 10) : undefined;
    const dependentsMaxNum =
      dependentsMax !== undefined ? parseInt(dependentsMax, 10) : undefined;

    const where: any = { masjidId, AND: [] };
    const currentVersionWhere: any = {};

    if (search) {
      currentVersionWhere.OR = [
        { applicantName: { contains: search, mode: 'insensitive' } },
        { icNo: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (applicantName) {
      currentVersionWhere.applicantName = {
        contains: applicantName,
        mode: 'insensitive',
      };
    }

    if (icNo) {
      currentVersionWhere.icNo = { contains: icNo, mode: 'insensitive' };
    }

    if (address) {
      currentVersionWhere.address = { contains: address, mode: 'insensitive' };
    }

    if (housingStatus) {
      currentVersionWhere.housingStatus = housingStatus;
    }

    if (incomeMinNum !== undefined || incomeMaxNum !== undefined) {
      currentVersionWhere.netIncome = {};
      if (incomeMinNum !== undefined) {
        currentVersionWhere.netIncome.gte = incomeMinNum;
      }
      if (incomeMaxNum !== undefined) {
        currentVersionWhere.netIncome.lte = incomeMaxNum;
      }
    }

    if (Object.keys(currentVersionWhere).length > 0) {
      where.AND.push({ currentVersion: currentVersionWhere });
    }

    // Dependents count filter (server-side)
    if (dependentsMinNum !== undefined || dependentsMaxNum !== undefined) {
      const min = dependentsMinNum ?? 0;
      const max = dependentsMaxNum ?? Number.POSITIVE_INFINITY;

      const or: any[] = [];

      // Include households with 0 dependents when range includes 0.
      if (min <= 0) {
        if (max === 0) {
          or.push({ currentVersion: { dependents: { none: {} } } });
        } else {
          or.push({ currentVersion: { dependents: { none: {} } } });
        }
      }

      // For non-zero counts, use groupBy to get matching currentVersionIds
      const minNonZero = Math.max(1, min);
      const needNonZero = max >= 1;

      if (needNonZero) {
        const having: any = {
          id: {
            _count: {
              gte: minNonZero,
            },
          },
        };
        if (Number.isFinite(max)) {
          having.id._count.lte = max;
        }

        const grouped = await this.prisma.householdVersionDependent.groupBy({
          by: ['householdVersionId'],
          _count: { id: true },
          where: {
            householdVersion: {
              household: { masjidId },
              currentOfHousehold: { isNot: null },
            },
          },
          having,
        });

        const matchingVersionIds = grouped.map((g) => g.householdVersionId);
        if (matchingVersionIds.length > 0) {
          or.push({ currentVersionId: { in: matchingVersionIds } });
        }
      }

      // If nothing matches, return empty result early
      if (or.length === 0) {
        return { data: [], total: 0, page: pageNum, totalPages: 0 };
      }

      where.AND.push({ OR: or });
    }

    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      this.prisma.household.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: {
          currentVersion: {
            include: {
              dependents: { include: { person: true } },
            },
          },
        },
      }),
      this.prisma.household.count({ where }),
    ]);

    return {
      data,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async findOne(id: string) {
    const household = await this.prisma.household.findUnique({
      where: { id },
      include: {
        currentVersion: {
          include: {
            dependents: { include: { person: true } },
            disabilityMembers: {
              include: { person: true, disabilityType: true },
            },
            emergencyContacts: true,
            createdByUser: { select: { id: true, name: true, email: true } },
          },
        },
        versions: {
          orderBy: { versionNo: 'desc' },
          include: {
            createdByUser: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!household) {
      throw new NotFoundException('Isi rumah tidak dijumpai');
    }

    return household;
  }

  async update(
    id: string,
    updateHouseholdDto: UpdateHouseholdDto,
    userId: string,
  ) {
    const household = await this.findOne(id);

    if (!household) {
      throw new NotFoundException('Isi rumah tidak dijumpai');
    }

    // Check for duplicate IC if changed
    if (
      updateHouseholdDto.icNo &&
      updateHouseholdDto.icNo !== household.currentVersion?.icNo
    ) {
      const existing = await this.checkIcExists(
        updateHouseholdDto.icNo,
        household.masjidId,
        id,
      );
      if (existing) {
        throw new ConflictException('No. K/P sudah wujud dalam sistem');
      }
    }

    // Get the latest version number
    const versions = household.versions || [];
    if (versions.length === 0) {
      throw new NotFoundException('Versi isi rumah tidak dijumpai');
    }

    const latestVersion = versions[0];
    const newVersionNo = latestVersion.versionNo + 1;

    // Create new version
    const newVersion = await this.prisma.householdVersion.create({
      data: {
        householdId: id,
        versionNo: newVersionNo,
        createdByUserId: userId,
        applicantName: updateHouseholdDto.applicantName,
        icNo: updateHouseholdDto.icNo,
        phone: updateHouseholdDto.phone,
        address: updateHouseholdDto.address,
        poskod: updateHouseholdDto.poskod,
        daerah: updateHouseholdDto.daerah,
        negeri: updateHouseholdDto.negeri,
        village: updateHouseholdDto.village,
        netIncome: updateHouseholdDto.netIncome,
        housingStatus: updateHouseholdDto.housingStatus,
        assistanceReceived: updateHouseholdDto.assistanceReceived,
        assistanceProviderText: updateHouseholdDto.assistanceProviderText,
        disabilityInFamily: updateHouseholdDto.disabilityInFamily,
        disabilityNotesText: updateHouseholdDto.disabilityNotesText,
        dependents: {
          create: await Promise.all(
            updateHouseholdDto.dependents.map(async (dep) => {
              const person = await this.prisma.person.create({
                data: {
                  fullName: dep.fullName,
                  icNo: dep.icNo,
                  phone: dep.phone,
                },
              });
              return {
                personId: person.id,
                relationship: dep.relationship,
                occupation: dep.occupation,
              };
            }),
          ),
        },
        disabilityMembers: {
          create: await Promise.all(
            updateHouseholdDto.disabilityMembers.map(async (member) => {
              const person = await this.prisma.person.create({
                data: {
                  fullName: member.fullName,
                  icNo: member.icNo,
                },
              });
              return {
                personId: person.id,
                disabilityTypeId: member.disabilityTypeId,
                notesText: member.notesText,
              };
            }),
          ),
        },
        emergencyContacts: {
          create: updateHouseholdDto.emergencyContacts,
        },
      },
    });

    // Update current version pointer
    await this.prisma.household.update({
      where: { id },
      data: { currentVersionId: newVersion.id },
    });

    return this.findOne(id);
  }

  async checkIcExists(
    icNo: string,
    masjidId: string,
    excludeHouseholdId?: string,
  ) {
    const household = await this.prisma.household.findFirst({
      where: {
        masjidId,
        currentVersion: {
          icNo,
        },
        ...(excludeHouseholdId && { id: { not: excludeHouseholdId } }),
      },
    });

    if (household) {
      return { exists: true, householdId: household.id };
    }

    return null;
  }

  async getVersionHistory(id: string) {
    const household = await this.prisma.household.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { versionNo: 'desc' },
          include: {
            dependents: { include: { person: true } },
            disabilityMembers: {
              include: { person: true, disabilityType: true },
            },
            emergencyContacts: true,
            createdByUser: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!household) {
      throw new NotFoundException('Isi rumah tidak dijumpai');
    }

    return household.versions;
  }

  async getDisabilityTypes() {
    return this.prisma.disabilityType.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
