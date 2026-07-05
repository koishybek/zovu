import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { StorageProvider } from '../tokens';

/**
 * Dev-хранилище на локальной ФС (ADR-005, замена MinIO без Docker).
 * Приватный бакет — отдельная папка (НФ-09), доступ контролируется на уровне API.
 */
@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly root: string;

  constructor(config: ConfigService) {
    this.root = resolve(config.get<string>('LOCAL_STORAGE_DIR') ?? '.storage');
    mkdirSync(join(this.root, 'public'), { recursive: true });
    mkdirSync(join(this.root, 'private'), { recursive: true });
  }

  async put(buffer: Buffer, ext: string, privateBucket = false): Promise<string> {
    const bucket = privateBucket ? 'private' : 'public';
    const name = `${randomBytes(12).toString('hex')}.${ext.replace(/[^a-z0-9]/gi, '')}`;
    const key = `${bucket}/${name}`;
    writeFileSync(join(this.root, key), buffer);
    return key;
  }

  getPath(key: string): string {
    return join(this.root, key);
  }
}
