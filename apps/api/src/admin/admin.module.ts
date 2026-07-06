import { Module, Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';

class ReasonDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(300) reason?: string;
}
class DiplomaDto extends ReasonDto {
  @ApiProperty({ enum: ['approve', 'reject', 'revoke'] }) @IsIn(['approve', 'reject', 'revoke']) action!: 'approve' | 'reject' | 'revoke';
}
class UserActionDto extends ReasonDto {
  @ApiProperty({ enum: ['warn', 'block', 'unblock'] }) @IsIn(['warn', 'block', 'unblock']) action!: 'warn' | 'block' | 'unblock';
}
class ReplyDto {
  @ApiProperty() @IsString() @MaxLength(2000) text!: string;
}

@ApiTags('admin')
@ApiSecurity('admin-token')
@UseGuards(AdminGuard)
@Controller('admin')
class AdminController {
  constructor(private readonly admin: AdminService) {}

  // Очереди
  @Get('verification') verification() { return this.admin.verificationQueue(); }
  @Get('diplomas') diplomas() { return this.admin.diplomaQueue(); }
  @Get('categories') categories() { return this.admin.categoryQueue(); }
  @Get('review-complaints') complaints() { return this.admin.complaintQueue(); }
  @Get('tickets') tickets() { return this.admin.ticketQueue(); }
  @Get('audit-log') @ApiOperation({ summary: 'НФ-13: аудит действий админа' }) audit() { return this.admin.auditLog(); }

  // Верификация
  @Post('verification/:id/approve') vApprove(@Param('id') id: string) { return this.admin.approveVerification(id); }
  @Post('verification/:id/reject') vReject(@Param('id') id: string, @Body() d: ReasonDto) { return this.admin.rejectVerification(id, d.reason ?? 'Отклонено'); }

  // Дипломы
  @Post('diplomas/:id') diploma(@Param('id') id: string, @Body() d: DiplomaDto) { return this.admin.diplomaAction(id, d.action, d.reason); }

  // Категории
  @Post('categories/:id/approve') cApprove(@Param('id') id: string) { return this.admin.approveCategory(id); }
  @Post('categories/:id/reject') cReject(@Param('id') id: string) { return this.admin.rejectCategory(id); }

  // Жалобы на отзывы
  @Post('reviews/:id/hide') rHide(@Param('id') id: string) { return this.admin.hideReview(id); }
  @Post('reviews/:id/restore') rRestore(@Param('id') id: string) { return this.admin.restoreReview(id); }
  @Post('complaints/:id/resolve') cResolve(@Param('id') id: string) { return this.admin.resolveComplaint(id); }

  // Тикеты
  @Post('tickets/:id/take') tTake(@Param('id') id: string) { return this.admin.ticketTake(id); }
  @Post('tickets/:id/reply') tReply(@Param('id') id: string, @Body() d: ReplyDto) { return this.admin.ticketReply(id, d.text); }
  @Post('tickets/:id/resolve') tResolve(@Param('id') id: string) { return this.admin.ticketResolve(id); }

  // Пользователи (СП-09)
  @Post('users/:id') user(@Param('id') id: string, @Body() d: UserActionDto) { return this.admin.userAction(id, d.action, d.reason); }
}

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
})
export class AdminModule {}
