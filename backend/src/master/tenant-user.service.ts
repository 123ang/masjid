import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantUserDto } from './dto/create-tenant-user.dto';
import { UpdateTenantUserDto } from './dto/update-tenant-user.dto';

@Injectable()
export class TenantUserService {
  constructor(private prisma: PrismaService) {}

  async findAllByTenant(tenantSlug: string) {
    // First get the tenant and its masjid
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      include: { masjid: true },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant tidak dijumpai');
    }

    if (!tenant.masjid) {
      return []; // No masjid, no users
    }

    const users = await this.prisma.user.findMany({
      where: { masjidId: tenant.masjid.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users;
  }

  async findOne(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        masjidId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak dijumpai');
    }

    return user;
  }

  async create(tenantSlug: string, createDto: CreateTenantUserDto) {
    // Get tenant and masjid
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      include: { masjid: true },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant tidak dijumpai');
    }

    if (!tenant.masjid) {
      throw new BadRequestException('Tenant tidak mempunyai masjid. Sila cipta masjid terlebih dahulu.');
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createDto.email },
    });

    if (existingUser) {
      throw new ConflictException('E-mel telah digunakan');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(createDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: createDto.email,
        name: createDto.name,
        passwordHash,
        role: createDto.role,
        masjidId: tenant.masjid.id,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async update(userId: string, updateDto: UpdateTenantUserDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('Pengguna tidak dijumpai');
    }

    // Check if email is being changed and if it's already taken
    if (updateDto.email && updateDto.email !== existingUser.email) {
      const emailTaken = await this.prisma.user.findUnique({
        where: { email: updateDto.email },
      });

      if (emailTaken) {
        throw new ConflictException('E-mel telah digunakan');
      }
    }

    // Prepare update data
    const updateData: any = {
      email: updateDto.email,
      name: updateDto.name,
      role: updateDto.role,
      isActive: updateDto.isActive,
    };

    // Hash new password if provided
    if (updateDto.password) {
      updateData.passwordHash = await bcrypt.hash(updateDto.password, 10);
    }

    // Update user
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async delete(userId: string) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('Pengguna tidak dijumpai');
    }

    // Count total active admins for this masjid
    const activeAdmins = await this.prisma.user.count({
      where: {
        masjidId: existingUser.masjidId,
        role: 'ADMIN',
        isActive: true,
      },
    });

    // Prevent deletion if this is the last active admin
    if (existingUser.role === 'ADMIN' && existingUser.isActive && activeAdmins <= 1) {
      throw new BadRequestException('Tidak boleh memadam admin terakhir yang aktif');
    }

    // Delete user
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Pengguna berjaya dipadam' };
  }
}
