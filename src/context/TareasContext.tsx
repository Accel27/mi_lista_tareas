// ============================================================
// CONTEXTO DE TAREAS
// Es el "cerebro" de la app: maneja el estado global de tareas,
// papelera y configuracion. Expone funciones CRUD a todas las
// pantallas via el hook useTareas().
//
// Integra notificaciones: al crear/editar/eliminar/restaurar
// tareas se programan o cancelan automaticamente segun la
// configuracion del usuario.
// ============================================================

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

import {
  Categoria,
  Configuracion,
  EstadoTarea,
  ModoTema,
  Prioridad,
  Tarea,
  TareaEliminada,
} from '../types';
import { CONFIGURACION_INICIAL, DIAS_EXPIRACION_PAPELERA } from '../constants';
import * as almacen from '../storage/asyncStorage';
import * as notificaciones from '../utils/notificaciones';

// ------------------------------------------------------------
// TIPOS
// ------------------------------------------------------------

export interface DatosNuevaTarea {
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  estado: EstadoTarea;
  categoriaId: string | null;
  fechaVencimiento: string | null;
  notificacionId?: string | null;
}

export interface DatosActualizacionTarea extends Partial<DatosNuevaTarea> {}

interface EstadoApp {
  tareas: Tarea[];
  papelera: TareaEliminada[];
  configuracion: Configuracion;
  cargando: boolean;
}

// ------------------------------------------------------------
// ACCIONES
// ------------------------------------------------------------

type Accion =
  | {
      type: 'CARGAR_DATOS';
      payload: {
        tareas: Tarea[];
        papelera: TareaEliminada[];
        configuracion: Configuracion;
      };
    }
  | { type: 'CREAR_TAREA'; payload: Tarea }
  | {
      type: 'ACTUALIZAR_TAREA';
      payload: { id: string; cambios: DatosActualizacionTarea };
    }
  | { type: 'MOVER_A_PAPELERA'; payload: TareaEliminada }
  | {
      type: 'RESTAURAR_TAREA';
      payload: { id: string; notificacionId: string | null };
    }
  | { type: 'ELIMINAR_PERMANENTE'; payload: string }
  | { type: 'VACIAR_PAPELERA' }
  | { type: 'LIMPIAR_EXPIRADAS'; payload: string[] }
  | { type: 'SET_MODO_TEMA'; payload: ModoTema }
  | { type: 'SET_NOTIFICACIONES'; payload: boolean }
  | { type: 'SET_MINUTOS_RECORDATORIO'; payload: number }
  | { type: 'AGREGAR_CATEGORIA'; payload: Categoria }
  | { type: 'ELIMINAR_CATEGORIA'; payload: string }
  | { type: 'BORRAR_TODO' };

// ------------------------------------------------------------
// ESTADO INICIAL
// ------------------------------------------------------------

const ESTADO_INICIAL: EstadoApp = {
  tareas: [],
  papelera: [],
  configuracion: CONFIGURACION_INICIAL,
  cargando: true,
};

// ------------------------------------------------------------
// REDUCER
// ------------------------------------------------------------

