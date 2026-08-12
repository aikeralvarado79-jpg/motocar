import http from 'node:http';
import os from 'node:os';
import { Server } from 'socket.io';
import { createApp } from './app';
import { setIo } from './broadcast';
import { config } from './config';

const app = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  path: '/socket.io',
  cors: { origin: '*' },
});

setIo(io);

io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔌 Cliente desconectado: ${socket.id}`);
  });
});

server.listen(config.port, '0.0.0.0', () => {
  const lan = getLanIPv4();
  console.log('\n🚗 MotoCar Parts Pro Elite — Servidor iniciado');
  console.log(`   API + WebSocket : http://localhost:${config.port}`);
  if (lan) console.log(`   Red local (móvil): http://${lan}:${config.port}`);
  console.log(`   Admin            : ${config.adminUsername} / ${config.adminPassword}`);
  console.log('   Presiona Ctrl+C para detener.\n');
});

function getLanIPv4(): string | undefined {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return undefined;
}
