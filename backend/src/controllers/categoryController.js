const pool = require('../config/database');

const getAll = async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categorias WHERE activo = true ORDER BY nombre'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es requerido.' });
    const result = await pool.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const result = await pool.query(
      'UPDATE categorias SET nombre = COALESCE($1, nombre), descripcion = COALESCE($2, descripcion) WHERE id = $3 RETURNING *',
      [nombre, descripcion, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Categoría no encontrada.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await pool.query('UPDATE categorias SET activo = false WHERE id = $1', [req.params.id]);
    res.json({ message: 'Categoría desactivada correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, create, update, remove };
