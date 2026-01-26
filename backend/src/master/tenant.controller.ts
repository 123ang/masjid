import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TenantService } from './tenant.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/create-tenant.dto';
import { MasterAuthGuard } from './guards/master-auth.guard';

@Controller('master/tenants')
@UseGuards(MasterAuthGuard)
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Post()
  async create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.tenantService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
    );
  }

  @Get('stats')
  async getStats() {
    return this.tenantService.getStats();
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.tenantService.findBySlug(slug);
  }

  @Put(':slug')
  async update(
    @Param('slug') slug: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return this.tenantService.update(slug, updateTenantDto);
  }

  @Post(':slug/upload-logo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/logos',
        filename: (req, file, cb) => {
          const tenantSlug = req.params.slug;
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${tenantSlug}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('Hanya fail imej dibenarkan'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadLogo(
    @Param('slug') slug: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Tiada fail dimuat naik');
    }

    // Construct the URL - use full URL for frontend access
    // In production, replace with your actual domain/CDN
    const baseUrl = process.env.API_URL || 'http://localhost:3001';
    const logoUrl = `${baseUrl}/api/uploads/logos/${file.filename}`;
    
    // Update tenant with logo URL
    await this.tenantService.update(slug, { logo: logoUrl });

    return {
      message: 'Logo berjaya dimuat naik',
      logoUrl,
    };
  }

  @Delete(':slug')
  async delete(@Param('slug') slug: string) {
    return this.tenantService.delete(slug);
  }
}
