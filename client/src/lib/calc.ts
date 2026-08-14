/**
 * Utilidades de formato de montos para la calculadora de tasa.
 * Formato venezolano: miles con ".", decimales con "," (ej: 1.000,50).
 */

/** Máscara de entrada: autoformatea miles y permite decimales tras "," */
export function maskAmount(raw: string): string {
  let s = raw.replace(/[^\d,]/g, '');
  const commaIdx = s.indexOf(',');
  let intPart = s;
  let decPart = '';
  if (commaIdx !== -1) {
    intPart = s.slice(0, commaIdx);
    decPart = s.slice(commaIdx + 1).replace(/\D/g, '').slice(0, 2);
  }
  intPart = intPart.replace(/^0+(?=\d)/, '');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (commaIdx === -1) return grouped;
  return decPart ? `${grouped},${decPart}` : `${grouped},`;
}

/** Convierte el texto formateado (1.000,50) a número */
export function parseAmount(s: string): number {
  const n = Number(s.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

/** Formatea un número con el separador venezolano, sin ceros sobrantes */
export function formatAmountValue(n: number, maxDec = 2): string {
  if (!Number.isFinite(n)) return '0';
  return n
    .toLocaleString('es-VE', { maximumFractionDigits: maxDec })
    .replace(/,0+$/, '');
}