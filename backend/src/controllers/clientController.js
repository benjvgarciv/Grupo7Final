const pool = require('../config/database');

const getAll = async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM clientes WHERE activo = true';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (nombre ILIKE $1 OR rut ILIKE $1 OR email ILIKE $1)`;
    }
    query += ' ORDER BY nombre';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Cliente no encontrado.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { rut, nombre, email, telefono, direccion } = req.body;
    // TODO: Validar formato de RUT chileno (dígito verificador)
    if (!rut || !nombre) return res.status(400).json({ error: 'RUT y nombre son requeridos.' });

    const result = await pool.query(
      `INSERT INTO clientes (rut, nombre, email, telefono, direccion)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [rut, nombre, email || null, telefono || null, direccion || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'El RUT ya está registrado.' });
    res.status(500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { nombre, email, telefono, direccion } = req.body;
    const result = await pool.query(
      `UPDATE clientes
       SET nombre    = COALESCE($1, nombre),
           email     = COALESCE($2, email),
           telefono  = COALESCE($3, telefono),
           direccion = COALESCE($4, direccion)
       WHERE id = $5 RETURNING *`,
      [nombre, email, telefono, direccion, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Cliente no encontrado.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await pool.query('UPDATE clientes SET activo = false WHERE id = $1', [req.params.id]);
    res.json({ message: 'Cliente desactivado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
