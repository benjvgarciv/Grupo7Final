'use client';
import { useState } from 'react';

const CATEGORY_COLORS = {
  'Base de Datos':   { bg: 'bg-blue-50',   border: 'border-blue-200',  title: 'text-blue-800',  badge: 'bg-blue-100 text-blue-700'  },
  'Alta Disponibilidad': { bg: 'bg-purple-50', border: 'border-purple-200', title: 'text-purple-800', badge: 'bg-purple-100 text-purple-700' },
  'Almacenamiento':  { bg: 'bg-amber-50',  border: 'border-amber-200', title: 'text-amber-800', badge: 'bg-amber-100 text-amber-700'  },
  'Seguridad':       { bg: 'bg-red-50',    border: 'border-red-200',   title: 'text-red-800',   badge: 'bg-red-100 text-red-700'     },
  'Observabilidad':  { bg: 'bg-green-50',  border: 'border-green-200', title: 'text-green-800', badge: 'bg-green-100 text-green-700' },
};

function ScoreRing({ pct }) {
  const r   = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 75 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626';

  return (
    <svg width="140" height="140" className="rotate-[-90deg]">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
      <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      <text x="70" y="75" textAnchor="middle" dominantBaseline="middle"
        style={{ fill: color, fontSize: 28, fontWeight: 700, transform: 'rotate(90deg)', transformOrigin: '70px 70px' }}>
        {pct}%
      </text>
    </svg>
  );
}

function CategoryCard({ name, data }) {
  const [open, setOpen] = useState(true);
  const c = CATEGORY_COLORS[name] || { bg: 'bg-gray-50', border: 'border-gray-200', title: 'text-gray-800', badge: 'bg-gray-100 text-gray-700' };
  const catPct = Math.round((data.pts / data.maxPts) * 100);

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className={`font-bold text-base ${c.title}`}>{name}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
            {data.pts}/{data.maxPts} pts
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
            {catPct}%
          </span>
        </div>
        <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-gray-200 divide-y divide-gray-100">
          {data.items.map((item, i) => (
            <div key={i} className="px-5 py-3 flex items-start gap-3 bg-white/70">
              <span className={`mt-0.5 text-lg leading-none ${item.pass ? 'text-green-500' : 'text-red-400'}`}>
                {item.pass ? '✓' : '✗'}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${item.pass ? 'text-gray-900' : 'text-gray-500'}`}>
                  {item.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono break-all">{item.detail}</p>
              </div>
              <span className={`text-xs font-bold shrink-0 ${item.pass ? 'text-green-600' : 'text-red-400'}`}>
                {item.pts}/{item.maxPts}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EvalPage() {
  const [key, setKey]       = useState('');
  const [url, setUrl]       = useState('');
  const [report, setReport] = useState(null);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const fetchReport = async (e) => {
    e.preventDefault();
    setError('');
    setReport(null);
    setLoading(true);

    // Llamada directa al backend del equipo (URL externa)
    const baseURL = url.replace(/\/+$/, '');
    try {
      const res = await fetch(`${baseURL}/api/eval`, {
        headers: { 'x-eval-key': key },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      setReport(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center pt-4">
          <p className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-1">
            Evaluación de Módulo — Cloud Computing
          </p>
          <h1 className="text-3xl font-black text-white">Panel de Evaluación Docente</h1>
          <p className="text-gray-400 text-sm mt-1">
            Instituto Profesional Virginia Gómez — Uso exclusivo del docente
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={fetchReport} className="bg-gray-800 rounded-2xl p-6 space-y-4 border border-gray-700">
          <h2 className="font-semibold text-gray-200">Conectar al sistema del equipo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">URL del backend del equipo</label>
              <input
                required
                type="url"
                placeholder="https://backend.equipo.example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Clave de evaluación (EVAL_SECRET)</label>
              <input
                required
                type="password"
                placeholder="••••••••••••"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          {error && (
            <div className="text-red-400 text-sm bg-red-900/30 border border-red-800 rounded-lg px-4 py-2">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm"
          >
            {loading ? 'Evaluando...' : 'Evaluar sistema'}
          </button>
        </form>

        {/* Resultados */}
        {report && (
          <div className="space-y-5">

            {/* Meta + Score */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 flex flex-col sm:flex-row items-center gap-6">
              <ScoreRing pct={report.score.pct} />
              <div className="flex-1 space-y-1">
                <p className="text-2xl font-black text-white">
                  {report.score.total} / {report.score.max} puntos
                </p>
                <p className={`text-lg font-bold ${report.score.pct >= 75 ? 'text-green-400' : report.score.pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {report.score.pct >= 75 ? 'Implementación lograda' : report.score.pct >= 50 ? 'Implementación parcial' : 'Implementación insuficiente'}
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-xs text-gray-400 mt-2 font-mono">
                  <span>Hostname: <span className="text-gray-200">{report.meta.hostname}</span></span>
                  <span>Node.js: <span className="text-gray-200">{report.meta.nodeVersion}</span></span>
                  <span>Entorno: <span className={report.meta.nodeEnv === 'production' ? 'text-green-400 font-bold' : 'text-amber-400'}>{report.meta.nodeEnv}</span></span>
                  <span>Uptime: <span className="text-gray-200">{report.meta.uptime}</span></span>
                  <span>Puerto: <span className="text-gray-200">{report.meta.port}</span></span>
                  <span>Fecha eval: <span className="text-gray-200">{new Date(report.meta.timestamp).toLocaleString('es-CL')}</span></span>
                </div>
              </div>
            </div>

            {/* Barra de progreso por categoría */}
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <h2 className="font-semibold text-gray-200 mb-4">Resumen por categoría</h2>
              <div className="space-y-3">
                {Object.entries(report.byCategory).map(([cat, data]) => {
                  const pct = Math.round((data.pts / data.maxPts) * 100);
                  const c = CATEGORY_COLORS[cat] || {};
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-300">{cat}</span>
                        <span className="text-gray-400 font-mono">{data.pts}/{data.maxPts} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`h-full rounded-full transition-all duration-700 ${pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detalle por categoría */}
            <div className="space-y-3">
              {Object.entries(report.byCategory).map(([cat, data]) => (
                <CategoryCard key={cat} name={cat} data={data} />
              ))}
            </div>

            {/* Pie */}
            <p className="text-center text-xs text-gray-600 pb-4">
              Evaluación automática — Sistema POS · Prof. Patricio Balboa · {new Date().getFullYear()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
