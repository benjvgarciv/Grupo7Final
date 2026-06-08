const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const getAll = async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.nombre, u.email, r.nombre AS rol, u.activo, u.created_at
       FROM usuarios u JOIN roles r ON u.rol_id = r.id
       ORDER BY u.nombre`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { nombre, email, password, rol_id } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol_id)
       VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol_id, activo, created_at`,
      [nombre, email, hash, rol_id || 2]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'El email ya está registrado.' });
    res.status(500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { nombre, email, password, rol_id, activo } = req.body;
    const fields = [];
    const values = [];

    if (nombre   !== undefined) { fields.push(`nombre = $${fields.length + 1}`);    values.push(nombre); }
    if (email    !== undefined) { fields.push(`email = $${fields.length + 1}`);     values.push(email); }
    if (rol_id   !== undefined) { fields.push(`rol_id = $${fields.length + 1}`);    values.push(rol_id); }
    if (activo   !== undefined) { fields.push(`activo = $${fields.length + 1}`);    values.push(activo); }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      fields.push(`password_hash = $${fields.length + 1}`);
      values.push(hash);
    }

    if (!fields.length) return res.status(400).json({ error: 'No hay campos para actualizar.' });

    fields.push(`updated_at = NOW()`);
    values.push(req.params.id);

    const result = await pool.query(
      `UPDATE usuarios SET ${fields.join(', ')} WHERE id = $${values.length}
       RETURNING id, nombre, email, rol_id, activo, updated_at`,
      values
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await pool.query('UPDATE usuarios SET activo = false WHERE id = $1', [req.params.id]);
    res.json({ message: 'Usuario desactivado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, create, update, remove };
