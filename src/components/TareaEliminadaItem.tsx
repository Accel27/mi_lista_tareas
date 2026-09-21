// ============================================================
// COMPONENTE TareaEliminadaItem
// Fila de la papelera: muestra una tarea eliminada con
// informacion de expiracion y botones de restaurar/eliminar.
// Se adapta al tema.
// ============================================================

import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { TareaEliminada } from '../types';
import { COLORES, COLORES_PRIORIDAD, ETIQUETAS_PRIORIDAD, TEXTOS } from '../constants';
import { diasHasta, formatearFechaRelativa } from '../utils/fechas';
import { useTema } from '../hooks/useTema';

interface Props {
  tarea: TareaEliminada;
  onRestaurar: (tarea: TareaEliminada) => void;
  onEliminarPermanente: (tarea: TareaEliminada) => void;
}

export default function TareaEliminadaItem({
  tarea,
  onRestaurar,
  onEliminarPermanente,
}: Props) {
  const { colores } = useTema();
  const styles = useMemo(() => crearEstilos(colores), [colores]);

  const diasRestantes = diasHasta(tarea.expiraEn);

  let textoExpira = '';
  if (diasRestantes <= 0) {
    textoExpira = TEXTOS.expiraHoy;
  } else if (diasRestantes === 1) {
    textoExpira = TEXTOS.expiraUnDia;
  } else {
    textoExpira = `${TEXTOS.expiraEnDias} ${diasRestantes} días`;
  }

  const urgente = diasRestantes <= 1;

  return (
    <View style={styles.contenedor}>
      <View style={styles.filaSuperior}>
        <View style={styles.contenidoPrincipal}>
          <Text style={styles.titulo} numberOfLines={1}>
            {tarea.titulo}
          </Text>

          <View style={styles.filaInfo}>
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

            <Text style={styles.textoInfo}>
              {TEXTOS.eliminadaHace}{' '}
              {formatearFechaRelativa(tarea.eliminadaEn).toLowerCase()}
            </Text>
          </View>

          <View style={styles.filaExpira}>
            <Ionicons
              name={urgente ? 'warning-outline' : 'hourglass-outline'}
              size={13}
              color={urgente ? colores.peligro : colores.textoSecundario}
            />
            <Text
              style={[styles.textoExpira, urgente && styles.textoExpiraUrgente]}
            >
              {textoExpira}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.filaBotones}>
        <Pressable
          style={({ pressed }) => [
            styles.boton,
            styles.botonRestaurar,
            pressed && styles.botonPresionado,
          ]}
          onPress={() => onRestaurar(tarea)}
        >
          <Ionicons name="arrow-undo-outline" size={16} color={colores.primario} />
          <Text style={[styles.botonRestaurarTexto, { color: colores.primario }]}>
            {TEXTOS.botonRestaurar}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.boton,
            styles.botonEliminar,
            pressed && styles.botonPresionado,
          ]}
          onPress={() => onEliminarPermanente(tarea)}
        >
          <Ionicons name="trash-outline" size={16} color={colores.peligro} />
          <Text style={[styles.botonEliminarTexto, { color: colores.peligro }]}>
            {TEXTOS.botonEliminar}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function crearEstilos(c: typeof COLORES.claro) {
  return StyleSheet.create({
    contenedor: {
      backgroundColor: c.fondoSuperficie,
      borderRadius: 10,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: c.borde,
    },
    filaSuperior: {
      marginBottom: 10,
    },
    contenidoPrincipal: {
      flex: 1,
    },
    titulo: {
      fontSize: 15,
      fontWeight: '600',
      color: c.textoPrincipal,
      marginBottom: 6,
    },
    filaInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 4,
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
    textoInfo: {
      fontSize: 12,
      color: c.textoSecundario,
    },
    filaExpira: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    textoExpira: {
      fontSize: 12,
      color: c.textoSecundario,
    },
    textoExpiraUrgente: {
      color: '#E53935',
      fontWeight: '600',
    },
    filaBotones: {
      flexDirection: 'row',
      gap: 8,
    },
    boton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
    },
    botonPresionado: {
      opacity: 0.85,
    },
    botonRestaurar: {
      backgroundColor: c.primario + '22',
      borderColor: c.primario + '44',
    },
    botonRestaurarTexto: {
      fontSize: 13,
      fontWeight: '700',
    },
    botonEliminar: {
      backgroundColor: c.peligro + '22',
      borderColor: c.peligro + '44',
    },
    botonEliminarTexto: {
      fontSize: 13,
      fontWeight: '700',
    },
  });
}