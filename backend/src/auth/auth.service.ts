import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        masjid: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('E-mel atau kata laluan tidak sah');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Akaun tidak aktif');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('E-mel atau kata laluan tidak sah');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    // Remove password from response
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userWithoutPassword,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException();
      }

      return this.generateTokens(user.id, user.email);
    } catch (error) {
      throw new UnauthorizedException('Token tidak sah');
    }
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        masjid: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessTokenOptions = {
      secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
      expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
    };
    
    const refreshTokenOptions = {
      secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, accessTokenOptions),
      this.jwtService.signAsync(payload, refreshTokenOptions),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
