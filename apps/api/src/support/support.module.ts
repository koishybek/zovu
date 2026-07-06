import { Module, Injectable, Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AccessPayload } from '../auth/token.service';

const CATEGORIES = ['Заказ', 'Оплата', 'Жалоба', 'Верификация', 'Иное'] as const;

class CreateTicketDto {
  @ApiProperty({ enum: CATEGORIES }) @IsIn(CATEGORIES as unknown as string[]) category!: string;
  @ApiProperty() @IsString() @MaxLength(2000) text!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() orderId?: string;
  @ApiProperty({ required: false, type: [String] }) @IsOptional() @IsArray() @ArrayMaxSize(5) @IsString({ each: true }) attachments?: string[];
}
class MessageDto {
  @ApiProperty() @IsString() @MaxLength(2000) text!: string;
  @ApiProperty({ required: false, type: [String] }) @IsOptional() @IsArray() @ArrayMaxSize(5) @IsString({ each: true }) attachments?: string[];
}
class RateDto {
  @ApiProperty({ minimum: 1, maximum: 5 }) @IsInt() @Min(1) @Max(5) rating!: number;
}

@Injectable()
class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  /** СП-01…СП-04: обе роли, категории, вложения, привязка заказа. ЗВ-06: спор → заказ disputed. */
  async create(userId: string, dto: CreateTicketDto) {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId,
        category: dto.category,
        orderId: dto.orderId,
        messages: { create: { senderType: 'user', text: dto.text, attachments: dto.attachments ?? [] } },
      },
      include: { messages: true },
    });
    // ЗВ-06: тикет с привязкой к активному заказу → флаг disputed
    if (dto.orderId) {
      await this.prisma.order.updateMany({
        where: { id: dto.orderId, status: { in: ['active', 'in_progress', 'awaiting_confirmation'] } },
        data: { status: 'disputed', disputeTicketId: ticket.id },
      });
    }
    return this.serialize(ticket);
  }

  async myTickets(userId: string) {
    const rows = await this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    return rows.map((t) => this.serialize(t));
  }

  async addMessage(userId: string, ticketId: string, dto: MessageDto) {
    const t = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!t || t.userId !== userId) throw new Error('ticket_not_found');
    await this.prisma.supportMessage.create({ data: { ticketId, senderType: 'user', text: dto.text, attachments: dto.attachments ?? [] } });
    return { ok: true };
  }

  /** СП-10: оценка поддержки после закрытия. */
  async rate(userId: string, ticketId: string, rating: number) {
    const t = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!t || t.userId !== userId) throw new Error('ticket_not_found');
    await this.prisma.supportTicket.update({ where: { id: ticketId }, data: { rating } });
    return { ok: true };
  }

  private serialize(t: any) {
    return {
      id: t.id,
      category: t.category,
      status: t.status,
      order_id: t.orderId,
      rating: t.rating,
      created_at: t.createdAt.toISOString(),
      messages: (t.messages ?? []).map((m: any) => ({ id: m.id, sender_type: m.senderType, text: m.text, attachments: m.attachments, created_at: m.createdAt.toISOString() })),
    };
  }
}

@ApiTags('support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('support/tickets')
class SupportController {
  constructor(private readonly support: SupportService) {}

  @Post() @ApiOperation({ summary: 'S-31: создать обращение (СП-03/04)' })
  create(@CurrentUser() u: AccessPayload, @Body() dto: CreateTicketDto) { return this.support.create(u.sub, dto); }

  @Get() @ApiOperation({ summary: 'Мои обращения' })
  list(@CurrentUser() u: AccessPayload) { return this.support.myTickets(u.sub); }

  @Post(':id/messages')
  message(@CurrentUser() u: AccessPayload, @Param('id') id: string, @Body() dto: MessageDto) { return this.support.addMessage(u.sub, id, dto); }

  @Post(':id/rate') @ApiOperation({ summary: 'СП-10: оценить поддержку' })
  rate(@CurrentUser() u: AccessPayload, @Param('id') id: string, @Body() dto: RateDto) { return this.support.rate(u.sub, id, dto.rating); }
}

@Module({
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
