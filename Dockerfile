# ============================================================
# MotoCar Parts Pro Elite — Dockerfile de producción
# Compatible con Hugging Face Spaces, Docker y Northflank.
# Construye el cliente (Vite) y ejecuta el servidor con tsx.
# ============================================================

# ---------- Etapa 1: instalar dependencias y compilar el cliente ----------
FROM node:22-alpine AS build
WORKDIR /app

# Manifiestos primero para aprovechar la caché de capas
COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY client/package.json client/package.json
COPY shared/ shared/

RUN npm ci

# Resto del código
COPY server/ server/
COPY client/ client/

# Compilamos el cliente (Vite -> client/dist)
RUN npm run build -w client

# ---------- Etapa 2: imagen final ----------
FROM node:22-alpine

# Usuario standard de Hugging Face Spaces (UID 1000)
# node:22-alpine ya incluye el usuario "node" con UID 1000
ENV NODE_ENV=production
ENV HOME=/home/node
WORKDIR /app

COPY --from=build /app/package.json ./
COPY --from=build /app/package-lock.json ./
COPY --from=build /app/server/package.json server/package.json
COPY --from=build /app/client/package.json client/package.json
COPY --from=build /app/node_modules node_modules/
COPY --from=build /app/shared shared/
COPY --from=build /app/server/src server/src/
COPY --from=build /app/client/dist client/dist/

# Huella única de versión por build → el cliente la detecta para avisar actualizaciones (PWA)
RUN printf '{"ts":"%s"}' "$(date +%s%N)" > client/dist/build_info.json

# Carpeta de datos persistente, accesible por todos
RUN mkdir -p /data && chmod 777 /data

ENV PORT=4000
ENV DATA_FILE=/data/db.json
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD wget -qO- http://127.0.0.1:4000/api/health || exit 1

USER node

CMD ["npm", "run", "start", "-w", "server"]