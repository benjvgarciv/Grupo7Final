/**
 * Script para crear el usuario administrador inicial.
 * Ejecutar DESPUÉS de schema.sql y seed.sql:
 *
 *   node database/create-admin.js
 *
 * Requiere que el backend esté configurado (backend/.env con credenciales de BD).
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'pos_db',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function createAdmin() {
  const adminHash   = await bcrypt.hash('admin123', 10);
  const cajeroHash  = await bcrypt.hash('cajero123', 10);

  await pool.query(`
    INSERT INTO usuarios (nombre, email, password_hash, rol_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
  `, ['Administrador', 'admin@pos.cl', adminHash, 1]);

  await pool.query(`
    INSERT INTO usuarios (nombre, email, password_hash, rol_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
  `, ['Cajero Demo', 'cajero@pos.cl', cajeroHash, 2]);

  console.log('✓ Usuarios creados:');
  console.log('  Admin  → admin@pos.cl   / admin123');
  console.log('  Cajero → cajero@pos.cl  / cajero123');
  await pool.end();
}

createAdmin().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
