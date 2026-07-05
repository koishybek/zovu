import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderFiltersDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() certifiedOnly?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) @Max(5) minRating?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) minOrders?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) @Max(50) maxDistanceKm?: number;
}

export class CreateOrderDto {
  @ApiProperty() @IsString() categoryId!: string;
  @ApiProperty() @IsString() @Length(3, 120) title!: string;
  @ApiProperty() @IsString() @Length(1, 2000) description!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5) // НФ-08: до 5 фото
  @IsString({ each: true })
  photos?: string[];

  @ApiProperty() @IsInt() @Min(0) budget!: number;
  @ApiProperty() @IsString() @Length(2, 200) address!: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() lat?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lng?: number;

  @ApiPropertyOptional({ type: OrderFiltersDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => OrderFiltersDto)
  filters?: OrderFiltersDto;
}

export class FeedQueryDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() lat?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() lng?: number;
}
