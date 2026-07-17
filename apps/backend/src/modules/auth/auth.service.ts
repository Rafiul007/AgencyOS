import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { MAX_SUB_USERS, TRIAL_DAYS } from '@agencyos/shared';
import type { IAuthResponse, IAuthTokens, IAuthUser } from '@agencyos/shared';
import { PrismaService } from '../prisma/prisma.service';
import { durationToMs } from '../../common/utils/duration';
import { isSubscriptionActive } from './subscription.util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { IRefreshTokenPayload } from './types/request-user';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<IAuthResponse> {
    const email = dto.email.toLowerCase().trim();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException({ message: 'Email is already registered', error: 'EMAIL_TAKEN' });
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const trialEnd = new Date(Date.now() + TRIAL_DAYS * 86_400_000);

    // Create tenant + trial subscription + owner user atomically (ACID).
    const user = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.companyName.trim(),
          slug: await this.uniqueSlug(dto.companyName),
          subscription: {
            create: {
              status: 'TRIALING',
              plan: 'trial',
              maxSubUsers: MAX_SUB_USERS,
              currentPeriodEnd: trialEnd,
            },
          },
        },
      });

      return tx.user.create({
        data: {
          tenantId: tenant.id,
          email,
          name: dto.name.trim(),
          passwordHash,
          role: 'OWNER',
        },
      });
    });

    const tokens = await this.issueTokens(user);
    return { user: this.toAuthUser(user), tokens };
  }

  async login(dto: LoginDto): Promise<IAuthResponse> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { tenant: { include: { subscription: true } } },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException({
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS',
      });
    }

    const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordOk) {
      throw new UnauthorizedException({
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS',
      });
    }

    if (!isSubscriptionActive(user.tenant.subscription)) {
      throw new ForbiddenException({
        message: 'Your subscription is not active',
        error: 'SUBSCRIPTION_INACTIVE',
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.issueTokens(user);
    return { user: this.toAuthUser(user), tokens };
  }

  async refresh(rawToken: string): Promise<IAuthTokens> {
    let payload: IRefreshTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<IRefreshTokenPayload>(rawToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException({ message: 'Invalid session', error: 'INVALID_REFRESH' });
    }

    const stored = await this.prisma.refreshToken.findUnique({ where: { id: payload.jti } });
    if (!stored || stored.revokedAt || stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException({ message: 'Invalid session', error: 'INVALID_REFRESH' });
    }

    const matches = await bcrypt.compare(rawToken, stored.tokenHash);
    if (!matches) {
      throw new UnauthorizedException({ message: 'Invalid session', error: 'INVALID_REFRESH' });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { tenant: { include: { subscription: true } } },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException({ message: 'Invalid session', error: 'INVALID_REFRESH' });
    }
    if (!isSubscriptionActive(user.tenant.subscription)) {
      throw new ForbiddenException({
        message: 'Your subscription is not active',
        error: 'SUBSCRIPTION_INACTIVE',
      });
    }

    // Rotate: revoke the used token, issue a fresh pair.
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });
    return this.issueTokens(user);
  }

  async logout(rawToken: string): Promise<void> {
    try {
      const payload = await this.jwt.verifyAsync<IRefreshTokenPayload>(rawToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      await this.prisma.refreshToken.updateMany({
        where: { id: payload.jti, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Already-invalid tokens are a successful logout from the client's view.
    }
  }

  async getProfile(userId: string): Promise<IAuthUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.toAuthUser(user);
  }

  private async issueTokens(user: {
    id: string;
    email: string;
    role: string;
    tenantId: string;
  }): Promise<IAuthTokens> {
    const accessToken = await this.jwt.signAsync(
      { email: user.email, role: user.role, tenantId: user.tenantId },
      {
        subject: user.id,
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_TTL', '15m'),
      },
    );

    const refreshTtl = this.config.get<string>('JWT_REFRESH_TTL', '7d');
    const expiresAt = new Date(Date.now() + durationToMs(refreshTtl));
    const row = await this.prisma.refreshToken.create({
      data: { userId: user.id, tokenHash: 'pending', expiresAt },
    });

    const refreshToken = await this.jwt.signAsync(
      { jti: row.id },
      {
        subject: user.id,
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTtl,
      },
    );
    await this.prisma.refreshToken.update({
      where: { id: row.id },
      data: { tokenHash: await bcrypt.hash(refreshToken, BCRYPT_ROUNDS) },
    });

    return { accessToken, refreshToken };
  }

  private toAuthUser(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
  }): IAuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as IAuthUser['role'],
      tenantId: user.tenantId,
    };
  }

  private async uniqueSlug(source: string): Promise<string> {
    const base =
      source
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'workspace';
    return `${base}-${Math.random().toString(36).slice(2, 8)}`;
  }
}
