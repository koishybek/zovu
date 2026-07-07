import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { FilesController } from './files.controller';

/** Загрузка изображений (фото заказа) в публичный бакет + их раздача. Storage — глобальный. */
@Module({
  controllers: [UploadsController, FilesController],
})
export class UploadsModule {}
