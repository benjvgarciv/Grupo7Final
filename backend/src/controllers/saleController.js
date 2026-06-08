const pool = require('../config/database');

const getAll = async (req, res) => {
  try {
    const { desde, hasta, estado } = req.query;
    const params = [];
    let query = `
      SELECT v.*,
             u.nombre AS cajero_nombre,
             c.nombre AS cliente_nombre,
             c.rut    AS cliente_rut
      FROM ventas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE 1=1
    `;
    if (estado) { params.push(estado);  query += ` AND v.estado = $${params.length}`; }
    if (desde)  { params.push(desde);   query += ` AND v.created_at >= $${params.length}`; }
    if (hasta)  { params.push(hasta);   query += ` AND v.created_at <= $${params.length}`; }
    query += ' ORDER BY v.created_at DESC LIMIT 200';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const venta = await pool.query(
      `SELECT v.*, u.nombre AS cajero_nombre, c.nombre AS cliente_nombre, c.rut AS cliente_rut
       FROM ventas v
       LEFT JOIN usuarios u ON v.usuario_id = u.id
       LEFT JOIN clientes c ON v.cliente_id = c.id
       WHERE v.id = $1`,
      [req.params.id]
    );
    if (!venta.rows.length) return res.status(404).json({ error: 'Venta no encontrada.' });

    const detalle = await pool.query(
      `SELECT dv.*, p.nombre AS producto_nombre
       FROM detalle_ventas dv
       LEFT JOIN productos p ON dv.producto_id = p.id
       WHERE dv.venta_id = $1`,
      [req.params.id]
    );

    res.json({ ...venta.rows[0], items: detalle.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/sales
 * Body: { cliente_id, metodo_pago, notas, items: [{ producto_id, cantidad, precio_unitario }] }
 */
const create = async (req, res) => {
  const client = await pool.connect();
  try {
    const { cliente_id, metodo_pago = 'efectivo', notas, items } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'La venta debe tener al menos un producto.' });
    }

    await client.query('BEGIN');

    // Verificar stock y calcular total
    let total = 0;
    for (const item of items) {
      const prod = await client.query(
        'SELECT id, stock, precio FROM productos WHERE id = $1 AND activo = true',
        [item.producto_id]
      );
      if (!prod.rows.length) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: `Producto ID ${item.producto_id} no encontrado.` });
      }
      if (prod.rows[0].stock < item.cantidad) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Stock insuficiente para producto ID ${item.producto_id}.` });
      }
      total += item.precio_unitario * item.cantidad;
    }

    // Crear venta (usuario_id desde req.user cuando auth esté implementado)
    const ventaResult = await client.query(
      `INSERT INTO ventas (usuario_id, cliente_id, total, metodo_pago, notas)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user?.id || null, cliente_id || null, total, metodo_pago, notas || null]
    );
    const venta = ventaResult.rows[0];

    // Insertar detalle y descontar stock
    for (const item of items) {
      const subtotal = item.precio_unitario * item.cantidad;
      await client.query(
        `INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [venta.id, item.producto_id, item.cantidad, item.precio_unitario, subtotal]
      );
      await client.query(
        'UPDATE productos SET stock = stock - $1, updated_at = NOW() WHERE id = $2',
        [item.cantidad, item.producto_id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(venta);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

const cancel = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ventaResult = await client.query('SELECT * FROM ventas WHERE id = $1', [req.params.id]);
    if (!ventaResult.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Venta no encontrada.' });
    }
    if (ventaResult.rows[0].estado === 'anulada') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'La venta ya está anulada.' });
    }

    // Reponer stock
    const detalle = await client.query(
      'SELECT * FROM detalle_ventas WHERE venta_id = $1',
      [req.params.id]
    );
    for (const item of detalle.rows) {
      await client.query(
        'UPDATE productos SET stock = stock + $1, updated_at = NOW() WHERE id = $2',
        [item.cantidad, item.producto_id]
      );
    }

    await client.query("UPDATE ventas SET estado = 'anulada' WHERE id = $1", [req.params.id]);
    await client.query('COMMIT');
    res.json({ message: 'Venta anulada correctamente.' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

module.exports = { getAll, getById, create, cancel };
