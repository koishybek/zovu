import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

/** Guard админки: статический ADMIN_TOKEN из .env (не JWT). Заголовок X-Admin-Token или Bearer. */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();
    const header = (req.headers['x-admin-token'] as string) || req.headers.authorization?.replace('Bearer ', '');
    const expected = this.config.getOrThrow<string>('ADMIN_TOKEN');
    if (!header || header !== expected) throw new UnauthorizedException('bad_admin_token');
    return true;
  }
}
