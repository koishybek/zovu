import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateBidDto {
  @ApiProperty({ description: 'Цена специалиста (предзаполнена бюджетом заказа)' })
  @IsInt()
  @Min(0)
  price!: number;
}
