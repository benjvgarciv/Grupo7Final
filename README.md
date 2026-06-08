# Sistema POS — Evaluación de Módulo Cloud Computing

> **Instituto Profesional Virginia Gómez — 4° año Ingeniería (E) en Computación e Informática**
> Prof. Patricio Balboa

Sistema de Punto de Venta (POS) base para pymes chilenas. Esta aplicación es el **punto de partida monolítico** que cada equipo debe migrar a una arquitectura cloud moderna, resiliente y de alta disponibilidad.

---

## Stack tecnológico base

| Capa          | Tecnología                      |
|---------------|--------------------------------|
| Frontend      | Next.js 14 (React, App Router)  |
| Backend       | Node.js 18 + Express            |
| Base de Datos | PostgreSQL 14+                  |
| Autenticación | JWT con roles (admin / cajero)  |

---

## Módulos del sistema

| Módulo | Descripción | Acceso |
|--------|-------------|--------|
| **Dashboard** | KPIs: ventas del día, del mes, productos y clientes | Admin |
| **POS** | Carrito de compra, selección de cliente y método de pago | Admin / Cajero |
| **Productos** | CRUD con subida de imágenes y control de stock | Admin / Cajero |
| **Categorías** | Gestión de categorías de productos | Admin / Cajero |
| **Clientes** | CRUD con RUT chileno | Admin / Cajero |
| **Ventas** | Historial; anulación solo disponible para Admin | Admin / Cajero |
| **Reportes** | Gráficos de ventas por día, top productos y métodos de pago | Admin |
| **Usuarios** | Gestión de usuarios y roles | Admin |

---

## Estructura del proyecto

```
pos-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Conexión PostgreSQL
│   │   ├── controllers/             # Lógica de negocio
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── categoryController.js
│   │   │   ├── clientController.js
│   │   │   ├── saleController.js
│   │   │   ├── reportController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT activo + control de roles
│   │   │   └── upload.js            # Multer — almacenamiento local
│   │   ├── routes/                  # Definición de rutas REST
│   │   ├── app.js                   # Express app
│   │   └── server.js
│   ├── uploads/                     # ⚠️ Imágenes en disco local — migrar a S3
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/
│   │   │   └── (dashboard)/         # Layout con sidebar
│   │   │       ├── dashboard/
│   │   │       ├── pos/
│   │   │       ├── products/
│   │   │       ├── categories/
│   │   │       ├── clients/
│   │   │       ├── sales/
│   │   │       ├── reports/
│   │   │       └── users/
│   │   ├── components/
│   │   │   └── Sidebar.jsx          # Navegación filtrada por rol
│   │   └── lib/
│   │       ├── api.js               # Axios con interceptor JWT
│   │       └── utils.js             # Helpers (formatCLP, formatDate)
│   ├── jsconfig.json
│   ├── .env.local.example
│   └── package.json
├── database/
│   ├── schema.sql                   # DDL completo
│   ├── seed.sql                     # Datos de prueba
│   └── create-admin.js              # Script para crear usuarios iniciales
└── README.md
```

---

## Instalación y ejecución local

### Requisitos previos
- Node.js 18+
- PostgreSQL 14+
- npm

> Cada equipo elige cómo desplegar la aplicación: máquinas virtuales, contenedores, PaaS, etc. Las instrucciones siguientes corresponden a la ejecución directa con Node.js.

### 1 — Base de datos

```bash
# Crear la base de datos
createdb pos_db

# Ejecutar el schema
psql -d pos_db -f database/schema.sql

# Cargar datos de prueba
psql -d pos_db -f database/seed.sql
```

### 2 — Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# Crear usuarios iniciales (admin y cajero)
node ../database/create-admin.js

# Iniciar el servidor (desarrollo)
npm run dev
```

El backend queda disponible en `http://localhost:3001`

### 3 — Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local

# Iniciar el servidor (desarrollo)
npm run dev
```

El frontend queda disponible en `http://localhost:3000`

### Credenciales por defecto

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | `admin@pos.cl` | `admin123` |
| Cajero | `cajero@pos.cl` | `cajero123` |