function reducer(estado: EstadoApp, accion: Accion): EstadoApp {
  switch (accion.type) {
    case 'CARGAR_DATOS':
      return {
        ...estado,
        tareas: accion.payload.tareas,
        papelera: accion.payload.papelera,
        configuracion: accion.payload.configuracion,
        cargando: false,
      };

    case 'CREAR_TAREA':
      return { ...estado, tareas: [accion.payload, ...estado.tareas] };

    case 'ACTUALIZAR_TAREA':
      return {
        ...estado,
        tareas: estado.tareas.map((t) =>
          t.id === accion.payload.id
            ? {
                ...t,
                ...accion.payload.cambios,
                actualizadaEn: new Date().toISOString(),
              }
            : t
        ),
      };

    case 'MOVER_A_PAPELERA':
      return {
        ...estado,
        tareas: estado.tareas.filter((t) => t.id !== accion.payload.id),
        papelera: [accion.payload, ...estado.papelera],
      };

    case 'RESTAURAR_TAREA': {
      const tareaEliminada = estado.papelera.find(
        (t) => t.id === accion.payload.id
      );
      if (!tareaEliminada) return estado;

      const { eliminadaEn, expiraEn, ...resto } = tareaEliminada;
      const tareaRestaurada: Tarea = {
        ...resto,
        notificacionId: accion.payload.notificacionId,
      };

      return {
        ...estado,
        tareas: [tareaRestaurada, ...estado.tareas],
        papelera: estado.papelera.filter(
          (t) => t.id !== accion.payload.id
        ),
      };
    }

    case 'ELIMINAR_PERMANENTE':
      return {
        ...estado,
        papelera: estado.papelera.filter((t) => t.id !== accion.payload),
      };

    case 'VACIAR_PAPELERA':
      return { ...estado, papelera: [] };

    case 'LIMPIAR_EXPIRADAS':
      return {
        ...estado,
        papelera: estado.papelera.filter(
          (t) => !accion.payload.includes(t.id)
        ),
      };

    case 'SET_MODO_TEMA':
      return {
        ...estado,
        configuracion: { ...estado.configuracion, modoTema: accion.payload },
      };

    case 'SET_NOTIFICACIONES':
      return {
        ...estado,
        configuracion: {
          ...estado.configuracion,
          notificacionesActivas: accion.payload,
        },
      };

    case 'SET_MINUTOS_RECORDATORIO':
      return {
        ...estado,
        configuracion: {
          ...estado.configuracion,
          minutosRecordatorio: accion.payload,
        },
      };

    case 'AGREGAR_CATEGORIA':
      return {
        ...estado,
        configuracion: {
          ...estado.configuracion,
          categorias: [...estado.configuracion.categorias, accion.payload],
        },
      };

    case 'ELIMINAR_CATEGORIA':
      return {
        ...estado,
        configuracion: {
          ...estado.configuracion,
          categorias: estado.configuracion.categorias.filter(
            (c) => c.id !== accion.payload
          ),
        },
        tareas: estado.tareas.map((t) =>
          t.categoriaId === accion.payload ? { ...t, categoriaId: null } : t
        ),
      };

    case 'BORRAR_TODO':
      return { ...ESTADO_INICIAL, cargando: false };

    default:
      return estado;
  }
}

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

function generarId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function calcularExpiracion(): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + DIAS_EXPIRACION_PAPELERA);
  return fecha.toISOString();
}

// ------------------------------------------------------------
// TIPO DEL CONTEXTO
// ------------------------------------------------------------

interface TareasContextValor {
  // Estado
  tareas: Tarea[];
  papelera: TareaEliminada[];
  configuracion: Configuracion;
  cargando: boolean;

  // CRUD
  crearTarea: (datos: DatosNuevaTarea) => Promise<Tarea>;
  actualizarTarea: (
    id: string,
    cambios: DatosActualizacionTarea
  ) => Promise<void>;
  eliminarTarea: (id: string) => Promise<void>;
  obtenerTareaPorId: (id: string) => Tarea | undefined;

  // Papelera
  restaurarTarea: (id: string) => Promise<void>;
  eliminarPermanentemente: (id: string) => Promise<void>;
  vaciarPapelera: () => Promise<void>;

  // Configuracion
  setModoTema: (modo: ModoTema) => void;
  setNotificaciones: (activas: boolean) => void;
  setMinutosRecordatorio: (minutos: number) => void;
  agregarCategoria: (nombre: string, color: string) => void;
  eliminarCategoria: (id: string) => void;

  // Reset
  borrarTodo: () => Promise<void>;
}

export const TareasContext = createContext<TareasContextValor | null>(null);

// ------------------------------------------------------------
// PROVIDER
// ------------------------------------------------------------

interface Props {
  children: React.ReactNode;
}

