import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { RegisterDeviceDto, SpecialistProfileDto, UpdateMeDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        specialistProfile: {
          include: { categories: { include: { category: true } }, mainCategory: true },
        },
      },
    });
    if (!user) throw new NotFoundException('user_not_found');
    return this.serialize(user);
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        dob: dto.dob ? new Date(dto.dob) : undefined,
        lang: dto.lang,
      },
      include: { specialistProfile: true },
    });
    return this.serialize(user);
  }

  /** Переключение активной роли или активация второй роли (Р-01…Р-05). */
  async switchRole(userId: string, role: Role) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (role === 'client') {
      // Клиентская роль активируется автоматически (заполнение ФИО — на онбординге)
      await this.prisma.user.update({
        where: { id: userId },
        data: { isClient: true, activeRole: 'client' },
      });
    } else {
      // Специалистом можно стать только пройдя анкету + верификацию (S-05/S-06)
      if (!user.isSpecialist) {
        throw new BadRequestException('specialist_role_not_activated');
      }
      await this.prisma.user.update({ where: { id: userId }, data: { activeRole: 'specialist' } });
    }
    return this.getMe(userId);
  }

  /** Анкета специалиста (S-05): создаёт SpecialistProfile, ставит isSpecialist. */
  async upsertSpecialistProfile(userId: string, dto: SpecialistProfileDto) {
    const main = await this.prisma.category.findUnique({ where: { id: dto.mainCategoryId } });
    if (!main || main.status !== 'approved') throw new BadRequestException('invalid_category');

    const extra = Array.from(new Set([dto.mainCategoryId, ...(dto.categoryIds ?? [])]));

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { name: dto.name, dob: dto.dob ? new Date(dto.dob) : undefined, isSpecialist: true },
      });

      const profile = await tx.specialistProfile.upsert({
        where: { userId },
        create: { userId, about: dto.about, mainCategoryId: dto.mainCategoryId },
        update: { about: dto.about, mainCategoryId: dto.mainCategoryId },
      });

      await tx.specialistCategory.deleteMany({ where: { specialistId: profile.id } });
      await tx.specialistCategory.createMany({
        data: extra.map((categoryId) => ({ specialistId: profile.id, categoryId })),
        skipDuplicates: true,
      });
    });

    return this.getMe(userId);
  }

  async registerDevice(userId: string, dto: RegisterDeviceDto) {
    await this.prisma.device.upsert({
      where: { userId_fcmToken: { userId, fcmToken: dto.fcmToken } },
      create: { userId, fcmToken: dto.fcmToken, platform: dto.platform },
      update: { platform: dto.platform },
    });
    return { ok: true };
  }

  private serialize(user: {
    id: string;
    phone: string;
    name: string | null;
    lang: string;
    isClient: boolean;
    isSpecialist: boolean;
    activeRole: string;
    specialistProfile?: unknown;
  }) {
    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      lang: user.lang,
      is_client: user.isClient,
      is_specialist: user.isSpecialist,
      active_role: user.activeRole,
      specialist_profile: user.specialistProfile ?? null,
    };
  }
}
