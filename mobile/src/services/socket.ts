import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';

export const WS_URL = Platform.OS === 'android' ? 'ws://10.0.2.2:3000' : 'ws://localhost:3000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, { autoConnect: false, reconnectionDelay: 1000, reconnectionDelayMax: 30000 });
    socket.on('connect', () => {
      const token = useAuthStore.getState().accessToken;
      if (token) socket?.emit('authenticate', { accessToken: token });
    });
  }
  return socket;
}
