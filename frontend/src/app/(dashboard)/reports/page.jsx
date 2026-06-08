'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCLP } from '@/lib/utils';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ReportsPage() {
  const [salesByDay, setSalesByDay]     = useState([]);
  const [topProducts, setTopProducts]   = useState([]);
  const [byPayment, setByPayment]       = useState([]);
  const [days, setDays]                 = useState(30);

  useEffect(() => {
    Promise.all([
      api.get(`/reports/sales-by-day?days=${days}`),
      api.get('/reports/top-products?limit=8'),
      api.get('/reports/sales-by-payment'),
    ]).then(([d, tp, bp]) => {
      setSalesByDay(d.data);
      setTopProducts(tp.data);
      setByPayment(bp.data);
    }).catch(console.error);
  }, [days]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <select className="input w-36" value={days} onChange={(e) => setDays(e.target.value)}>
          <option value={7}>Últimos 7 días</option>
          <option value={30}>Últimos 30 días</option>
          <option value={90}>Últimos 90 días</option>
        </select>
      </div>

      {/* Ventas por día */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Ingresos por día (CLP)</h2>
        {salesByDay.length === 0
          ? <p className="text-center text-gray-400 py-10">Sin datos para el período seleccionado</p>
          : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={salesByDay} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} tickFormatter={(v) => v?.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [formatCLP(v), 'Ingresos']} labelFormatter={(l) => `Fecha: ${l}`} />
                <Bar dataKey="monto" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top productos */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Productos más vendidos (unidades)</h2>
          {topProducts.length === 0
            ? <p className="text-center text-gray-400 py-10">Sin datos</p>
            : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topProducts} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="nombre" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [v, 'Unidades']} />
                  <Bar dataKey="unidades_vendidas" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
        </div>

        {/* Por método de pago */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Ventas por método de pago</h2>
          {byPayment.length === 0
            ? <p className="text-center text-gray-400 py-10">Sin datos</p>
            : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={byPayment}
                    dataKey="monto"
                    nameKey="metodo_pago"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ metodo_pago, percent }) => `${metodo_pago} ${(percent * 100).toFixed(0)}%`}
                  >
                    {byPayment.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCLP(v)} />
                </PieChart>
              </ResponsiveContainer>
            )}
        </div>
      </div>
    </div>
  );
}
