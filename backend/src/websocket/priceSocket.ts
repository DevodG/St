import type { Server } from 'socket.io';
import { verifyAccessToken } from '../lib/jwt';
import { redisSubscriber } from '../lib/redis';
import type { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '../types';

export async function registerPriceSocket(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('subscribe_ticker', (symbol) => {
      socket.join(`ticker:${symbol}`);
    });

    socket.on('unsubscribe_ticker', (symbol) => {
      socket.leave(`ticker:${symbol}`);
    });
  });

  await redisSubscriber.subscribe('price_updates');
  redisSubscriber.on('message', (_channel, message) => {
    const data = JSON.parse(message);
    io.to(`ticker:${data.symbol}`).emit('price_update', data);
  });
}
