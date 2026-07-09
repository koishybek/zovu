import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AccessPayload } from '../auth/token.service';
import { BidsService } from './bids.service';
import { CounterBidDto } from './dto';

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

  @Post(':id/counter')
  @ApiOperation({ summary: 'G6: заказчик предлагает встречную цену (round-trip)' })
  counter(@CurrentUser() u: AccessPayload, @Param('id') id: string, @Body() dto: CounterBidDto) {
    return this.bids.counter(u.sub, id, dto.price);
  }

  @Post(':id/counter-accept')
  @ApiOperation({ summary: 'G6: специалист принимает встречную цену → сделка по counterPrice' })
  counterAccept(@CurrentUser() u: AccessPayload, @Param('id') id: string) {
    return this.bids.acceptCounter(u.sub, id);
  }
}
