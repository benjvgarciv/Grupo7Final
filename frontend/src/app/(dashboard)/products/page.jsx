'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { formatCLP } from '@/lib/utils';

const EMPTY = { nombre: '', descripcion: '', precio: '', stock: '', categoria_id: '', imagen: null };

export default function ProductsPage() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch]         = useState('');
  const [modal, setModal]           = useState(null); // null | 'create' | product object
  const [form, setForm]             = useState(EMPTY);
  const [saving, setSaving]         = useState(false);

  const load = useCallback(() => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    api.get(`/products${params}`).then((r) => setProducts(r.data)).catch(console.error);
  }, [search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data)).catch(console.error);
  }, []);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit   = (p) => {
    setForm({ nombre: p.nombre, descripcion: p.descripcion || '', precio: p.precio, stock: p.stock, categoria_id: p.categoria_id || '', imagen: null });
    setModal(p);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (k !== 'imagen' && v !== '') fd.append(k, v); });
      if (form.imagen) fd.append('imagen', form.imagen);

      if (modal === 'create') {
        await api.post('/products', fd);
      } else {
        await api.put(`/products/${modal.id}`, fd);
      }
      setModal(null);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar este producto?')) return;
    await api.delete(`/products/${id}`).catch(console.error);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <button onClick={openCreate} className="btn-primary">+ Nuevo producto</button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Buscar..."
          className="input max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="table-header">Nombre</th>
              <th className="table-header">Categoría</th>
              <th className="table-header">Precio</th>
              <th className="table-header">Stock</th>
              <th className="table-header">Estado</th>
              <th className="table-header">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.length === 0 && (
              <tr><td colSpan={6} className="table-cell text-center text-gray-400 py-8">Sin productos</td></tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="table-cell font-medium">{p.nombre}</td>
                <td className="table-cell text-gray-500">{p.categoria_nombre || '—'}</td>
                <td className="table-cell font-semibold">{formatCLP(p.precio)}</td>
                <td className="table-cell">
                  <span className={p.stock < 5 ? 'text-red-600 font-semibold' : ''}>{p.stock}</span>
                </td>
                <td className="table-cell">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="table-cell">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="text-indigo-600 hover:underline text-sm">Editar</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline text-sm">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">{modal === 'create' ? 'Nuevo Producto' : 'Editar Producto'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input required className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea className="input" rows={2} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio (CLP) *</label>
                  <input required type="number" min="0" className="input" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input type="number" min="0" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select className="input" value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}>
                  <option value="">Sin categoría</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                <input type="file" accept="image/*" className="text-sm text-gray-600"
                  onChange={(e) => setForm({ ...form, imagen: e.target.files[0] })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Guardando...' : 'Guardar'}</button>
                <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
