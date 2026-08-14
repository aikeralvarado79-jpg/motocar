import path from 'node:path';
import 'dotenv/config';

const serverSrc = __dirname;
const clientDist = path.resolve(serverSrc, '../../client/dist');

export const config = {
  port: Number(process.env.PORT) || 4000,
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'motocar123',
  dataFile: process.env.DATA_FILE
    ? path.isAbsolute(process.env.DATA_FILE)
      ? process.env.DATA_FILE
      : path.resolve(serverSrc, process.env.DATA_FILE)
    : path.resolve(serverSrc, '../data/db.json'),
  clientDist,
  buildInfoFile: path.join(clientDist, 'build_info.json'),
};
