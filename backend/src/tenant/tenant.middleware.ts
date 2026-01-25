import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

// Extend Express Request to include tenant info
declare global {
  namespace Express {
    interface Request {
      tenant?: {
        id: string;
        slug: string;
        name: string;
        masjidId: string;
        logo?: string;
        primaryColor?: string;
        secondaryColor?: string;
      };
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Extract subdomain from host header
    const host = req.headers['x-forwarded-host'] as string || req.headers.host || '';
    const subdomain = this.extractSubdomain(host);

    // If no subdomain or main domain, skip tenant resolution
    if (!subdomain || subdomain === 'www') {
      // For main domain requests, tenant context is not required
      // Master routes will handle this
      return next();
    }

    // Try to resolve tenant from subdomain
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { slug: subdomain },
        include: {
          masjid: true,
        },
      });

      if (!tenant) {
        throw new NotFoundException(`Tenant "${subdomain}" tidak dijumpai`);
      }

      if (tenant.status !== 'ACTIVE') {
        throw new NotFoundException(`Tenant "${subdomain}" tidak aktif`);
      }

      if (!tenant.masjid) {
        throw new NotFoundException(`Masjid untuk tenant "${subdomain}" tidak dijumpai`);
      }

      // Attach tenant info to request
      req.tenant = {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        masjidId: tenant.masjid.id,
        logo: tenant.logo || undefined,
        primaryColor: tenant.primaryColor || undefined,
        secondaryColor: tenant.secondaryColor || undefined,
      };

      next();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // For other errors, just continue without tenant context
      // This allows public routes to work
      next();
    }
  }

  private extractSubdomain(host: string): string | null {
    // Remove port if present
    const hostWithoutPort = host.split(':')[0];

    // Handle localhost development
    if (hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1') {
      // For local development, check for X-Tenant-Slug header
      return null;
    }

    // Split by dots
    const parts = hostWithoutPort.split('.');

    // For i-masjid.my domain
    // alhuda.i-masjid.my -> ['alhuda', 'i-masjid', 'my'] -> return 'alhuda'
    // i-masjid.my -> ['i-masjid', 'my'] -> return null
    // www.i-masjid.my -> ['www', 'i-masjid', 'my'] -> return 'www'

    if (parts.length >= 3) {
      // Has subdomain
      return parts[0];
    }

    return null;
  }
}
