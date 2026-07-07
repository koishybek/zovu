import {
  BadRequestException,
  Controller,
  Inject,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { STORAGE_PROVIDER, type StorageProvider } from '../integrations/tokens';

const IMG_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const MAX = 8 * 1024 * 1024; // ≤8 МБ (клиент уже сжимает, НФ-08)

@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(@Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider) {}

  @Post('image')
  @ApiOperation({ summary: 'Загрузка изображения (фото заказа) → публичный ключ' })
  @ApiConsumes('multipart/form-data')
  // Лимит на уровне multer: поток обрывается ДО буферизации всего тела (защита от OOM-DoS).
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX, files: 1 } }))
  async image(@UploadedFile() file?: Express.Multer.File): Promise<{ key: string }> {
    if (!file) throw new BadRequestException('file_required');
    const ext = IMG_MIME[file.mimetype];
    if (!ext) throw new BadRequestException('unsupported_type');
    if (file.size > MAX) throw new BadRequestException('file_too_large'); // defense-in-depth
    const key = await this.storage.put(file.buffer, ext, false); // публичный бакет
    return { key };
  }
}
