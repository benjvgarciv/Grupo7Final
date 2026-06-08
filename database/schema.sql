-- ============================================================
-- SISTEMA POS - ESQUEMA DE BASE DE DATOS
-- PostgreSQL 14+
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ROLES
-- ============================================================
CREATE TABLE roles (
  id   SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles (nombre) VALUES ('admin'), ('cajero');

-- ============================================================
-- USUARIOS
-- ============================================================
CREATE TABLE usuarios (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol_id        INTEGER REFERENCES roles(id) ON DELETE SET NULL,
  activo        BOOLEAN DEFAULT true,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- CATEGORÍAS
-- ============================================================
CREATE TABLE categorias (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo      BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- PRODUCTOS
-- ============================================================
CREATE TABLE productos (
  id           SERIAL PRIMARY KEY,
  nombre       VARCHAR(200) NOT NULL,
  descripcion  TEXT,
  precio       INTEGER NOT NULL CHECK (precio >= 0),  -- En CLP (sin decimales)
  stock        INTEGER DEFAULT 0 CHECK (stock >= 0),
  categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
  imagen_url   VARCHAR(500),
  activo       BOOLEAN DEFAULT true,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- CLIENTES
-- ============================================================
CREATE TABLE clientes (
  id         SERIAL PRIMARY KEY,
  rut        VARCHAR(12) UNIQUE NOT NULL, -- Formato: 12345678-9
  nombre     VARCHAR(150) NOT NULL,
  email      VARCHAR(150),
  telefono   VARCHAR(20),
  direccion  TEXT,
  activo     BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- VENTAS
-- ============================================================
CREATE TABLE ventas (
  id          SERIAL PRIMARY KEY,
  usuario_id  INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  cliente_id  INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
  total       INTEGER NOT NULL CHECK (total >= 0), -- En CLP
  metodo_pago VARCHAR(50) DEFAULT 'efectivo',       -- efectivo | debito | credito | transferencia
  estado      VARCHAR(50) DEFAULT 'completada',     -- completada | anulada
  notas       TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- DETALLE DE VENTAS
-- ============================================================
CREATE TABLE detalle_ventas (
  id               SERIAL PRIMARY KEY,
  venta_id         INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id      INTEGER REFERENCES productos(id) ON DELETE SET NULL,
  cantidad         INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario  INTEGER NOT NULL CHECK (precio_unitario >= 0),
  subtotal         INTEGER NOT NULL CHECK (subtotal >= 0)
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_ventas_usuario      ON ventas(usuario_id);
CREATE INDEX idx_ventas_cliente      ON ventas(cliente_id);
CREATE INDEX idx_ventas_created_at   ON ventas(created_at);
CREATE INDEX idx_detalle_venta       ON detalle_ventas(venta_id);
CREATE INDEX idx_detalle_producto    ON detalle_ventas(producto_id);
