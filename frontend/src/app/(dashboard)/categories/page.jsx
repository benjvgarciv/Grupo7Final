'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [modal, setModal]  = useState(null);
  const [form, setForm]    = useState({ nombre: '', descripcion: '' });
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/categories').then((r) => setCategories(r.data)).catch(console.error);
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ nombre: '', descripcion: '' }); setModal('create'); };
  const openEdit   = (c) => { setForm({ nombre: c.nombre, descripcion: c.descripcion || '' }); setModal(c); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') await api.post('/categories', form);
      else await api.put(`/categories/${modal.id}`, form);
      setModal(null);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar esta categoría?')) return;
    await api.delete(`/categories/${id}`).catch(console.error);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
        <button onClick={openCreate} className="btn-primary">+ Nueva categoría</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="table-header">Nombre</th>
              <th className="table-header">Descripción</th>
              <th className="table-header">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.length === 0 && (
              <tr><td colSpan={3} className="table-cell text-center text-gray-400 py-8">Sin categorías</td></tr>
            )}
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="table-cell font-medium">{c.nombre}</td>
                <td className="table-cell text-gray-500">{c.descripcion || '—'}</td>
                <td className="table-cell">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="text-indigo-600 hover:underline text-sm">Editar</button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:underline text-sm">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold mb-4">{modal === 'create' ? 'Nueva Categoría' : 'Editar Categoría'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input required className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input className="input" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
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
