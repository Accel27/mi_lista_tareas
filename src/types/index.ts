// ============================================================
// TIPOS GLOBALES DEL PROYECTO
// Aqui se definen las "formas" de los datos que usaremos
// en toda la aplicacion. Es la base de todo.
// ============================================================

/**
 * Prioridad de una tarea.
 * Usamos una union de strings literales en lugar de un enum
 * porque TypeScript lo valida mejor y es mas liviano en JS.
 */
export type Prioridad = 'baja' | 'media' | 'alta';

/**
 * Estados posibles de una tarea.
 * El usuario podra cambiar entre ellos desde la UI.
 */
export type EstadoTarea = 'pendiente' | 'en-progreso' | 'completada' | 'cancelada';

/**
 * Una categoria es una etiqueta que el usuario crea
 * para agrupar tareas (Ej: Trabajo, Personal, Estudio).
 */
export interface Categoria {
  id: string;          // Identificador unico (generado con uuid o Date.now())
  nombre: string;      // Ej: "Trabajo"
  color: string;       // Hex, ej: "#FF5733"
}

/**
 * Representa UNA tarea del listado.
 */
export interface Tarea {
  id: string;                    // ID unico
  titulo: string;                // Titulo corto
  descripcion: string;           // Descripcion larga (puede estar vacia)
  prioridad: Prioridad;          // baja | media | alta
  estado: EstadoTarea;           // pendiente | en-progreso | completada | cancelada
  categoriaId: string | null;    // Referencia a una Categoria, o null si no tiene
  fechaVencimiento: string | null; // ISO string (ej: "2026-09-20T15:30:00"), o null si no tiene
  completada: boolean;           // Atajo: esta completada? (util para filtros rapidos)
  notificacionId: string | null; // ID de la notificacion programada (para cancelarla si se edita)
  creadaEn: string;              // ISO string - cuando se creo
  actualizadaEn: string;         // ISO string - ultima modificacion
}

/**
 * Una tarea eliminada (vive en la papelera).
 * Extiende Tarea, asi que tiene TODOS sus campos +
 * los especificos de la papelera.
 */
export interface TareaEliminada extends Tarea {
  eliminadaEn: string;           // ISO string - cuando se elimino
  expiraEn: string;              // ISO string - cuando se auto-elimina (7 dias despues)
}

/**
 * Filtros aplicables a la lista de tareas.
 * Todos son opcionales; si no se especifica uno, no filtra por el.
 */
export interface FiltrosTarea {
  busqueda: string;              // Texto libre (busca en titulo y descripcion)
  prioridades: Prioridad[];      // Ej: ['alta', 'media'] - si esta vacio, no filtra
  estados: EstadoTarea[];        // Ej: ['pendiente'] - si esta vacio, no filtra
  categoriaIds: string[];        // Ej: ['uuid-1', 'uuid-2'] - si esta vacio, no filtra
  fechaDesde: string | null;     // ISO string - rango de fechas
  fechaHasta: string | null;     // ISO string
}

/**
 * Modo de tema de la aplicacion.
 */
export type ModoTema = 'claro' | 'oscuro';

/**
 * Configuracion global de la app.
 * Se guarda en AsyncStorage y se carga al inicio.
 */
export interface Configuracion {
  modoTema: ModoTema;
  categorias: Categoria[];
  notificacionesActivas: boolean;
  minutosRecordatorio: number;   // Cuantos minutos antes avisar (10 por defecto)
}