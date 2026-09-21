// ============================================================
// SERVICIO DE NOTIFICACIONES
// Envuelve expo-notifications para programar y cancelar
// recordatorios de tareas.
//
// IMPORTANTE: desde Expo SDK 53, expo-notifications NO funciona
// en Expo Go para push remotas, y ademas el solo hecho de
// importarlo lanza un error en la app. Por eso hacemos un
// "import dinamico" que solo carga el modulo cuando estamos
// en un development build o en el APK final.
//
// En Expo Go: todas las funciones son "no-op" (no hacen nada)
// y se loguea un warning. En el APK funcionan normalmente.
// ============================================================

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { Tarea } from '../types';

// ------------------------------------------------------------
// DETECCION DE ENTORNO
// ------------------------------------------------------------

/**
 * Detecta si estamos corriendo en Expo Go (storeClient) o en
 * un build propio (development build o APK standalone).
 */
function estamosEnExpoGo(): boolean {
  return Constants.executionEnvironment === 'storeClient';
}

/**
 * Indica si las notificaciones pueden usarse en este entorno.
 */
export function notificacionesDisponibles(): boolean {
  return !estamosEnExpoGo() && Device.isDevice;
}

// ------------------------------------------------------------
// CARGA DINAMICA DEL MODULO
// Solo se carga la primera vez que se necesita y solo si
// estamos fuera de Expo Go. Asi evitamos que el simple
// import rompa la app.
// ------------------------------------------------------------

let NotificationsModule: typeof import('expo-notifications') | null = null;
let handlerConfigurado = false;

function cargarModulo(): typeof import('expo-notifications') | null {
  if (NotificationsModule) return NotificationsModule;
  if (estamosEnExpoGo()) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const modulo = require('expo-notifications') as typeof import('expo-notifications');
    NotificationsModule = modulo;
    return modulo;
  } catch (error) {
    console.warn('No se pudo cargar expo-notifications:', error);
    return null;
  }
}

function configurarHandlerSiHaceFalta(): void {
  if (handlerConfigurado) return;

  const modulo = cargarModulo();
  if (!modulo) return;

  modulo.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  handlerConfigurado = true;
}

// ------------------------------------------------------------
// CANAL ANDROID
// ------------------------------------------------------------

const CANAL_ID = 'recordatorios-tareas';

async function crearCanalSiNoExiste(): Promise<void> {
  if (Platform.OS !== 'android') return;

  const modulo = cargarModulo();
  if (!modulo) return;

  await modulo.setNotificationChannelAsync(CANAL_ID, {
    name: 'Recordatorios de tareas',
    importance: modulo.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#4A6FA5',
    sound: 'default',
  });
}

// ------------------------------------------------------------
// PERMISOS
// ------------------------------------------------------------

export async function pedirPermisos(): Promise<boolean> {
  if (!notificacionesDisponibles()) {
    console.warn(
      'Notificaciones deshabilitadas: Expo Go no las soporta. ' +
        'Compila el APK para probarlas.'
    );
    return false;
  }

  const modulo = cargarModulo();
  if (!modulo) return false;

  configurarHandlerSiHaceFalta();
  await crearCanalSiNoExiste();

  const { status: estadoActual } = await modulo.getPermissionsAsync();
  if (estadoActual === 'granted') return true;

  const { status } = await modulo.requestPermissionsAsync();
  return status === 'granted';
}

// ------------------------------------------------------------
// HELPERS INTERNOS
// ------------------------------------------------------------

function serializarIds(ids: string[]): string | null {
  const validos = ids.filter((id) => id.length > 0);
  if (validos.length === 0) return null;
  return validos.join('|');
}

function deserializarIds(cadena: string | null): string[] {
  if (!cadena) return [];
  return cadena.split('|').filter((id) => id.length > 0);
}

// ------------------------------------------------------------
// PROGRAMACION
// ------------------------------------------------------------

export async function programarNotificaciones(
  tarea: Tarea,
  minutosAntes: number
): Promise<string | null> {
  if (!notificacionesDisponibles()) return null;
  if (!tarea.fechaVencimiento) return null;

  const modulo = cargarModulo();
  if (!modulo) return null;

  configurarHandlerSiHaceFalta();
  await crearCanalSiNoExiste();

  const fechaVencimiento = new Date(tarea.fechaVencimiento);
  const ahora = new Date();

  if (fechaVencimiento.getTime() <= ahora.getTime()) return null;

  const ids: string[] = [];

  // ---- Recordatorio X minutos antes ----
  if (minutosAntes > 0) {
    const fechaRecordatorio = new Date(
      fechaVencimiento.getTime() - minutosAntes * 60 * 1000
    );

    if (fechaRecordatorio.getTime() > ahora.getTime()) {
      const id = await modulo.scheduleNotificationAsync({
        content: {
          title: 'Recordatorio',
          body: `"${tarea.titulo}" vence en ${minutosAntes} minutos`,
          data: { tareaId: tarea.id, tipo: 'recordatorio' },
          sound: 'default',
        },
        trigger: {
          type: modulo.SchedulableTriggerInputTypes.DATE,
          date: fechaRecordatorio,
          channelId: CANAL_ID,
        },
      });
      ids.push(id);
    }
  }

  // ---- Vencimiento a la hora exacta ----
  const idVencimiento = await modulo.scheduleNotificationAsync({
    content: {
      title: 'Tarea vencida',
      body: `"${tarea.titulo}" ha vencido`,
      data: { tareaId: tarea.id, tipo: 'vencimiento' },
      sound: 'default',
    },
    trigger: {
      type: modulo.SchedulableTriggerInputTypes.DATE,
      date: fechaVencimiento,
      channelId: CANAL_ID,
    },
  });
  ids.push(idVencimiento);

  return serializarIds(ids);
}

// ------------------------------------------------------------
// CANCELACION
// ------------------------------------------------------------

export async function cancelarNotificacionesDeTarea(
  cadenaIds: string | null
): Promise<void> {
  if (!notificacionesDisponibles()) return;

  const modulo = cargarModulo();
  if (!modulo) return;

  const ids = deserializarIds(cadenaIds);
  await Promise.all(
    ids.map((id) =>
      modulo
        .cancelScheduledNotificationAsync(id)
        .catch((error) => console.warn('Error al cancelar notificacion:', error))
    )
  );
}

export async function cancelarTodas(): Promise<void> {
  if (!notificacionesDisponibles()) return;

  const modulo = cargarModulo();
  if (!modulo) return;

  await modulo.cancelAllScheduledNotificationsAsync();
}

export async function contarProgramadas(): Promise<number> {
  if (!notificacionesDisponibles()) return 0;

  const modulo = cargarModulo();
  if (!modulo) return 0;

  const todas = await modulo.getAllScheduledNotificationsAsync();
  return todas.length;
}