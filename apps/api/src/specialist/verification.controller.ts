import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AccessPayload } from '../auth/token.service';
import { VerificationService } from './verification.service';

@ApiTags('specialist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('specialist')
export class VerificationController {
  constructor(private readonly verification: VerificationService) {}

  @Post('verification')
  @ApiOperation({ summary: 'S-06: селфи + селфи с документом (В-06)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'selfie', maxCount: 1 },
      { name: 'selfieWithDoc', maxCount: 1 },
    ]),
  )
  submitVerification(
    @CurrentUser() u: AccessPayload,
    @UploadedFiles() files: { selfie?: Express.Multer.File[]; selfieWithDoc?: Express.Multer.File[] },
  ) {
    return this.verification.submitVerification(u.sub, files.selfie![0], files.selfieWithDoc![0]);
  }

  @Post('diploma')
  @ApiOperation({ summary: 'S-05a: диплом jpg/png/pdf ≤10МБ (ДС-*, НФ-09)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  submitDiploma(@CurrentUser() u: AccessPayload, @UploadedFile() file: Express.Multer.File) {
    return this.verification.submitDiploma(u.sub, file);
  }
}
