import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_PROVIDER, type StorageProvider, PUSH_PROVIDER, type PushProvider } from '../integrations/tokens';

const MAX_FILE = 10 * 1024 * 1024; // ≤10 МБ (ДС-*, НФ-08)
const IMG = ['jpg', 'jpeg', 'png'];
const DOC = ['jpg', 'jpeg', 'png', 'pdf'];

@Injectable()
export class VerificationService {
  private readonly logger = new Logger('Verification');

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    @Inject(PUSH_PROVIDER) private readonly push: PushProvider,
  ) {}

  private async profile(userId: string) {
    const p = await this.prisma.specialistProfile.findUnique({ where: { userId } });
    if (!p) throw new BadRequestException('specialist_profile_required'); // анкета S-05 сначала
    return p;
  }

  /** S-06: селфи + селфи с документом → VerificationRequest, статус pending (В-06). */
  async submitVerification(
    userId: string,
    selfie: Express.Multer.File,
    selfieWithDoc: Express.Multer.File,
  ) {
    const profile = await this.profile(userId);
    const selfieKey = await this.storeFile(selfie, IMG);
    const docKey = await this.storeFile(selfieWithDoc, IMG);

    await this.prisma.$transaction([
      this.prisma.verificationRequest.create({
        data: { specialistId: profile.id, selfieKey, selfieWithDocKey: docKey, status: 'pending' },
      }),
      this.prisma.specialistProfile.update({
        where: { id: profile.id },
        data: { verificationStatus: 'pending' },
      }),
    ]);

    if (this.config.get('AUTO_APPROVE_VERIFICATION') === 'true') {
      this.scheduleAutoApprove(profile.id, userId);
    }
    return { status: 'pending' };
  }

  /** S-05a: диплом (jpg/png/pdf ≤10МБ) → diplomaStatus pending, приватный бакет (НФ-09). */
  async submitDiploma(userId: string, file: Express.Multer.File) {
    const profile = await this.profile(userId);
    const key = await this.storeFile(file, DOC, true);
    await this.prisma.specialistProfile.update({
      where: { id: profile.id },
      data: { diplomaFileKey: key, diplomaStatus: 'pending' },
    });
    if (this.config.get('AUTO_APPROVE_VERIFICATION') === 'true') {
      setTimeout(() => {
        void this.prisma.specialistProfile
          .update({ where: { id: profile.id }, data: { diplomaStatus: 'approved' } })
          .then(() =>
            this.push.send(userId, {
              type: 'diploma_approved',
              title: 'Диплом подтверждён',
              body: 'Теперь у вас бейдж «Дипломированный ✓»',
            }),
          )
          .catch((e) => this.logger.error(e));
      }, 5000);
    }
    return { status: 'pending' };
  }

  private scheduleAutoApprove(profileId: string, userId: string): void {
    setTimeout(() => {
      void this.prisma
        .$transaction([
          this.prisma.verificationRequest.updateMany({
            where: { specialistId: profileId, status: 'pending' },
            data: { status: 'approved', reviewedAt: new Date() },
          }),
          this.prisma.specialistProfile.update({
            where: { id: profileId },
            data: { verificationStatus: 'approved' },
          }),
        ])
        .then(() =>
          this.push.send(userId, {
            type: 'verification_approved',
            title: 'Верификация пройдена',
            body: 'Спасибо! Ваш профиль успешно подтверждён.',
          }),
        )
        .catch((e) => this.logger.error(e));
    }, 5000);
  }

  private async storeFile(
    file: Express.Multer.File,
    allowed: string[],
    privateBucket = false,
  ): Promise<string> {
    if (!file) throw new BadRequestException('file_required');
    if (file.size > MAX_FILE) throw new BadRequestException('file_too_large');
    const ext = (file.originalname.split('.').pop() ?? '').toLowerCase();
    if (!allowed.includes(ext)) throw new BadRequestException('file_type_not_allowed');
    return this.storage.put(file.buffer, ext, privateBucket);
  }
}
