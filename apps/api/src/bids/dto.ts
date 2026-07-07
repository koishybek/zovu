import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export const BID_AVAILABILITY = ['today', 'tomorrow', 'this_week'] as const;
export type BidAvailability = (typeof BID_AVAILABILITY)[number];

export class CreateBidDto {
  @ApiProperty({ description: 'Цена специалиста (предзаполнена бюджетом заказа)' })
  @IsInt()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ description: 'Когда готов приступить', enum: BID_AVAILABILITY })
  @IsOptional()
  @IsIn(BID_AVAILABILITY)
  availability?: BidAvailability;

  @ApiPropertyOptional({ description: 'Есть материалы/инструмент' })
  @IsOptional()
  @IsBoolean()
  hasMaterials?: boolean;

  @ApiPropertyOptional({ description: 'Короткий комментарий/питч (≤200)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  comment?: string;
}
