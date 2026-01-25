import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/create-tenant.dto';

// Reserved slugs that cannot be used as tenant subdomains
const RESERVED_SLUGS = [
  'www',
  'api',
  'admin',
  'master',
  'app',
  'dashboard',
  'login',
  'register',
  'signup',
  'signin',
  'auth',
  'static',
  'assets',
  'public',
  'private',
  'internal',
  'test',
  'staging',
  'dev',
  'development',
  'prod',
  'production',
  'mail',
  'email',
  'smtp',
  'ftp',
  'cdn',
  'media',
  'files',
  'upload',
  'downloads',
  'blog',
  'docs',
  'help',
  'support',
  'status',
  'health',
];

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    const { slug } = createTenantDto;

    // Check if slug is reserved
    if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
      throw new BadRequestException(`Slug "${slug}" tidak boleh digunakan`);
    }

    // Check if slug already exists
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      throw new ConflictException(`Subdomain "${slug}" sudah digunakan`);
    }

    // Create tenant, masjid, and optionally admin user in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create tenant
      const tenant = await tx.tenant.create({
        data: {
          slug: createTenantDto.slug,
          name: createTenantDto.name,
          logo: createTenantDto.logo,
          primaryColor: createTenantDto.primaryColor || '#16a34a',
          secondaryColor: createTenantDto.secondaryColor || '#15803d',
          email: createTenantDto.email,
          phone: createTenantDto.phone,
        },
      });

      // 2. Create masjid linked to tenant
      const masjid = await tx.masjid.create({
        data: {
          tenantId: tenant.id,
          name: createTenantDto.masjidName || createTenantDto.name,
          address: createTenantDto.masjidAddress,
          phone: createTenantDto.masjidPhone || createTenantDto.phone,
        },
      });

      // 3. Create admin user if credentials provided
      let adminUser = null;
      if (createTenantDto.adminEmail && createTenantDto.adminPassword) {
        // Check if email already exists
        const existingUser = await tx.user.findUnique({
          where: { email: createTenantDto.adminEmail },
        });

        if (existingUser) {
          throw new ConflictException(
            `E-mel admin "${createTenantDto.adminEmail}" sudah digunakan`,
          );
        }

        const passwordHash = await bcrypt.hash(createTenantDto.adminPassword, 10);

        adminUser = await tx.user.create({
          data: {
            masjidId: masjid.id,
            name: createTenantDto.adminName || 'Admin',
            email: createTenantDto.adminEmail,
            passwordHash,
            role: 'ADMIN',
            isActive: true,
          },
        });

        // Remove password from response
        const { passwordHash: _, ...userWithoutPassword } = adminUser;
        adminUser = userWithoutPassword;
      }

      return {
        tenant,
        masjid,
        adminUser,
      };
    });

    return {
      message: 'Tenant berjaya dicipta',
      subdomain: `${createTenantDto.slug}.i-masjid.my`,
      ...result,
    };
  }

  async findAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        include: {
          masjid: {
            include: {
              _count: {
                select: {
                  users: true,
                  households: true,
                  kampungs: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return {
      data: tenants,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: {
        masjid: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
              },
            },
            _count: {
              select: {
                households: true,
                kampungs: true,
              },
            },
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant dengan slug "${slug}" tidak dijumpai`);
    }

    return tenant;
  }

  async update(slug: string, updateTenantDto: UpdateTenantDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant dengan slug "${slug}" tidak dijumpai`);
    }

    const updated = await this.prisma.tenant.update({
      where: { slug },
      data: {
        name: updateTenantDto.name,
        logo: updateTenantDto.logo,
        primaryColor: updateTenantDto.primaryColor,
        secondaryColor: updateTenantDto.secondaryColor,
        email: updateTenantDto.email,
        phone: updateTenantDto.phone,
        status: updateTenantDto.status as any,
      },
      include: {
        masjid: true,
      },
    });

    return {
      message: 'Tenant berjaya dikemaskini',
      tenant: updated,
    };
  }

  async delete(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: { masjid: true },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant dengan slug "${slug}" tidak dijumpai`);
    }

    // Soft delete - just set status to INACTIVE
    await this.prisma.tenant.update({
      where: { slug },
      data: { status: 'INACTIVE' },
    });

    return {
      message: 'Tenant berjaya dinyahaktifkan',
      slug,
    };
  }

  async getStats() {
    const [
      totalTenants,
      activeTenants,
      totalHouseholds,
      totalUsers,
    ] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { status: 'ACTIVE' } }),
      this.prisma.household.count(),
      this.prisma.user.count(),
    ]);

    // Get tenants with most households
    const topTenants = await this.prisma.tenant.findMany({
      where: { status: 'ACTIVE' },
      include: {
        masjid: {
          include: {
            _count: {
              select: { households: true },
            },
          },
        },
      },
      take: 5,
    });

    return {
      totalTenants,
      activeTenants,
      inactiveTenants: totalTenants - activeTenants,
      totalHouseholds,
      totalUsers,
      topTenants: topTenants.map((t) => ({
        slug: t.slug,
        name: t.name,
        households: t.masjid?._count?.households || 0,
      })),
    };
  }

  // Resolve tenant from subdomain
  async resolveFromSubdomain(subdomain: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: subdomain },
      include: {
        masjid: true,
      },
    });

    if (!tenant) {
      return null;
    }

    if (tenant.status !== 'ACTIVE') {
      return null;
    }

    return tenant;
  }
}
