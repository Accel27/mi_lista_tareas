// ============================================================
// COMPONENTE Paginador
// Muestra botones de navegacion entre paginas. Se adapta al tema.
// ============================================================

import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORES } from '../constants';
import { useTema } from '../hooks/useTema';

interface Props {
  paginaActual: number;
  totalPaginas: number;
  onCambiarPagina: (pagina: number) => void;
}

export default function Paginador({
  paginaActual,
  totalPaginas,
  onCambiarPagina,
}: Props) {
  const { colores } = useTema();
  const styles = useMemo(() => crearEstilos(colores), [colores]);

  if (totalPaginas <= 1) return null;

  const puedeAnterior = paginaActual > 1;
  const puedeSiguiente = paginaActual < totalPaginas;

  return (
    <View style={styles.contenedor}>
      <Pressable
        style={({ pressed }) => [
          styles.boton,
          !puedeAnterior && styles.botonDeshabilitado,
          pressed && puedeAnterior && styles.botonPresionado,
        ]}
        onPress={() => puedeAnterior && onCambiarPagina(paginaActual - 1)}
        disabled={!puedeAnterior}
      >
        <Ionicons
          name="chevron-back"
          size={20}
          color={puedeAnterior ? colores.primario : colores.textoSecundario}
        />
        <Text
          style={[
            styles.botonTexto,
            !puedeAnterior && styles.botonTextoDeshabilitado,
          ]}
        >
          Anterior
        </Text>
      </Pressable>

      <View style={styles.infoPagina}>
        <Text style={styles.textoPagina}>
          {paginaActual} / {totalPaginas}
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.boton,
          !puedeSiguiente && styles.botonDeshabilitado,
          pressed && puedeSiguiente && styles.botonPresionado,
        ]}
        onPress={() => puedeSiguiente && onCambiarPagina(paginaActual + 1)}
        disabled={!puedeSiguiente}
      >
        <Text
          style={[
            styles.botonTexto,
            !puedeSiguiente && styles.botonTextoDeshabilitado,
          ]}
        >
          Siguiente
        </Text>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={puedeSiguiente ? colores.primario : colores.textoSecundario}
        />
      </Pressable>
    </View>
  );
}

function crearEstilos(c: typeof COLORES.claro) {
  return StyleSheet.create({
    contenedor: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: c.borde,
      backgroundColor: c.fondoSuperficie,
    },
    boton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      gap: 4,
    },
    botonPresionado: {
      backgroundColor: c.fondoInput,
    },
    botonDeshabilitado: {
      opacity: 0.6,
    },
    botonTexto: {
      fontSize: 14,
      fontWeight: '600',
      color: c.primario,
    },
    botonTextoDeshabilitado: {
      color: c.textoSecundario,
    },
    infoPagina: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      backgroundColor: c.fondo,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.borde,
    },
    textoPagina: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textoPrincipal,
    },
  });
}