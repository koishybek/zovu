import {
  type OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import type { Server, Socket } from 'socket.io';
import { TokenService } from '../auth/token.service';
import { ChatService } from './chat.service';

interface AuthedSocket extends Socket {
  userId?: string;
}

const WS_CORS_ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : true;

/** WS namespace /chat (docs/04-api.md): message:new, message:read, chat:closed. */
@WebSocketGateway({ namespace: '/chat', cors: { origin: WS_CORS_ORIGIN } })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger('ChatGateway');

  constructor(
    private readonly tokens: TokenService,
    private readonly chat: ChatService,
  ) {}

  async handleConnection(client: AuthedSocket): Promise<void> {
    const token = (client.handshake.auth?.token as string) || (client.handshake.query?.token as string);
    try {
      const payload = await this.tokens.verifyAccess(token);
      client.userId = payload.sub;
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('chat:join')
  async onJoin(@ConnectedSocket() client: AuthedSocket, @MessageBody() body: { chatId: string }) {
    if (!client.userId) return;
    try {
      await this.chat.assertParty(client.userId, body.chatId);
      void client.join(body.chatId);
    } catch {
      /* не участник — игнор */
    }
  }

  @SubscribeMessage('message:send')
  async onMessage(@ConnectedSocket() client: AuthedSocket, @MessageBody() body: { chatId: string; text: string }) {
    if (!client.userId || !body.text?.trim()) return;
    try {
      const msg = await this.chat.send(client.userId, body.chatId, body.text.trim());
      this.server.to(body.chatId).emit('message:new', msg);
    } catch (e) {
      client.emit('error', { message: (e as Error).message });
    }
  }

  @SubscribeMessage('message:read')
  async onRead(@ConnectedSocket() client: AuthedSocket, @MessageBody() body: { chatId: string }) {
    if (!client.userId) return;
    try {
      await this.chat.markRead(client.userId, body.chatId);
      this.server.to(body.chatId).emit('message:read', { chatId: body.chatId, by: client.userId });
    } catch {
      /* игнор */
    }
  }
}
