import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AccessPayload } from '../auth/token.service';
import { BidsService } from './bids.service';

@ApiTags('bids')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bids')
export class BidsController {
  constructor(private readonly bids: BidsService) {}

  @Get('my')
  @ApiOperation({ summary: 'S-14: мои отклики (специалист)' })
  myBids(@CurrentUser() u: AccessPayload) {
    return this.bids.myBids(u.sub);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'S-24: принять отклик (каскад «Не выбран» + чат + комиссия)' })
  accept(@CurrentUser() u: AccessPayload, @Param('id') id: string) {
    return this.bids.accept(u.sub, id);
  }

  @Post(':id/decline')
  @ApiOperation({ summary: 'S-24: отклонить отклик' })
  decline(@CurrentUser() u: AccessPayload, @Param('id') id: string) {
    return this.bids.decline(u.sub, id);
  }
}
