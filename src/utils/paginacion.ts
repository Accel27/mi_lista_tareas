// ============================================================
// UTILIDADES DE PAGINACION
// Logica pura para dividir una lista en paginas.
// ============================================================

/**
 * Calcula el total de paginas dado un total de items y
 * un tamano de pagina.
 */
export function calcularTotalPaginas(
  totalItems: number,
  tamanoPagina: number
): number {
  if (totalItems === 0) return 1;
  return Math.ceil(totalItems / tamanoPagina);
}

/**
 * Devuelve solo los items de la pagina indicada (1-indexed).
 */
export function obtenerPagina<T>(
  items: T[],
  pagina: number,
  tamanoPagina: number
): T[] {
  const inicio = (pagina - 1) * tamanoPagina;
  const fin = inicio + tamanoPagina;
  return items.slice(inicio, fin);
}

/**
 * Ajusta el numero de pagina si quedo fuera de rango.
 * Ejemplo: si estabas en la pagina 3 y ahora solo hay 2,
 * devuelve 2.
 */
export function ajustarPagina(
  paginaActual: number,
  totalPaginas: number
): number {
  if (paginaActual > totalPaginas) return totalPaginas;
  if (paginaActual < 1) return 1;
  return paginaActual;
}