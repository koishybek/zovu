import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { TokenService, type AccessPayload } from './token.service';

export interface AuthedRequest extends Request {
  user?: AccessPayload;
}

/** Guard доступа по access-JWT (Bearer). Кладёт payload в req.user. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokens: TokenService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedException('no_token');
    const token = header.slice(7);
    try {
      req.user = await this.tokens.verifyAccess(token);
      return true;
    } catch {
      throw new UnauthorizedException('invalid_token');
    }
  }
}