---

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Iniciar sesión |
| `GET`  | `/api/auth/me` | Perfil del usuario autenticado |
| `GET`  | `/api/products` | Listar productos (filtros: `search`, `categoria_id`) |
| `POST` | `/api/products` | Crear producto (multipart/form-data) |
| `PUT`  | `/api/products/:id` | Actualizar producto |
| `DELETE` | `/api/products/:id` | Soft-delete producto |
| `GET`  | `/api/categories` | Listar categorías |
| `POST` | `/api/categories` | Crear categoría |
| `PUT`  | `/api/categories/:id` | Actualizar categoría |
| `GET`  | `/api/clients` | Listar clientes (filtro: `search`) |
| `POST` | `/api/clients` | Crear cliente |
| `PUT`  | `/api/clients/:id` | Actualizar cliente |
| `GET`  | `/api/sales` | Listar ventas |
| `GET`  | `/api/sales/:id` | Detalle de venta con items |
| `POST` | `/api/sales` | Crear venta (descuenta stock, transaccional) |
| `PUT`  | `/api/sales/:id/cancel` | Anular venta (repone stock) |
| `GET`  | `/api/reports/summary` | KPIs del dashboard |
| `GET`  | `/api/reports/sales-by-day` | Ventas por día (param: `days`) |
| `GET`  | `/api/reports/top-products` | Top productos (param: `limit`) |
| `GET`  | `/api/reports/sales-by-payment` | Distribución por método de pago |
| `GET`  | `/api/users` | Listar usuarios |
| `POST` | `/api/users` | Crear usuario |
| `PUT`  | `/api/users/:id` | Actualizar usuario |
| `DELETE` | `/api/users/:id` | Desactivar usuario |

---

## ⚠️ Limitaciones conocidas — TODO para los equipos

Este sistema fue desarrollado **intencionalmente** con las siguientes limitaciones que representan los desafíos típicos de un monolito sin preparación cloud. Identificarlas, justificarlas y resolverlas en la arquitectura cloud es parte central de la evaluación.

### Seguridad
- [ ] **Credenciales con fallback hardcodeado** — Si no existe `.env`, el código usa `postgres/postgres`. Ver `backend/src/config/database.js`
- [ ] **CORS permisivo** — `app.use(cors())` acepta cualquier origen. Ver `backend/src/app.js`
- [ ] **Sin validación de inputs** — Los controllers no validan tipos ni rangos (express-validator está instalado pero sin usar)
- [ ] **Sin rate limiting** — La API no tiene límite de peticiones por IP
- [ ] **Token en localStorage** — Vulnerable a XSS; en producción usar cookies HttpOnly

### Disponibilidad
- [ ] **Sin health check** — No existe `GET /health`; necesario para ALB, ECS, Kubernetes
- [ ] **Sin SSL en BD** — La conexión a PostgreSQL no usa TLS (requerido en RDS, Cloud SQL, etc.)
- [ ] **Sin clustering** — Un solo proceso Node.js; sin PM2, ECS tasks o pods de Kubernetes
- [ ] **Sin reintentos de conexión** — Si la BD se reinicia, el proceso muere

### Almacenamiento
- [ ] **Imágenes en disco local** — `backend/uploads/` es incompatible con múltiples instancias. Migrar a S3 / GCS / Azure Blob + CDN

### Observabilidad
- [ ] **Solo console.log** — Sin logging estructurado (Winston, Pino); no integrable con CloudWatch, Stackdriver, etc.
- [ ] **Sin métricas** — Sin instrumentación para Prometheus/Grafana o herramientas cloud equivalentes

### Configuración
- [ ] **Sin secrets management** — No integra AWS Secrets Manager, Azure Key Vault ni GCP Secret Manager
- [ ] **Sin variables de entorno para producción** — Faltan variables críticas (ver `.env.example`)

---

## Esquema de base de datos

```
roles ─────────── usuarios
                     │
categorias ─── productos
                     │
clientes ───── ventas ──── detalle_ventas ── productos
                 │
               usuarios
```

---

## Entregables de la evaluación (recordatorio)

- [ ] Diagrama de arquitectura cloud detallado
- [ ] Repositorio GitHub con todo el código de implementación
- [ ] URL funcional del sistema desplegado
- [ ] Bitácora de avances (Scrum board / Trello)
- [ ] Presentación: problemática → arquitectura propuesta → decisiones técnicas → demo
