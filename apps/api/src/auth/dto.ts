import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestOtpDto {
  @ApiProperty({ example: '+77012345678', description: 'Номер КЗ (нормализуется на сервере)' })
  @IsString()
  @Length(10, 20)
  phone!: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+77012345678' })
  @IsString()
  @Length(10, 20)
  phone!: string;

  @ApiProperty({ example: '1111', description: 'OTP из SMS (dev — всегда 1111)' })
  @IsString()
  @Matches(/^\d{4}$/, { message: 'code must be 4 digits' })
  code!: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  refresh_token!: string;
}
