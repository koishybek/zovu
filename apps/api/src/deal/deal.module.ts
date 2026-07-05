import { Module, Injectable, Controller, Post, Get, Param, Body, Patch, UseGuards } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { DealService } from './deal.service';
import { ReviewsService } from '../reviews/reviews.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AccessPayload } from '../auth/token.service';

class ReviewDto {
  @ApiProperty({ minimum: 1, maximum: 5 }) @IsInt() @Min(1) @Max(5) stars!: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(300) text?: string;
}
class ComplaintDto {
  @ApiProperty() @IsString() @MaxLength(200) reason!: string;
}

// ---- Завершение сделки (под /orders) ----
@ApiTags('deal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
class DealController {
  constructor(private readonly deal: DealService) {}

  @Post(':id/complete')
  @ApiOperation({ summary: 'ЗВ-01: заказчик завершает → ожидает подтверждения' })
  complete(@CurrentUser() u: AccessPayload, @Param('id') id: string) {
    return this.deal.complete(u.sub, id);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'ЗВ-02: специалист подтверждает выполнение → выполнен' })
  confirm(@CurrentUser() u: AccessPayload, @Param('id') id: string) {
    return this.deal.confirm(u.sub, id);
  }

  @Post(':id/specialist-done')
  @ApiOperation({ summary: 'ЗВ-04: специалист отметил выполнение' })
  specialistDone(@CurrentUser() u: AccessPayload, @Param('id') id: string) {
    return this.deal.specialistDone(u.sub, id);
  }
}

// ---- Отзывы ----
@ApiTags('reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Post('orders/:id/reviews')
  @ApiOperation({ summary: 'S-27: оставить отзыв (О-04, стоп-словарь)' })
  create(@CurrentUser() u: AccessPayload, @Param('id') id: string, @Body() dto: ReviewDto) {
    return this.reviews.create(u.sub, id, dto.stars, dto.text);
  }

  @Patch('reviews/:id')
  @ApiOperation({ summary: 'ОМ-07: редактировать отзыв (24 ч)' })
  edit(@CurrentUser() u: AccessPayload, @Param('id') id: string, @Body() dto: ReviewDto) {
    return this.reviews.edit(u.sub, id, dto.stars, dto.text);
  }

  @Post('reviews/:id/complaint')
  @ApiOperation({ summary: 'ОМ-03: пожаловаться на отзыв' })
  complaint(@CurrentUser() u: AccessPayload, @Param('id') id: string, @Body() dto: ComplaintDto) {
    return this.reviews.complaint(u.sub, id, dto.reason);
  }

  @Get('users/:userId/reviews')
  @ApiOperation({ summary: 'S-33: отзывы о пользователе' })
  userReviews(@Param('userId') userId: string) {
    return this.reviews.userReviews(userId);
  }
}

// ---- Уведомления ----
@Injectable()
class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}
  async list(userId: string) {
    const rows = await this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 100 });
    return rows.map((n) => ({ id: n.id, type: n.type, title: n.title, body: n.body, payload: n.payload, read: n.readAt != null, created_at: n.createdAt.toISOString() }));
  }
  async markRead(userId: string) {
    await this.prisma.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });
    return { ok: true };
  }
}

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}
  @Get()
  list(@CurrentUser() u: AccessPayload) {
    return this.notifications.list(u.sub);
  }
  @Post('read')
  read(@CurrentUser() u: AccessPayload) {
    return this.notifications.markRead(u.sub);
  }
}

// ---- Cron автозакрытия (каждые 10 мин): ЗВ-03/ЗВ-04 ----
@Injectable()
class DealCron {
  constructor(private readonly deal: DealService) {}
  @Cron('*/10 * * * *')
  async run(): Promise<void> {
    await this.deal.autoClose();
  }
}

@Module({
  controllers: [DealController, ReviewsController, NotificationsController],
  providers: [DealService, ReviewsService, NotificationsService, DealCron],
  exports: [DealService, ReviewsService],
})
export class DealModule {}
