// ============================================================
// UTILIDADES DE FILTRADO
// Logica pura para filtrar tareas. No tiene UI, solo recibe
// tareas y filtros, y devuelve las tareas que cumplen.
// ============================================================

import { FiltrosTarea, Tarea } from '../types';

/**
 * Estado inicial de los filtros (sin nada activo).
 */
export const FILTROS_INICIALES: FiltrosTarea = {
  busqueda: '',
  prioridades: [],
  estados: [],
  categoriaIds: [],
  fechaDesde: null,
  fechaHasta: null,
};

/**
 * Aplica todos los filtros a una lista de tareas.
 * Devuelve una nueva lista con las tareas que cumplen TODOS los filtros.
 */
export function aplicarFiltros(tareas: Tarea[], filtros: FiltrosTarea): Tarea[] {
  return tareas.filter((t) => {
    // --- Busqueda por texto (titulo o descripcion) ---
    if (filtros.busqueda.trim().length > 0) {
      const termino = filtros.busqueda.toLowerCase().trim();
      const coincide =
        t.titulo.toLowerCase().includes(termino) ||
        t.descripcion.toLowerCase().includes(termino);
      if (!coincide) return false;
    }

    // --- Prioridad ---
    if (
      filtros.prioridades.length > 0 &&
      !filtros.prioridades.includes(t.prioridad)
    ) {
      return false;
    }

    // --- Estado ---
    if (filtros.estados.length > 0 && !filtros.estados.includes(t.estado)) {
      return false;
    }

    // --- Categoria ---
    if (filtros.categoriaIds.length > 0) {
      if (!t.categoriaId || !filtros.categoriaIds.includes(t.categoriaId)) {
        return false;
      }
    }

    // --- Fecha desde ---
    if (filtros.fechaDesde) {
      if (!t.fechaVencimiento) return false;
      if (t.fechaVencimiento < filtros.fechaDesde) return false;
    }

    // --- Fecha hasta ---
    if (filtros.fechaHasta) {
      if (!t.fechaVencimiento) return false;
      if (t.fechaVencimiento > filtros.fechaHasta) return false;
    }

    return true;
  });
}

/**
 * Cuenta cuantos filtros activos hay (sin contar la busqueda).
 * Se usa para mostrar el badge rojo en el boton de filtros.
 */
export function contarFiltrosActivos(filtros: FiltrosTarea): number {
  let total = 0;
  total += filtros.prioridades.length;
  total += filtros.estados.length;
  total += filtros.categoriaIds.length;
  if (filtros.fechaDesde) total += 1;
  if (filtros.fechaHasta) total += 1;
  return total;
}