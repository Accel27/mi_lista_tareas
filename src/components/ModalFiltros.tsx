// ============================================================
// COMPONENTE ModalFiltros
// Modal con filtros: prioridad, estado, categoria y fechas.
// Se adapta al tema.
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

import { EstadoTarea, FiltrosTarea, Prioridad } from '../types';
import {
  COLORES,
  COLORES_PRIORIDAD,
  COLORES_ESTADO,
  ETIQUETAS_PRIORIDAD,
  ETIQUETAS_ESTADO,
  TEXTOS,
} from '../constants';
import { useTareas } from '../hooks/useTareas';
import { useTema } from '../hooks/useTema';

interface Props {
  visible: boolean;
  filtros: FiltrosTarea;
  onCerrar: () => void;
  onAplicar: (filtros: FiltrosTarea) => void;
  onLimpiar: () => void;
}

const PRIORIDADES: Prioridad[] = ['baja', 'media', 'alta'];
const ESTADOS: EstadoTarea[] = [
  'pendiente',
  'en-progreso',
  'completada',
  'cancelada',
];

export default function ModalFiltros({
  visible,
  filtros,
  onCerrar,
  onAplicar,
  onLimpiar,
}: Props) {
  const { configuracion } = useTareas();
  const { colores } = useTema();
  const styles = useMemo(() => crearEstilos(colores), [colores]);

  const [draft, setDraft] = useState<FiltrosTarea>(filtros);

  useEffect(() => {
    if (visible) {
      setDraft(filtros);
    }
  }, [visible, filtros]);

  function togglePrioridad(p: Prioridad) {
    setDraft((d) => ({
      ...d,
      prioridades: d.prioridades.includes(p)
        ? d.prioridades.filter((x) => x !== p)
        : [...d.prioridades, p],
    }));
  }

  function toggleEstado(e: EstadoTarea) {
    setDraft((d) => ({
      ...d,
      estados: d.estados.includes(e)
        ? d.estados.filter((x) => x !== e)
        : [...d.estados, e],
    }));
  }

  function toggleCategoria(id: string) {
    setDraft((d) => ({
      ...d,
      categoriaIds: d.categoriaIds.includes(id)
        ? d.categoriaIds.filter((x) => x !== id)
        : [...d.categoriaIds, id],
    }));
  }

  function abrirSelectorDesde() {
    const base = draft.fechaDesde ? new Date(draft.fechaDesde) : new Date();

    DateTimePickerAndroid.open({
      value: base,
      mode: 'date',
      onChange: (event, fechaSeleccionada) => {
        if (event.type !== 'set' || !fechaSeleccionada) return;

        const copia = new Date(fechaSeleccionada);
        copia.setHours(0, 0, 0, 0);
        setDraft((d) => ({ ...d, fechaDesde: copia.toISOString() }));
      },
    });
  }

  function abrirSelectorHasta() {
    const base = draft.fechaHasta ? new Date(draft.fechaHasta) : new Date();

    DateTimePickerAndroid.open({
      value: base,
      mode: 'date',
      onChange: (event, fechaSeleccionada) => {
        if (event.type !== 'set' || !fechaSeleccionada) return;

        const copia = new Date(fechaSeleccionada);
        copia.setHours(23, 59, 59, 999);
        setDraft((d) => ({ ...d, fechaHasta: copia.toISOString() }));
      },
    });
  }

  function limpiarFecha(tipo: 'desde' | 'hasta') {
    setDraft((d) => ({
      ...d,
      [tipo === 'desde' ? 'fechaDesde' : 'fechaHasta']: null,
    }));
  }

  function handleAplicar() {
    onAplicar(draft);
    onCerrar();
  }

  function handleLimpiar() {
    onLimpiar();
    setDraft({
      ...draft,
      prioridades: [],
      estados: [],
      categoriaIds: [],
      fechaDesde: null,
      fechaHasta: null,
    });
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCerrar}
    >
      <View style={styles.fondo}>
        <View style={styles.contenedor}>
          <View style={styles.header}>
            <Text style={styles.titulo}>Filtros</Text>
            <Pressable onPress={onCerrar} hitSlop={10}>
              <Ionicons name="close" size={26} color={colores.textoPrincipal} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContenido}
          >
            <Text style={styles.seccion}>Prioridad</Text>
            <View style={styles.chips}>
              {PRIORIDADES.map((p) => {
                const activo = draft.prioridades.includes(p);
                return (
                  <Pressable
                    key={p}
                    style={[
                      styles.chip,
                      activo && {
                        backgroundColor: COLORES_PRIORIDAD[p],
                        borderColor: COLORES_PRIORIDAD[p],
                      },
                    ]}
                    onPress={() => togglePrioridad(p)}
                  >
                    <Text
                      style={[styles.chipTexto, activo && styles.chipTextoActivo]}
                    >
                      {ETIQUETAS_PRIORIDAD[p]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.seccion}>Estado</Text>
            <View style={styles.chips}>
              {ESTADOS.map((e) => {
                const activo = draft.estados.includes(e);
                return (
                  <Pressable
                    key={e}
                    style={[
                      styles.chip,
                      activo && {
                        backgroundColor: COLORES_ESTADO[e],
                        borderColor: COLORES_ESTADO[e],
                      },
                    ]}
                    onPress={() => toggleEstado(e)}
                  >
                    <Text
                      style={[styles.chipTexto, activo && styles.chipTextoActivo]}
                    >
                      {ETIQUETAS_ESTADO[e]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.seccion}>Categoria</Text>
            <View style={styles.chips}>
              {configuracion.categorias.map((c) => {
                const activo = draft.categoriaIds.includes(c.id);
                return (
                  <Pressable
                    key={c.id}
                    style={[
                      styles.chip,
                      activo && {
                        backgroundColor: c.color,
                        borderColor: c.color,
                      },
                    ]}
                    onPress={() => toggleCategoria(c.id)}
                  >
                    <Text
                      style={[styles.chipTexto, activo && styles.chipTextoActivo]}
                    >
                      {c.nombre}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.seccion}>Rango de fechas</Text>

            <Pressable style={styles.botonFecha} onPress={abrirSelectorDesde}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={colores.textoSecundario}
              />
              <Text style={styles.botonFechaTexto}>
                {draft.fechaDesde
                  ? `Desde: ${new Date(
                      draft.fechaDesde
                    ).toLocaleDateString('es-ES')}`
                  : 'Desde: sin limite'}
              </Text>
              {draft.fechaDesde && (
                <Pressable onPress={() => limpiarFecha('desde')} hitSlop={10}>
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={colores.textoSecundario}
                  />
                </Pressable>
              )}
            </Pressable>

            <Pressable style={styles.botonFecha} onPress={abrirSelectorHasta}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={colores.textoSecundario}
              />
              <Text style={styles.botonFechaTexto}>
                {draft.fechaHasta
                  ? `Hasta: ${new Date(
                      draft.fechaHasta
                    ).toLocaleDateString('es-ES')}`
                  : 'Hasta: sin limite'}
              </Text>
              {draft.fechaHasta && (
                <Pressable onPress={() => limpiarFecha('hasta')} hitSlop={10}>
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={colores.textoSecundario}
                  />
                </Pressable>
              )}
            </Pressable>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[styles.botonFooter, styles.botonSecundario]}
              onPress={handleLimpiar}
            >
              <Text style={styles.botonSecundarioTexto}>
                {TEXTOS.botonLimpiarFiltros}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.botonFooter,
                { backgroundColor: colores.primario },
              ]}
              onPress={handleAplicar}
            >
              <Text style={styles.botonPrimarioTexto}>
                {TEXTOS.botonAplicarFiltros}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function crearEstilos(c: typeof COLORES.claro) {
  return StyleSheet.create({
    fondo: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    contenedor: {
      backgroundColor: c.fondoSuperficie,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '85%',
      paddingBottom: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.borde,
    },
    titulo: {
      fontSize: 20,
      fontWeight: '700',
      color: c.textoPrincipal,
    },
    scroll: {
      flexGrow: 0,
    },
    scrollContenido: {
      padding: 20,
    },
    seccion: {
      fontSize: 14,
      fontWeight: '700',
      color: c.textoSecundario,
      marginBottom: 10,
      marginTop: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: c.borde,
      backgroundColor: c.fondoSuperficie,
    },
    chipTexto: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textoSecundario,
    },
    chipTextoActivo: {
      color: '#FFFFFF',
    },
    botonFecha: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.borde,
      marginBottom: 10,
    },
    botonFechaTexto: {
      flex: 1,
      fontSize: 14,
      color: c.textoPrincipal,
    },
    footer: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 20,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: c.borde,
    },
    botonFooter: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
    },
    botonSecundario: {
      backgroundColor: c.fondoInput,
    },
    botonSecundarioTexto: {
      fontSize: 15,
      fontWeight: '600',
      color: c.textoSecundario,
    },
    botonPrimarioTexto: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
}