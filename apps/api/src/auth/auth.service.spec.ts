import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

// Лёгкий in-memory фейк Prisma (только используемые AuthService методы).
function makeFakePrisma() {
  const otps: any[] = [];
  const users: any[] = [];
  let seq = 0;
  return {
    _otps: otps,
    _users: users,
    otpCode: {
      findFirst: async ({ where }: any) =>
        [...otps].filter((o) => o.phone === where.phone).sort((a, b) => b.createdAt - a.createdAt)[0] ?? null,
      deleteMany: async ({ where }: any) => {
        for (let i = otps.length - 1; i >= 0; i--) if (otps[i].phone === where.phone) otps.splice(i, 1);
        return { count: 0 };
      },
      create: async ({ data }: any) => {
        const row = { id: `otp${++seq}`, attempts: 0, createdAt: new Date(), ...data };
        otps.push(row);
        return row;
      },
      update: async ({ where, data }: any) => {
        const row = otps.find((o) => o.id === where.id);
        Object.assign(row, data);
        return row;
      },
    },
    user: {
      findUnique: async ({ where }: any) => users.find((u) => u.phone === where.phone || u.id === where.id) ?? null,
      create: async ({ data }: any) => {
        const row = { id: `u${++seq}`, activeRole: 'client', isClient: false, isSpecialist: false, name: null, lang: 'ru', ...data };
        users.push(row);
        return row;
      },
      update: async ({ where, data }: any) => {
        const row = users.find((u) => u.id === where.id);
        Object.assign(row, data);
        return row;
      },
    },
    $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
  };
}

const config = { get: (k: string) => (k === 'DEV_OTP_CODE' ? '1111' : undefined) } as any;
const tokens = {
  issuePair: async () => ({ accessToken: 'acc', refreshToken: 'ref', jti: 'j' }),
} as any;
const sms = { send: jest.fn(async () => undefined) } as any;

describe('AuthService — OTP (НФ-05)', () => {
  it('resend раньше 45 с → resend_too_soon', async () => {
    const prisma = makeFakePrisma();
    const auth = new AuthService(prisma as any, tokens, config, sms);
    await auth.requestOtp('+77011112233');
    await expect(auth.requestOtp('+77011112233')).rejects.toThrow(BadRequestException);
  });

  it('верный dev-код 1111 → is_new_user=true, токены', async () => {
    const prisma = makeFakePrisma();
    const auth = new AuthService(prisma as any, tokens, config, sms);
    await auth.requestOtp('+77011112244');
    const res = await auth.verifyOtp('+77011112244', '1111');
    expect(res.is_new_user).toBe(true);
    expect(res.access_token).toBeDefined();
    // код сгорел после успеха
    expect(prisma._otps.length).toBe(0);
  });

  it('5 неверных попыток → код сгорает (otp_burned на 6-й)', async () => {
    const prisma = makeFakePrisma();
    const auth = new AuthService(prisma as any, tokens, config, sms);
    await auth.requestOtp('+77011112255');
    for (let i = 0; i < 5; i++) {
      await expect(auth.verifyOtp('+77011112255', '0000')).rejects.toThrow(UnauthorizedException);
    }
    // после 5 неверных код удалён → следующая попытка otp_expired (нет кода)
    await expect(auth.verifyOtp('+77011112255', '1111')).rejects.toThrow('otp_expired');
    expect(prisma._otps.length).toBe(0);
  });

  it('истёкший код (TTL 2 мин) → otp_expired', async () => {
    const prisma = makeFakePrisma();
    const auth = new AuthService(prisma as any, tokens, config, sms);
    await auth.requestOtp('+77011112266');
    prisma._otps[0].expiresAt = new Date(Date.now() - 1000); // протух
    await expect(auth.verifyOtp('+77011112266', '1111')).rejects.toThrow('otp_expired');
  });

  it('невалидный КЗ-номер → BadRequest', async () => {
    const prisma = makeFakePrisma();
    const auth = new AuthService(prisma as any, tokens, config, sms);
    await expect(auth.requestOtp('123')).rejects.toThrow(BadRequestException);
  });
});
