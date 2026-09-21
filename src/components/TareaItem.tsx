// ============================================================
// COMPONENTE TareaItem
// Una fila de la lista de tareas. Se adapta al tema.
// ============================================================

import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Tarea } from '../types';
import {
  COLORES,
  COLORES_PRIORIDAD,
  COLORES_ESTADO,
  ETIQUETAS_PRIORIDAD,
  ETIQUETAS_ESTADO,
} from '../constants';
import { formatearFechaRelativa, esFechaVencida } from '../utils/fechas';
import { useTema } from '../hooks/useTema';

interface Props {
  tarea: Tarea;
  onPress: (tarea: Tarea) => void;
  onToggleCompletada: (tarea: Tarea) => void;
}

export default function TareaItem({
  tarea,
  onPress,
  onToggleCompletada,
}: Props) {
  const { colores } = useTema();
  const styles = useMemo(() => crearEstilos(colores), [colores]);

  const fechaVencida = esFechaVencida(tarea.fechaVencimiento) && !tarea.completada;

  return (
    <Pressable
      style={({ pressed }) => [styles.contenedor, pressed && styles.presionado]}
      onPress={() => onPress(tarea)}
    >
      <Pressable
        style={styles.checkbox}
        onPress={() => onToggleCompletada(tarea)}
        hitSlop={10}
      >
        <Ionicons
          name={tarea.completada ? 'checkmark-circle' : 'ellipse-outline'}
          size={26}
          color={tarea.completada ? COLORES_ESTADO.completada : colores.textoSecundario}
        />
      </Pressable>

      <View style={styles.contenido}>
        <Text
          style={[styles.titulo, tarea.completada && styles.tituloCompletado]}
          numberOfLines={1}
        >
          {tarea.titulo}
        </Text>

        {tarea.descripcion.length > 0 && (
          <Text style={styles.descripcion} numberOfLines={1}>
            {tarea.descripcion}
          </Text>
        )}

        <View style={styles.filaBadges}>
          <View
            style={[
              styles.badge,
              { backgroundColor: COLORES_PRIORIDAD[tarea.prioridad] },
            ]}
          >
            <Text style={styles.badgeTexto}>
              {ETIQUETAS_PRIORIDAD[tarea.prioridad]}
            </Text>
          </View>

          <View
            style={[
              styles.badge,
              { backgroundColor: COLORES_ESTADO[tarea.estado] },
            ]}
          >
            <Text style={styles.badgeTexto}>
              {ETIQUETAS_ESTADO[tarea.estado]}
            </Text>
          </View>

          {tarea.fechaVencimiento && (
            <View style={styles.filaFecha}>
              <Ionicons
                name="time-outline"
                size={14}
                color={fechaVencida ? '#E53935' : colores.textoSecundario}
              />
              <Text
                style={[
                  styles.fechaTexto,
                  fechaVencida && styles.fechaVencida,
                ]}
              >
                {formatearFechaRelativa(tarea.fechaVencimiento)}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={colores.textoSecundario}
      />
    </Pressable>
  );
}

function crearEstilos(c: typeof COLORES.claro) {
  return StyleSheet.create({
    contenedor: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.fondoSuperficie,
      borderRadius: 10,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: c.borde,
    },
    presionado: {
      backgroundColor: c.fondoInput,
    },
    checkbox: {
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    contenido: {
      flex: 1,
      marginRight: 8,
    },
    titulo: {
      fontSize: 16,
      fontWeight: '600',
      color: c.textoPrincipal,
      marginBottom: 2,
    },
    tituloCompletado: {
      textDecorationLine: 'line-through',
      color: c.textoSecundario,
    },
    descripcion: {
      fontSize: 13,
      color: c.textoSecundario,
      marginBottom: 6,
    },
    filaBadges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 6,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    badgeTexto: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '600',
    },
    filaFecha: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    fechaTexto: {
      fontSize: 12,
      color: c.textoSecundario,
    },
    fechaVencida: {
      color: '#E53935',
      fontWeight: '600',
    },
  });
}