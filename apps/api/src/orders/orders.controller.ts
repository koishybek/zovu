import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AccessPayload } from '../auth/token.service';
import { OrdersService } from './orders.service';
import { BidsService } from '../bids/bids.service';
import { CreateOrderDto, FeedQueryDto } from './dto';
import { CreateBidDto } from '../bids/dto';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly orders: OrdersService,
    private readonly bids: BidsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'S-20: создать заказ' })
  create(@CurrentUser() u: AccessPayload, @Body() dto: CreateOrderDto) {
    return this.orders.create(u.sub, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Мои заказы (заказчик, ИЗ-02)' })
  myOrders(@CurrentUser() u: AccessPayload) {
    return this.orders.myOrders(u.sub);
  }

  @Get('feed')
  @ApiOperation({ summary: 'S-11: лента специалиста (гео + фильтры Ф-07 + блок «Новые»)' })
  feed(@CurrentUser() u: AccessPayload, @Query() q: FeedQueryDto) {
    return this.orders.feed(u.sub, q.lat, q.lng);
  }

  @Get(':id')
  @ApiOperation({ summary: 'S-12: карточка заказа' })
  getOne(@Param('id') id: string) {
    return this.orders.getOne(id);
  }

  @Post(':id/hide')
  @ApiOperation({ summary: 'S-11: скрыть заказ (свайп влево)' })
  hide(@CurrentUser() u: AccessPayload, @Param('id') id: string) {
    return this.orders.hide(u.sub, id);
  }

  @Post(':id/bids')
  @ApiOperation({ summary: 'S-13: откликнуться на заказ' })
  createBid(@CurrentUser() u: AccessPayload, @Param('id') id: string, @Body() dto: CreateBidDto) {
    return this.bids.create(u.sub, id, dto.price);
  }

  @Get(':id/bids')
  @ApiOperation({ summary: 'S-23: отклики на заказ (заказчик)' })
  orderBids(@CurrentUser() u: AccessPayload, @Param('id') id: string) {
    return this.bids.orderBids(u.sub, id);
  }
}
