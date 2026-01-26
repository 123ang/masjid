import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMasterAdminDto } from './dto/create-master-admin.dto';
import { UpdateMasterAdminDto } from './dto/update-master-admin.dto';

@Injectable()
export class MasterAdminService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const admins = await this.prisma.masterAdmin.findMany({
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

    return admins;
  }

  async findOne(id: string) {
    const admin = await this.prisma.masterAdmin.findUnique({
      where: { id },
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

    if (!admin) {
      throw new NotFoundException('Master Admin tidak dijumpai');
    }

    return admin;
  }

  async create(createDto: CreateMasterAdminDto) {
    // Check if email already exists
    const existingAdmin = await this.prisma.masterAdmin.findUnique({
      where: { email: createDto.email },
    });

    if (existingAdmin) {
      throw new ConflictException('E-mel telah digunakan');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(createDto.password, 10);

    // Create admin
    const admin = await this.prisma.masterAdmin.create({
      data: {
        email: createDto.email,
        name: createDto.name,
        passwordHash,
        role: createDto.role,
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

    return admin;
  }

  async update(id: string, updateDto: UpdateMasterAdminDto) {
    // Check if admin exists
    const existingAdmin = await this.prisma.masterAdmin.findUnique({
      where: { id },
    });

    if (!existingAdmin) {
      throw new NotFoundException('Master Admin tidak dijumpai');
    }

    // Check if email is being changed and if it's already taken
    if (updateDto.email && updateDto.email !== existingAdmin.email) {
      const emailTaken = await this.prisma.masterAdmin.findUnique({
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

    // Update admin
    const admin = await this.prisma.masterAdmin.update({
      where: { id },
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

    return admin;
  }

  async delete(id: string) {
    // Check if admin exists
    const existingAdmin = await this.prisma.masterAdmin.findUnique({
      where: { id },
    });

    if (!existingAdmin) {
      throw new NotFoundException('Master Admin tidak dijumpai');
    }

    // Count total active super admins
    const activeSuperAdmins = await this.prisma.masterAdmin.count({
      where: {
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    // Prevent deletion if this is the last active super admin
    if (existingAdmin.role === 'SUPER_ADMIN' && existingAdmin.isActive && activeSuperAdmins <= 1) {
      throw new BadRequestException('Tidak boleh memadam Super Admin terakhir yang aktif');
    }

    // Delete admin
    await this.prisma.masterAdmin.delete({
      where: { id },
    });

    return { message: 'Master Admin berjaya dipadam' };
  }
}
