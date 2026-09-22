import { io } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents } from '@/types/chat.types';

class SocketService {
  private socket: import('socket.io-client').Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private serverUrl: string;

  constructor() {
    this.serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
  }

  connect() {
    if (!this.socket || !this.socket.connected) {
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();