export function TareasProvider({ children }: Props) {
  const [estado, dispatch] = useReducer(reducer, ESTADO_INICIAL);

  // ----- Carga inicial -----
  useEffect(() => {
    async function cargar() {
      const [tareasGuardadas, papeleraGuardada, configGuardada] =
        await Promise.all([
          almacen.obtenerTareas(),
          almacen.obtenerPapelera(),
          almacen.obtenerConfiguracion(),
        ]);

      const ahora = new Date().toISOString();
      const papeleraLimpia = papeleraGuardada.filter((t) => t.expiraEn > ahora);

      dispatch({
        type: 'CARGAR_DATOS',
        payload: {
          tareas: tareasGuardadas,
          papelera: papeleraLimpia,
          configuracion: configGuardada ?? CONFIGURACION_INICIAL,
        },
      });
    }

    cargar();
  }, []);

  // ----- Pedir permisos de notificaciones al cargar -----
  useEffect(() => {
    if (estado.cargando) return;
    if (!estado.configuracion.notificacionesActivas) return;

    notificaciones.pedirPermisos().catch((error) => {
      console.warn('Error al pedir permisos de notificaciones:', error);
    });
  }, [estado.cargando, estado.configuracion.notificacionesActivas]);

  // ----- Persistencia automatica -----
  useEffect(() => {
    if (estado.cargando) return;
    almacen.guardarTareas(estado.tareas);
  }, [estado.tareas, estado.cargando]);

  useEffect(() => {
    if (estado.cargando) return;
    almacen.guardarPapelera(estado.papelera);
  }, [estado.papelera, estado.cargando]);

  useEffect(() => {
    if (estado.cargando) return;
    almacen.guardarConfiguracion(estado.configuracion);
  }, [estado.configuracion, estado.cargando]);

  // ----- CRUD con notificaciones -----

  const crearTarea = useCallback(
    async (datos: DatosNuevaTarea): Promise<Tarea> => {
      const ahora = new Date().toISOString();

      const tareaBase: Tarea = {
        id: generarId(),
        titulo: datos.titulo,
        descripcion: datos.descripcion,
        prioridad: datos.prioridad,
        estado: datos.estado,
        categoriaId: datos.categoriaId,
        fechaVencimiento: datos.fechaVencimiento,
        completada: datos.estado === 'completada',
        notificacionId: null,
        creadaEn: ahora,
        actualizadaEn: ahora,
      };

      // Programar notificaciones si aplica
      let notificacionId: string | null = null;
      if (
        estado.configuracion.notificacionesActivas &&
        tareaBase.fechaVencimiento
      ) {
        try {
          notificacionId = await notificaciones.programarNotificaciones(
            tareaBase,
            estado.configuracion.minutosRecordatorio
          );
        } catch (error) {
          console.warn('Error al programar notificaciones:', error);
        }
      }

      const nuevaTarea: Tarea = { ...tareaBase, notificacionId };
      dispatch({ type: 'CREAR_TAREA', payload: nuevaTarea });
      return nuevaTarea;
    },
    [
      estado.configuracion.notificacionesActivas,
      estado.configuracion.minutosRecordatorio,
    ]
  );

  const actualizarTarea = useCallback(
    async (id: string, cambios: DatosActualizacionTarea): Promise<void> => {
      const tareaActual = estado.tareas.find((t) => t.id === id);
      if (!tareaActual) return;

      // 1. Cancelar notificaciones previas
      if (tareaActual.notificacionId) {
        await notificaciones.cancelarNotificacionesDeTarea(
          tareaActual.notificacionId
        );
      }

      // 2. Sincronizar booleano completada
      const cambiosFinales: DatosActualizacionTarea = { ...cambios };
      if (cambios.estado) {
        cambiosFinales.completada = cambios.estado === 'completada';
      }

      // 3. Construir la tarea resultante (para reprogramar notif)
      const tareaResultante: Tarea = {
        ...tareaActual,
        ...cambiosFinales,
      };

      // 4. Reprogramar notificaciones
      let nuevoNotificacionId: string | null = null;
      if (
        estado.configuracion.notificacionesActivas &&
        tareaResultante.fechaVencimiento
      ) {
        try {
          nuevoNotificacionId = await notificaciones.programarNotificaciones(
            tareaResultante,
            estado.configuracion.minutosRecordatorio
          );
        } catch (error) {
          console.warn('Error al reprogramar notificaciones:', error);
        }
      }

      // 5. Dispatch final
      dispatch({
        type: 'ACTUALIZAR_TAREA',
        payload: {
          id,
          cambios: {
            ...cambiosFinales,
            notificacionId: nuevoNotificacionId,
          },
        },
      });
    },
    [
      estado.tareas,
      estado.configuracion.notificacionesActivas,
      estado.configuracion.minutosRecordatorio,
    ]
  );

  const eliminarTarea = useCallback(
    async (id: string): Promise<void> => {
      const tarea = estado.tareas.find((t) => t.id === id);
      if (!tarea) return;

      // Cancelar sus notificaciones
      if (tarea.notificacionId) {
        await notificaciones.cancelarNotificacionesDeTarea(
          tarea.notificacionId
        );
      }

      const tareaEliminada: TareaEliminada = {
        ...tarea,
        eliminadaEn: new Date().toISOString(),
        expiraEn: calcularExpiracion(),
      };
      dispatch({ type: 'MOVER_A_PAPELERA', payload: tareaEliminada });
    },
    [estado.tareas]
  );

  const obtenerTareaPorId = useCallback(
    (id: string) => estado.tareas.find((t) => t.id === id),
    [estado.tareas]
  );

  const restaurarTarea = useCallback(
    async (id: string): Promise<void> => {
      const tareaEnPapelera = estado.papelera.find((t) => t.id === id);
      if (!tareaEnPapelera) return;

      // Reprogramar notificaciones (porque se cancelaron al eliminar)
      let nuevoNotificacionId: string | null = null;
      if (
        estado.configuracion.notificacionesActivas &&
        tareaEnPapelera.fechaVencimiento
      ) {
        try {
          nuevoNotificacionId = await notificaciones.programarNotificaciones(
            tareaEnPapelera,
            estado.configuracion.minutosRecordatorio
          );
        } catch (error) {
          console.warn('Error al reprogramar notificaciones:', error);
        }
      }

      dispatch({
        type: 'RESTAURAR_TAREA',
        payload: { id, notificacionId: nuevoNotificacionId },
      });
    },
    [
      estado.papelera,
      estado.configuracion.notificacionesActivas,
      estado.configuracion.minutosRecordatorio,
    ]
  );

  const eliminarPermanentemente = useCallback(
    async (id: string): Promise<void> => {
      // Las notificaciones ya se cancelaron cuando se movio a papelera
      dispatch({ type: 'ELIMINAR_PERMANENTE', payload: id });
    },
    []
  );

  const vaciarPapelera = useCallback(async (): Promise<void> => {
    // Las notificaciones ya se cancelaron al eliminar cada tarea
    dispatch({ type: 'VACIAR_PAPELERA' });
  }, []);

  // ----- Configuracion -----

  const setModoTema = useCallback((modo: ModoTema) => {
    dispatch({ type: 'SET_MODO_TEMA', payload: modo });
  }, []);

  const setNotificaciones = useCallback((activas: boolean) => {
    dispatch({ type: 'SET_NOTIFICACIONES', payload: activas });
  }, []);

  const setMinutosRecordatorio = useCallback((minutos: number) => {
    dispatch({ type: 'SET_MINUTOS_RECORDATORIO', payload: minutos });
  }, []);

  const agregarCategoria = useCallback((nombre: string, color: string) => {
    const nueva: Categoria = { id: generarId(), nombre, color };
    dispatch({ type: 'AGREGAR_CATEGORIA', payload: nueva });
  }, []);

  const eliminarCategoria = useCallback((id: string) => {
    dispatch({ type: 'ELIMINAR_CATEGORIA', payload: id });
  }, []);

  // ----- Reset total -----

  const borrarTodo = useCallback(async () => {
    await notificaciones.cancelarTodas();
    await almacen.limpiarTodo();
    dispatch({ type: 'BORRAR_TODO' });
  }, []);

  // ----- Valor del contexto -----

  const valor = useMemo<TareasContextValor>(
    () => ({
      tareas: estado.tareas,
      papelera: estado.papelera,
      configuracion: estado.configuracion,
      cargando: estado.cargando,
      crearTarea,
      actualizarTarea,
      eliminarTarea,
      obtenerTareaPorId,
      restaurarTarea,
      eliminarPermanentemente,
      vaciarPapelera,
      setModoTema,
      setNotificaciones,
      setMinutosRecordatorio,
      agregarCategoria,
      eliminarCategoria,
      borrarTodo,
    }),
    [
      estado.tareas,
      estado.papelera,
      estado.configuracion,
      estado.cargando,
      crearTarea,
      actualizarTarea,
      eliminarTarea,
      obtenerTareaPorId,
      restaurarTarea,
      eliminarPermanentemente,
      vaciarPapelera,
      setModoTema,
      setNotificaciones,
      setMinutosRecordatorio,
      agregarCategoria,
      eliminarCategoria,
      borrarTodo,
    ]
  );

  return (
    <TareasContext.Provider value={valor}>{children}</TareasContext.Provider>
  );
}