import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { BidsController } from '../bids/bids.controller';
import { BidsService } from '../bids/bids.service';

@Module({
  controllers: [OrdersController, BidsController],
  providers: [OrdersService, BidsService],
  exports: [OrdersService, BidsService],
})
export class OrdersModule {}
