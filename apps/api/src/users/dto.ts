import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class UpdateMeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;

  @ApiPropertyOptional({ example: '1998-05-12' })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiPropertyOptional({ enum: ['ru', 'kk'] })
  @IsOptional()
  @IsIn(['ru', 'kk'])
  lang?: 'ru' | 'kk';
}

export class SwitchRoleDto {
  @ApiProperty({ enum: ['client', 'specialist'] })
  @IsEnum(['client', 'specialist'] as const)
  role!: 'client' | 'specialist';
}

export class SpecialistProfileDto {
  @ApiProperty()
  @IsString()
  @Length(1, 120)
  name!: string;

  @ApiPropertyOptional({ example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiProperty()
  @IsString()
  mainCategoryId!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  about?: string;
}

export class RegisterDeviceDto {
  @ApiProperty()
  @IsString()
  fcmToken!: string;

  @ApiProperty({ example: 'web' })
  @IsString()
  platform!: string;
}
