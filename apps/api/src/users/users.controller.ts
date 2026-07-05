import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AccessPayload } from '../auth/token.service';
import { UsersService } from './users.service';
import { RegisterDeviceDto, SpecialistProfileDto, SwitchRoleDto, UpdateMeDto } from './dto';

@ApiTags('me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Текущий пользователь + профиль специалиста' })
  getMe(@CurrentUser() u: AccessPayload) {
    return this.users.getMe(u.sub);
  }

  @Patch('me')
  updateMe(@CurrentUser() u: AccessPayload, @Body() dto: UpdateMeDto) {
    return this.users.updateMe(u.sub, dto);
  }

  @Post('me/role')
  @ApiOperation({ summary: 'Переключить/активировать роль (Р-01…Р-05)' })
  switchRole(@CurrentUser() u: AccessPayload, @Body() dto: SwitchRoleDto) {
    return this.users.switchRole(u.sub, dto.role);
  }

  @Post('me/devices')
  registerDevice(@CurrentUser() u: AccessPayload, @Body() dto: RegisterDeviceDto) {
    return this.users.registerDevice(u.sub, dto);
  }

  @Post('specialist/profile')
  @ApiOperation({ summary: 'Анкета специалиста (S-05)' })
  specialistProfile(@CurrentUser() u: AccessPayload, @Body() dto: SpecialistProfileDto) {
    return this.users.upsertSpecialistProfile(u.sub, dto);
  }
}
