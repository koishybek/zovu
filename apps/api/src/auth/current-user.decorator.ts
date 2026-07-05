import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthedRequest } from './jwt-auth.guard';
import type { AccessPayload } from './token.service';

/** @CurrentUser() — access-payload из req.user (id + активная роль). */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AccessPayload => {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    return req.user!;
  },
);
