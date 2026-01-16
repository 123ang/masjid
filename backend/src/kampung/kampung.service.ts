import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKampungDto, UpdateKampungDto } from './dto/create-kampung.dto';

@Injectable()
export class KampungService {
  constructor(private prisma: PrismaService) {}

  async create(createKampungDto: CreateKampungDto, masjidId: string) {
    // Check if name already exists for this masjid
    const existing = await this.prisma.kampung.findFirst({
      where: { 
        name: createKampungDto.name,
        masjidId,
      },
    });

    if (existing) {
      throw new ConflictException('Nama kampung sudah wujud');
    }

    // Create kampung
    const kampung = await this.prisma.kampung.create({
      data: {
        name: createKampungDto.name,
        isActive: createKampungDto.isActive ?? true,
        masjidId,
      },
    });

    return kampung;
  }

  async findAll(masjidId: string) {
    const kampungs = await this.prisma.kampung.findMany({
      where: { 
        masjidId,
        isActive: true, // Only return active kampungs for form dropdowns
      },
      orderBy: { name: 'asc' },
    });

    return kampungs;
  }

  async findOne(id: string, masjidId: string) {
    const kampung = await this.prisma.kampung.findFirst({
      where: {
        id,
        masjidId,
      },
    });

    if (!kampung) {
      throw new NotFoundException('Kampung tidak dijumpai');
    }

    return kampung;
  }

  async update(id: string, updateKampungDto: UpdateKampungDto, masjidId: string) {
    const kampung = await this.findOne(id, masjidId);

    // Check if new name conflicts with existing for this masjid
    if (updateKampungDto.name && updateKampungDto.name !== kampung.name) {
      const existing = await this.prisma.kampung.findFirst({
        where: { 
          name: updateKampungDto.name,
          masjidId,
        },
      });

      if (existing) {
        throw new ConflictException('Nama kampung sudah wujud');
      }
    }

    const updated = await this.prisma.kampung.update({
      where: { id },
      data: {
        name: updateKampungDto.name,
        isActive: updateKampungDto.isActive,
      },
    });

    return updated;
  }

  async remove(id: string, masjidId: string) {
    const kampung = await this.findOne(id, masjidId);

    await this.prisma.kampung.delete({
      where: { id },
    });

    return { message: 'Kampung berjaya dipadam' };
  }
}
