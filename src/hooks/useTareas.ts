// ============================================================
// HOOK useTareas
// Fachada simple para consumir el TareasContext.
// Se usa en cualquier pantalla que necesite leer o modificar
// las tareas, la papelera o la configuracion.
// ============================================================

import { useContext } from 'react';

import { TareasContext } from '../context/TareasContext';

/**
 * Devuelve el contexto de tareas.
 * Lanza un error claro si se usa fuera del TareasProvider.
 */
export function useTareas() {
  const contexto = useContext(TareasContext);

  if (contexto === null) {
    throw new Error(
      'useTareas debe usarse dentro de un <TareasProvider>. ' +
        'Verifica que envolviste la app correctamente en App.tsx.'
    );
  }

  return contexto;
}