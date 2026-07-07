import { Controller, Get, Inject, NotFoundException, Param, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { createReadStream, existsSync } from 'node:fs';
import type { Response } from 'express';
import { STORAGE_PROVIDER, type StorageProvider } from '../integrations/tokens';

const CT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

/** Раздача публичных файлов (фото заказа). Приватный бакет НЕ доступен через этот роут (НФ-09). */
@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(@Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider) {}

  @Get('public/:name')
  @ApiOperation({ summary: 'Отдать публичный файл по имени (только bucket public)' })
  serve(@Param('name') name: string, @Res() res: Response): void {
    // Только имена вида <hex>.<ext> — защита от path traversal.
    if (!/^[a-z0-9]+\.(jpg|jpeg|png|webp)$/i.test(name)) throw new NotFoundException();
    const path = this.storage.getPath(`public/${name}`);
    if (!existsSync(path)) throw new NotFoundException();
    const ext = name.split('.').pop()!.toLowerCase();
    res.set({
      'Content-Type': CT[ext] ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff', // не давать браузеру пере-угадывать тип
    });
    const stream = createReadStream(path);
    // Обработчик ошибки: TOCTOU (файл исчез между existsSync и open) не должен ронять процесс.
    stream.on('error', () => {
      if (!res.headersSent) res.status(404).end();
      else res.destroy();
    });
    stream.pipe(res);
  }
}
