import { Module } from '@nestjs/common';
import { Body, Controller, Get, Injectable, Post, UseGuards } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsIn, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AccessPayload } from '../auth/token.service';

class TopupDto {
  @ApiProperty({ example: 2000 }) @IsInt() @Min(1) amount!: number;
  @ApiProperty({ enum: ['kaspi', 'card'] }) @IsIn(['kaspi', 'card']) method!: 'kaspi' | 'card';
}

@ApiTags('billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get('balance')
  @ApiOperation({ summary: 'S-15: баланс + статус подписки' })
  balance(@CurrentUser() u: AccessPayload) {
    return this.billing.getBalance(u.sub);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'S-15: история операций' })
  transactions(@CurrentUser() u: AccessPayload) {
    return this.billing.getTransactions(u.sub);
  }

  @Post('topup')
  @ApiOperation({ summary: 'S-16: пополнение (мок) + активация БП-07' })
  topup(@CurrentUser() u: AccessPayload, @Body() dto: TopupDto) {
    return this.billing.topup(u.sub, dto.amount, dto.method);
  }
}

/** Cron подписок: 00:00 Asia/Almaty (Б-03…Б-05). */
@Injectable()
class BillingCron {
  constructor(private readonly billing: BillingService) {}

  @Cron('0 0 * * *', { timeZone: 'Asia/Almaty' })
  async daily(): Promise<void> {
    await this.billing.chargeSubscriptions();
  }
}

@Module({
  controllers: [BillingController],
  providers: [BillingService, BillingCron],
  exports: [BillingService],
})
export class BillingModule {}
