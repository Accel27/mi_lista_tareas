// ============================================================
// UTILIDADES DE FECHAS
// Funciones para formatear fechas de forma consistente en la UI.
// Trabajamos con ISO strings ("2026-09-20T15:30:00.000Z")
// porque es el formato que guardamos en AsyncStorage.
// ============================================================

/**
 * Formatea una fecha ISO a texto legible para el usuario.
 * Ej: "20 sep 2026, 15:30"
 */
export function formatearFechaHora(iso: string | null): string {
  if (!iso) return 'Sin fecha';

  const fecha = new Date(iso);
  if (isNaN(fecha.getTime())) return 'Fecha inválida';

  const opcionesFecha: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };

  const opcionesHora: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };

  const fechaTexto = fecha.toLocaleDateString('es-ES', opcionesFecha);
  const horaTexto = fecha.toLocaleTimeString('es-ES', opcionesHora);

  return `${fechaTexto}, ${horaTexto}`;
}

/**
 * Devuelve texto relativo amigable:
 * - "Hoy", "Mañana", "Ayer"
 * - "En 3 dias" / "Hace 2 dias"
 * - O el formato completo si es muy lejano
 */
export function formatearFechaRelativa(iso: string | null): string {
  if (!iso) return 'Sin fecha';

  const fecha = new Date(iso);
  if (isNaN(fecha.getTime())) return 'Fecha inválida';

  const ahora = new Date();
  const diffDias = Math.round(
    (inicioDelDia(fecha).getTime() - inicioDelDia(ahora).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (diffDias === 0) return 'Hoy';
  if (diffDias === 1) return 'Mañana';
  if (diffDias === -1) return 'Ayer';
  if (diffDias > 1 && diffDias <= 7) return `En ${diffDias} días`;
  if (diffDias < -1 && diffDias >= -7)
    return `Hace ${Math.abs(diffDias)} días`;

  return formatearFechaHora(iso);
}

/**
 * Compara si una fecha ya paso (para marcar tareas vencidas).
 */
export function esFechaVencida(iso: string | null): boolean {
  if (!iso) return false;
  const fecha = new Date(iso);
  if (isNaN(fecha.getTime())) return false;
  return fecha.getTime() < Date.now();
}

/**
 * Devuelve una fecha ISO con el dia y hora actuales.
 */
export function ahoraISO(): string {
  return new Date().toISOString();
}

/**
 * Devuelve una nueva fecha ISO con los dias sumados a la actual.
 */
export function sumarDiasISO(dias: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString();
}

/**
 * Devuelve cuantos dias faltan desde hoy hasta la fecha ISO dada.
 * Si la fecha ya paso, devuelve un numero negativo.
 */
export function diasHasta(iso: string): number {
  const objetivo = new Date(iso);
  if (isNaN(objetivo.getTime())) return 0;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  objetivo.setHours(0, 0, 0, 0);

  return Math.round(
    (objetivo.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
  );
}

// ------------------------------------------------------------
// HELPERS PRIVADOS
// ------------------------------------------------------------

/**
 * Devuelve la misma fecha pero a las 00:00:00 (inicio del dia).
 * Se usa para comparar dias sin importar la hora.
 */
function inicioDelDia(fecha: Date): Date {
  const copia = new Date(fecha);
  copia.setHours(0, 0, 0, 0);
  return copia;
}