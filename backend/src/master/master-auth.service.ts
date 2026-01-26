import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { MasterLoginDto } from './dto/master-login.dto';

@Injectable()
export class MasterAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: MasterLoginDto) {
    const admin = await this.prisma.masterAdmin.findUnique({
      where: { email: loginDto.email },
    });

    if (!admin) {
      throw new UnauthorizedException('E-mel atau kata laluan tidak sah');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Akaun tidak aktif');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      admin.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('E-mel atau kata laluan tidak sah');
    }

    const tokens = await this.generateTokens(admin.id, admin.email, admin.role);

    // Remove password from response
    const { passwordHash, ...adminWithoutPassword } = admin;

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      admin: adminWithoutPassword,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret:
          process.env.JWT_SECRET ||
          'your-super-secret-key-change-in-production',
      });

      // Verify this is a master token
      if (!payload.isMaster) {
        throw new UnauthorizedException('Token tidak sah');
      }

      const admin = await this.prisma.masterAdmin.findUnique({
        where: { id: payload.sub },
      });

      if (!admin || !admin.isActive) {
        throw new UnauthorizedException();
      }

      return this.generateTokens(admin.id, admin.email, admin.role);
    } catch (error) {
      throw new UnauthorizedException('Token tidak sah');
    }
  }

  async getMe(adminId: string) {
    const admin = await this.prisma.masterAdmin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new UnauthorizedException();
    }

    const { passwordHash, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  }

  private async generateTokens(adminId: string, email: string, role: string) {
    const payload = { 
      sub: adminId, 
      email, 
      role,
      isMaster: true, // Flag to identify master admin tokens
    };

    const secret =
      process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { secret, expiresIn: 60 * 60 * 24 * 7 }), // 7 days in seconds
      this.jwtService.signAsync(payload, { secret, expiresIn: 60 * 60 * 24 * 30 }), // 30 days in seconds
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
