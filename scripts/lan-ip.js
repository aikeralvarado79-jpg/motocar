/**
 * Muestra la IP local de este equipo para abrir la app desde el móvil
 * dentro de la misma red Wi-Fi. Uso: npm run lan
 */
const os = require('node:os');

const nets = os.networkInterfaces();
const ips = [];

for (const name of Object.keys(nets)) {
  for (const net of nets[name] || []) {
    if (net.family === 'IPv4' && !net.internal) {
      ips.push({ name, address: net.address });
    }
  }
}

if (ips.length === 0) {
  console.log('No se detectó una IP de red local.');
} else {
  console.log('Direcciones LAN disponibles:\n');
  for (const { name, address } of ips) {
    console.log(`  ${name.padEnd(24)} http://${address}`);
  }
  console.log('\nDesde tu móvil (misma red Wi-Fi), abre http://<IP>:5173 (modo desarrollo)');
  console.log('o http://<IP>:4000 (modo producción).');
}
