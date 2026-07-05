import { Module, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AccessPayload } from '../auth/token.service';

@ApiTags('chats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chats')
class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Get()
  @ApiOperation({ summary: 'Мои чаты (Ч-06)' })
  myChats(@CurrentUser() u: AccessPayload) {
    return this.chat.myChats(u.sub);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'История сообщений чата' })
  messages(@CurrentUser() u: AccessPayload, @Param('id') id: string) {
    return this.chat.messages(u.sub, id);
  }
}

@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
