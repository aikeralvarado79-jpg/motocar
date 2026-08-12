import type { Server } from 'socket.io';

/**
 * Emisor global de eventos en tiempo real.
 * Se conecta con la instancia de Socket.IO creada en index.ts.
 */

let io: Server | null = null;

export function setIo(server: Server): void {
  io = server;
}

export function broadcast(event: string, payload: unknown): void {
  io?.emit(event, payload);
}
