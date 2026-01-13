import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, masjidId: string) {
    // Check if email already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException('E-mel sudah digunakan');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        passwordHash,
        role: createUserDto.role,
        masjidId,
      },
      include: {
        masjid: true,
      },
    });

    // Remove password from response
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findAll(masjidId: string) {
    const users = await this.prisma.user.findMany({
      where: { masjidId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        masjidId: true,
      },
    });

    return users;
  }

  async findOne(id: string, masjidId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        masjidId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        masjidId: true,
        masjid: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak dijumpai');
    }

    return user;
  }

  async remove(id: string, masjidId: string, requestUserId: string) {
    // Prevent self-deletion
    if (id === requestUserId) {
      throw new ForbiddenException('Tidak boleh memadam akaun sendiri');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id,
        masjidId,
      },
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak dijumpai');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Pengguna berjaya dipadam' };
  }

  async toggleActive(id: string, masjidId: string) {
    const user = await this.findOne(id, masjidId);

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        masjidId: true,
      },
    });

    return updated;
  }
}
