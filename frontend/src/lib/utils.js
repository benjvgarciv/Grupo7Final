/**
 * Formatea un número como precio en CLP (pesos chilenos).
 * Ej: 12990 → "$12.990"
 */
export function formatCLP(amount) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount ?? 0);
}

/**
 * Formatea una fecha ISO a formato chileno dd/mm/yyyy hh:mm
 */
export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}
