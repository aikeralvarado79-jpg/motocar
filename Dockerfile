# ============================================================
# MotoCar Parts Pro Elite — Dockerfile de producción
# Construye el cliente (Vite) y ejecuta el servidor con tsx
# (el servidor no necesita compilarse a JS).
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
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/package.json ./
COPY --from=build /app/package-lock.json ./
COPY --from=build /app/server/package.json server/package.json
COPY --from=build /app/client/package.json client/package.json
COPY --from=build /app/node_modules node_modules/
COPY --from=build /app/shared shared/
COPY --from=build /app/server/src server/src/
COPY --from=build /app/client/dist client/dist/

# Volumen persistente: pedidos/stock/tasas se guardan aquí
ENV PORT=4000
ENV DATA_FILE=/data/db.json
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD wget -qO- http://127.0.0.1:4000/api/health || exit 1

CMD ["npm", "run", "start", "-w", "server"]
