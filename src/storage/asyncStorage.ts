// ============================================================
// SERVICIO DE ALMACENAMIENTO
// Envuelve AsyncStorage con funciones tipadas para nuestro
// proyecto. AsyncStorage solo guarda strings, aqui nos
// encargamos de serializar/deserializar JSON automaticamente.
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../constants';
import { Configuracion, Tarea, TareaEliminada } from '../types';

// ------------------------------------------------------------
// HELPERS GENERICOS (privados)
// No se exportan; solo se usan dentro de este archivo.
// ------------------------------------------------------------

/**
 * Guarda cualquier valor serializable como JSON en AsyncStorage.
 */
async function guardarJSON<T>(clave: string, valor: T): Promise<void> {
  try {
    const json = JSON.stringify(valor);
    await AsyncStorage.setItem(clave, json);
  } catch (error) {
    console.error(`Error al guardar en AsyncStorage [${clave}]:`, error);
    throw error;
  }
}

/**
 * Lee un valor JSON de AsyncStorage y lo devuelve tipado.
 * Si la clave no existe, devuelve null.
 */
async function leerJSON<T>(clave: string): Promise<T | null> {
  try {
    const json = await AsyncStorage.getItem(clave);
    if (json === null) return null;
    return JSON.parse(json) as T;
  } catch (error) {
    console.error(`Error al leer de AsyncStorage [${clave}]:`, error);
    return null;
  }
}

/**
 * Elimina una clave de AsyncStorage.
 */
async function eliminarClave(clave: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(clave);
  } catch (error) {
    console.error(`Error al eliminar de AsyncStorage [${clave}]:`, error);
    throw error;
  }
}

// ------------------------------------------------------------
// TAREAS
// ------------------------------------------------------------

/**
 * Devuelve el array de tareas guardado.
 * Si nunca se guardo nada, devuelve un array vacio.
 */
export async function obtenerTareas(): Promise<Tarea[]> {
  const tareas = await leerJSON<Tarea[]>(STORAGE_KEYS.tareas);
  return tareas ?? [];
}

/**
 * Guarda el array completo de tareas.
 * (Reemplaza lo que hubiera antes.)
 */
export async function guardarTareas(tareas: Tarea[]): Promise<void> {
  await guardarJSON(STORAGE_KEYS.tareas, tareas);
}

// ------------------------------------------------------------
// PAPELERA
// ------------------------------------------------------------

export async function obtenerPapelera(): Promise<TareaEliminada[]> {
  const papelera = await leerJSON<TareaEliminada[]>(STORAGE_KEYS.papelera);
  return papelera ?? [];
}

export async function guardarPapelera(papelera: TareaEliminada[]): Promise<void> {
  await guardarJSON(STORAGE_KEYS.papelera, papelera);
}

// ------------------------------------------------------------
// CONFIGURACION
// ------------------------------------------------------------

export async function obtenerConfiguracion(): Promise<Configuracion | null> {
  return leerJSON<Configuracion>(STORAGE_KEYS.configuracion);
}

export async function guardarConfiguracion(config: Configuracion): Promise<void> {
  await guardarJSON(STORAGE_KEYS.configuracion, config);
}

// ------------------------------------------------------------
// LIMPIEZA TOTAL (util para debug o "resetear app")
// ------------------------------------------------------------

export async function limpiarTodo(): Promise<void> {
  await Promise.all([
    eliminarClave(STORAGE_KEYS.tareas),
    eliminarClave(STORAGE_KEYS.papelera),
    eliminarClave(STORAGE_KEYS.configuracion),
  ]);
}