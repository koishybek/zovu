import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '../../store/auth';
import { API_BASE } from '../../config';
import type { ChatMessage } from './api';

/** Подключение к WS namespace /chat: join, приём message:new, отправка, read. */
export function useChatSocket(chatId: string | undefined, onNew: (m: ChatMessage) => void) {
  const token = useAuthStore((s) => s.accessToken);
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const onNewRef = useRef(onNew);
  onNewRef.current = onNew;

  useEffect(() => {
    if (!chatId || !token) return;
    // Dev: io('/chat') (same-origin через vite-proxy). Prod: io('https://<api>/chat').
    const socket = io(`${API_BASE}/chat`, { auth: { token }, transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('chat:join', { chatId });
      socket.emit('message:read', { chatId });
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('message:new', (m: ChatMessage) => onNewRef.current(m));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [chatId, token]);

  function send(text: string) {
    socketRef.current?.emit('message:send', { chatId, text });
  }
  function markRead() {
    if (chatId) socketRef.current?.emit('message:read', { chatId });
  }

  return { connected, send, markRead };
}
