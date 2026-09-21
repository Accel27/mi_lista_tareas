// ============================================================
// HOOK useTema
// Devuelve el modo de tema actual (claro/oscuro), la paleta de
// colores correspondiente y la funcion para cambiarlo.
// Se construye sobre useTareas porque el modo de tema vive en
// la configuracion, que esta en el TareasContext.
// ============================================================

import { COLORES } from '../constants';
import { ModoTema } from '../types';
import { useTareas } from './useTareas';

export function useTema() {
  const { configuracion, setModoTema } = useTareas();

  const modoTema: ModoTema = configuracion.modoTema;
  const esOscuro = modoTema === 'oscuro';
  const colores = COLORES[modoTema];

  return {
    modoTema,
    esOscuro,
    colores,
    setModoTema,
  };
}