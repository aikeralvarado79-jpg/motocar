---
title: MotoCar Parts Pro Elite
emoji: 🚗
colorFrom: indigo
colorTo: slate
sdk: docker
app_port: 4000
---

# 🚗 MotoCar Parts Pro Elite

Tienda de autopartes premium (carros y motos) con **doble etiquetado USD/VES**, panel de administración, **servidor propio**, **tiempo real multi-dispositivo (Socket.IO)**, persistencia en JSON y acceso desde dispositivos móviles en la misma red Wi-Fi o desde internet (desplegado en la nube).

---

## 🧱 Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS v4 + React Router |
| Backend | Node.js + Express + Socket.IO |
| Persistencia | Archivo JSON (se crea automáticamente) |
| Tiempo real | Socket.IO (pedidos, stock, tasas y productos) |
| Monorepo | npm workspaces (`server`, `client`, `shared`) |
| Contenedor | Dockerfile multi-etapa listo para despliegue |

---

## 📁 Estructura del Proyecto

```
perso/
├── package.json              # Scripts raíz + workspaces
├── Dockerfile                # Imagen de producción (Northflank/Docker)
├── .dockerignore
├── shared/
│   └── types.ts              # Tipos TypeScript compartidos (server + client)
├── server/
│   ├── .env.example
│   ├── data/                 # db.json se genera automáticamente aquí
│   └── src/
│       ├── index.ts          # Entrada HTTP + Socket.IO (escucha 0.0.0.0)
│       ├── app.ts            # Express app + SPA estática + manejo de errores
│       ├── config.ts         # Configuración por variables de entorno
│       ├── store.ts          # Store JSON (lectura/escritura atómica) + stats
│       ├── seed.ts           # Datos iniciales (productos, pedidos, tasas)
│       ├── auth.ts           # Sesiones con token (Bearer)
│       ├── broadcast.ts      # Emisor global de eventos Socket.IO
│       └── routes/           # auth, products, orders, transactions, rates, stats
└── client/
    ├── index.html
    ├── public/               # manifest.webmanifest + icon.svg
    └── src/
        ├── main.tsx / App.tsx
        ├── index.css         # Tailwind v4 + estilos globales
        ├── lib/              # api.ts, socket.ts, session.ts, format.ts
        ├── context/          # Theme, Toast, Auth, Store (tiempo real)
        ├── components/       # layout, ui, modals, ProductCard
        └── pages/            # Catálogo, Carrito, Pedidos, Login, admin/*
```

---

## ✅ Requisitos

- **Node.js 20+** (recomendado LTS 22/24).
- Para desplegar: una cuenta **GitHub** y una cuenta **Northflank** (plan gratuito Sandbox, sin tarjeta).

---

## 🚀 Instalación

```bash
npm install
```

---

## ▶️ Modo Desarrollo (con recarga en vivo)

```bash
npm run dev
```

- Servidor API + WebSocket → `http://localhost:4000`
- Cliente Vite → `http://localhost:5173`

Para **abrir desde tu móvil** (misma red Wi-Fi): `npm run lan` te muestra la IP local; abre `http://<IP>:5173`.

---

## 🏭 Modo Producción (local)

```bash
npm run build   # Compila el cliente en client/dist
npm start       # El servidor sirve API + WebSocket + cliente en :4000
```

---

## ☁️ Despliegue en Northflank (gratis, URL fija)

El proyecto incluye un `Dockerfile` listo. El plan **Sandbox** de Northflank es gratuito e incluye **2 servicios** y **almacenamiento persistente**.

### 1. Sube el código a GitHub

1. Crea un repositorio nuevo en GitHub (público o privado), por ejemplo `motocar`.
2. En tu PC, dentro de la carpeta del proyecto:

```bash
git init
git add .
git commit -m "MotoCar Parts Pro Elite"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/motocar.git
git push -u origin main
```

### 2. Crea el servicio en Northflank

1. Entra en <https://app.northflank.com> y crea una cuenta (plan Sandbox, gratis).
2. Ve a **Services → New Service** y selecciona tu repositorio de GitHub.
3. Northflank detectará el **Dockerfile** automáticamente.
4. Ajusta el servicio:
   - **Port**: `4000`
   - En **Environment Variables**: ninguna extra (los valores por defecto ya sirven).
5. Haz clic en **Deploy**. Cuando termine, tendrás una URL fija tipo:

```
https://motocar-xxxx.code.run
```

### 3. Configura el almacenamiento persistente (importante)

Para que pedidos/stock/tasas **no se borren al reiniciar**:

1. En tu servicio, ve a **Volumes → Add volume**.
2. **Mount path**: `/data` (igual a `DATA_FILE=/data/db.json`).
3. En **Environment Variables** verifica que exista: `DATA_FILE=/data/db.json`.

> El archivo `db.json` se crea solo la primera vez, con los datos iniciales.

### 4. Accede

- Abre tu URL fija desde cualquier dispositivo (móvil con datos, otra PC, etc.).
- Panel admin: `https://TU_URL/api/...` — login en la app con `admin` / `motocar123`.

---

## 🔐 Credenciales Administrador

- Usuario: `admin`
- Contraseña: `motocar123`

Se cambian con variables de entorno en Northflank: `ADMIN_USERNAME` y `ADMIN_PASSWORD`.

---

## ⚙️ Variables de Entorno (`server/.env` o Northflank)

```env
PORT=4000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=motocar123
DATA_FILE=/data/db.json   # en Northflank apunta al volumen persistente
```

---

## 🔌 API REST

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | Público | Inicia sesión admin y devuelve `token` |
| GET | `/api/auth/me` | Admin | Valida el token |
| GET | `/api/products` | Público | Lista de repuestos |
| POST | `/api/products` | Admin | Crea repuesto |
| PUT | `/api/products/:id` | Admin | Actualiza repuesto |
| DELETE | `/api/products/:id` | Admin | Elimina repuesto |
| GET | `/api/orders?customerId=` | Público/Admin | Pedidos (cliente ve los suyos; admin ve todos) |
| POST | `/api/orders` | Público | Crea pedido (valida y descuenta stock) |
| PATCH | `/api/orders/:id/status` | Admin | Cambia estado |
| GET | `/api/transactions` | Admin | Movimientos financieros |
| GET | `/api/stats` | Admin | Métricas calculadas |
| GET | `/api/rates` | Público | Tasa BCV vigente + historial |
| PUT | `/api/rates` | Admin | Actualiza tasa |
| GET | `/api/health` | Público | Estado del servidor |

## 🔔 Eventos Socket.IO (tiempo real)

`order:created`, `order:updated`, `product:created`, `product:updated`, `product:deleted`, `stock:changed`, `transaction:created`, `rate:updated`.

---

## 📄 Licencia

MIT — Proyecto de demostración para MotoCar Parts Pro Elite.
