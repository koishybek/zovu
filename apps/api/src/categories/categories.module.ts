import { Module } from '@nestjs/common';
import { Body, Controller, Get, Injectable, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AccessPayload } from '../auth/token.service';

class SuggestCategoryDto {
  @IsString()
  @Length(2, 60)
  name!: string;
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Одобренные категории — видны всем (К-06). */
  listApproved() {
    return this.prisma.category.findMany({
      where: { status: 'approved' },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, nameKk: true },
    });
  }

  /** Предложить свою (К-02): статус pending, никому не видна (К-05). */
  async suggest(userId: string, name: string) {
    const trimmed = name.trim();
    const existing = await this.prisma.category.findFirst({
      where: { name: { equals: trimmed, mode: 'insensitive' } },
    });
    if (existing) {
      return { id: existing.id, status: existing.status };
    }
    const cat = await this.prisma.category.create({
      data: { name: trimmed, status: 'pending', createdById: userId },
    });
    return { id: cat.id, status: cat.status };
  }
}

@ApiTags('categories')
@Controller('categories')
class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Справочник одобренных категорий (К-06)' })
  list() {
    return this.categories.listApproved();
  }

  @Post('suggest')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Предложить категорию (К-02 → pending)' })
  suggest(@CurrentUser() u: AccessPayload, @Body() dto: SuggestCategoryDto) {
    return this.categories.suggest(u.sub, dto.name);
  }
}

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
