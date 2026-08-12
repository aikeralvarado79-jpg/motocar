/**
 * Conexión Socket.IO compartida (singleton).
 * En desarrollo, Vite hace proxy de /socket.io hacia el servidor.
 * En producción, el servidor sirve el cliente y el socket en el mismo origen.
 */
import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectSocket(): Socket {
  if (!socket) {
    socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: Infinity,
    });
  }
  return socket;
}
