import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { SMS_PROVIDER, type SmsProvider } from '../integrations/tokens';
import { TokenService } from './token.service';
import { normalizeKzPhone } from '../common/phone';

const OTP_TTL_MS = 2 * 60 * 1000; // НФ-05: 2 минуты
const RESEND_COOLDOWN_MS = 45 * 1000; // 45 секунд
const MAX_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
    private readonly config: ConfigService,
    @Inject(SMS_PROVIDER) private readonly sms: SmsProvider,
  ) {}

  async requestOtp(rawPhone: string): Promise<{ retry_after: number }> {
    const phone = this.normalize(rawPhone);

    const latest = await this.prisma.otpCode.findFirst({
      where: { phone },
      orderBy: { createdAt: 'desc' },
    });
    if (latest && Date.now() - latest.createdAt.getTime() < RESEND_COOLDOWN_MS) {
      throw new BadRequestException('resend_too_soon');
    }

    const devCode = this.config.get<string>('DEV_OTP_CODE');
    const code = devCode && devCode.length === 4 ? devCode : this.randomCode();
    const codeHash = await argon2.hash(code);

    await this.prisma.$transaction([
      this.prisma.otpCode.deleteMany({ where: { phone } }),
      this.prisma.otpCode.create({
        data: { phone, codeHash, expiresAt: new Date(Date.now() + OTP_TTL_MS), attempts: 0 },
      }),
    ]);

    await this.sms.send(phone, code);
    return { retry_after: RESEND_COOLDOWN_MS / 1000 };
  }

  async verifyOtp(rawPhone: string, code: string) {
    const phone = this.normalize(rawPhone);
    const otp = await this.prisma.otpCode.findFirst({
      where: { phone },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp || otp.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('otp_expired');
    }
    if (otp.attempts >= MAX_ATTEMPTS) {
      await this.prisma.otpCode.deleteMany({ where: { phone } });
      throw new UnauthorizedException('otp_burned');
    }

    const ok = await argon2.verify(otp.codeHash, code);
    if (!ok) {
      const attempts = otp.attempts + 1;
      if (attempts >= MAX_ATTEMPTS) {
        await this.prisma.otpCode.deleteMany({ where: { phone } });
      } else {
        await this.prisma.otpCode.update({ where: { id: otp.id }, data: { attempts } });
      }
      throw new UnauthorizedException('otp_wrong');
    }

    // Успех — код сгорает
    await this.prisma.otpCode.deleteMany({ where: { phone } });

    const existing = await this.prisma.user.findUnique({ where: { phone } });
    const isNewUser = !existing;
    const user = existing ?? (await this.prisma.user.create({ data: { phone } }));

    const pair = await this.issueAndStore(user.id, user.activeRole);
    return {
      ...pair,
      is_new_user: isNewUser,
      user: this.publicUser(user),
    };
  }

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = await this.tokens.verifyRefresh(refreshToken);
    } catch {
      throw new UnauthorizedException('invalid_refresh');
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException('invalid_refresh');

    const match = await argon2.verify(user.refreshTokenHash, refreshToken);
    if (!match) throw new UnauthorizedException('refresh_reused'); // ротация: старый токен недействителен

    const pair = await this.issueAndStore(user.id, user.activeRole);
    return { ...pair, user: this.publicUser(user) };
  }

  private async issueAndStore(userId: string, role: import('@prisma/client').Role) {
    const { accessToken, refreshToken } = await this.tokens.issuePair(userId, role);
    const refreshTokenHash = await argon2.hash(refreshToken);
    await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash } });
    return { access_token: accessToken, refresh_token: refreshToken };
  }

  private normalize(raw: string): string {
    try {
      return normalizeKzPhone(raw);
    } catch {
      throw new BadRequestException('invalid_kz_phone');
    }
  }

  private randomCode(): string {
    return String(Math.floor(1000 + Math.random() * 9000));
  }

  private publicUser(u: {
    id: string;
    phone: string;
    name: string | null;
    lang: string;
    isClient: boolean;
    isSpecialist: boolean;
    activeRole: string;
  }) {
    return {
      id: u.id,
      phone: u.phone,
      name: u.name,
      lang: u.lang,
      is_client: u.isClient,
      is_specialist: u.isSpecialist,
      active_role: u.activeRole,
    };
  }
}
