// ============================================================
// COMPONENTE ModalTarea
// Modal para crear o editar una tarea. Se adapta al tema.
// En modo creacion no se permite elegir "cancelada" (no tiene
// sentido cancelar algo que aun no existe).
// Usa safe area para que los botones no queden tapados por la
// barra de navegacion de Android en dispositivos con 3 botones.
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EstadoTarea, Prioridad, Tarea } from '../types';
import {
  COLORES,
  COLORES_PRIORIDAD,
  COLORES_ESTADO,
  ETIQUETAS_PRIORIDAD,
  ETIQUETAS_ESTADO,
  MAX_LONGITUD_DESCRIPCION,
  MAX_LONGITUD_TITULO,
  TEXTOS,
} from '../constants';
import { useTareas } from '../hooks/useTareas';
import { useTema } from '../hooks/useTema';
import {
  DatosActualizacionTarea,
  DatosNuevaTarea,
} from '../context/TareasContext';

interface Props {
  visible: boolean;
  tareaEditar: Tarea | null;
  onCerrar: () => void;
  onCrear: (datos: DatosNuevaTarea) => void;
  onActualizar: (id: string, cambios: DatosActualizacionTarea) => void;
  onEliminar: (tarea: Tarea) => void;
}

const PRIORIDADES: Prioridad[] = ['baja', 'media', 'alta'];

// Estados disponibles al CREAR (sin "cancelada")
const ESTADOS_NUEVA: EstadoTarea[] = [
  'pendiente',
  'en-progreso',
  'completada',
];

// Estados disponibles al EDITAR (todos)
const ESTADOS_EDICION: EstadoTarea[] = [
  'pendiente',
  'en-progreso',
  'completada',
  'cancelada',
];

export default function ModalTarea({
  visible,
  tareaEditar,
  onCerrar,
  onCrear,
  onActualizar,
  onEliminar,
}: Props) {
  const { configuracion } = useTareas();
  const { colores } = useTema();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => crearEstilos(colores), [colores]);

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState<Prioridad>('media');
  const [estado, setEstado] = useState<EstadoTarea>('pendiente');
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [fechaVencimiento, setFechaVencimiento] = useState<string | null>(null);
  const [errorTitulo, setErrorTitulo] = useState(false);

  // Estados segun modo (crear vs editar)
  const estadosDisponibles = tareaEditar ? ESTADOS_EDICION : ESTADOS_NUEVA;

  useEffect(() => {
    if (!visible) return;

    if (tareaEditar) {
      setTitulo(tareaEditar.titulo);
      setDescripcion(tareaEditar.descripcion);
      setPrioridad(tareaEditar.prioridad);
      setEstado(tareaEditar.estado);
      setCategoriaId(tareaEditar.categoriaId);
      setFechaVencimiento(tareaEditar.fechaVencimiento);
    } else {
      setTitulo('');
      setDescripcion('');
      setPrioridad('media');
      setEstado('pendiente');
      setCategoriaId(null);
      setFechaVencimiento(null);
    }
    setErrorTitulo(false);
  }, [visible, tareaEditar]);

  function abrirSelectorFecha() {
    const base = fechaVencimiento ? new Date(fechaVencimiento) : new Date();

    DateTimePickerAndroid.open({
      value: base,
      mode: 'date',
      is24Hour: true,
      onChange: (event, fechaSeleccionada) => {
        if (event.type !== 'set' || !fechaSeleccionada) return;

        const nueva = new Date(base);
        nueva.setFullYear(
          fechaSeleccionada.getFullYear(),
          fechaSeleccionada.getMonth(),
          fechaSeleccionada.getDate()
        );
        setFechaVencimiento(nueva.toISOString());
      },
    });
  }

  function abrirSelectorHora() {
    const base = fechaVencimiento ? new Date(fechaVencimiento) : new Date();

    DateTimePickerAndroid.open({
      value: base,
      mode: 'time',
      is24Hour: true,
      onChange: (event, horaSeleccionada) => {
        if (event.type !== 'set' || !horaSeleccionada) return;

        const nueva = new Date(base);
        nueva.setHours(
          horaSeleccionada.getHours(),
          horaSeleccionada.getMinutes(),
          0,
          0
        );
        setFechaVencimiento(nueva.toISOString());
      },
    });
  }

  function limpiarFecha() {
    setFechaVencimiento(null);
  }

  function inicializarFecha() {
    const base = new Date();
    base.setMinutes(0, 0, 0);
    base.setHours(base.getHours() + 1);
    setFechaVencimiento(base.toISOString());
  }

  function handleGuardar() {
    const tituloLimpio = titulo.trim();
    if (tituloLimpio.length === 0) {
      setErrorTitulo(true);
      return;
    }

    const datos = {
      titulo: tituloLimpio,
      descripcion: descripcion.trim(),
      prioridad,
      estado,
      categoriaId,
      fechaVencimiento,
    };

    if (tareaEditar) {
      onActualizar(tareaEditar.id, datos);
    } else {
      onCrear(datos);
    }
    onCerrar();
  }

  function handleEliminar() {
    if (tareaEditar) {
      onEliminar(tareaEditar);
    }
  }

  const fechaObj = fechaVencimiento ? new Date(fechaVencimiento) : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCerrar}
    >
      <KeyboardAvoidingView
        style={styles.fondo}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.contenedor,
            { paddingBottom: insets.bottom > 0 ? insets.bottom : 0 },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.tituloHeader}>
              {tareaEditar ? TEXTOS.modalTareaEditar : TEXTOS.modalTareaCrear}
            </Text>
            <Pressable onPress={onCerrar} hitSlop={10}>
              <Ionicons name="close" size={26} color={colores.textoPrincipal} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContenido}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.label}>{TEXTOS.labelTitulo} *</Text>
            <TextInput
              style={[styles.input, errorTitulo && styles.inputError]}
              placeholder={TEXTOS.placeholderTitulo}
              placeholderTextColor={colores.textoSecundario}
              value={titulo}
              onChangeText={(t) => {
                setTitulo(t);
                if (errorTitulo) setErrorTitulo(false);
              }}
              maxLength={MAX_LONGITUD_TITULO}
            />
            {errorTitulo && (
              <Text style={styles.textoError}>{TEXTOS.errorTituloRequerido}</Text>
            )}

            <Text style={styles.label}>{TEXTOS.labelDescripcion}</Text>
            <TextInput
              style={[styles.input, styles.inputMultilinea]}
              placeholder={TEXTOS.placeholderDescripcion}
              placeholderTextColor={colores.textoSecundario}
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={3}
              maxLength={MAX_LONGITUD_DESCRIPCION}
              textAlignVertical="top"
            />

            <Text style={styles.label}>{TEXTOS.labelPrioridad}</Text>
            <View style={styles.chips}>
              {PRIORIDADES.map((p) => {
                const activo = prioridad === p;
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
                    onPress={() => setPrioridad(p)}
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

            <Text style={styles.label}>{TEXTOS.labelEstado}</Text>
            <View style={styles.chips}>
              {estadosDisponibles.map((e) => {
                const activo = estado === e;
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
                    onPress={() => setEstado(e)}
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

            <Text style={styles.label}>{TEXTOS.labelCategoria}</Text>
            <View style={styles.chips}>
              <Pressable
                style={[
                  styles.chip,
                  categoriaId === null && {
                    backgroundColor: colores.textoSecundario,
                    borderColor: colores.textoSecundario,
                  },
                ]}
                onPress={() => setCategoriaId(null)}
              >
                <Text
                  style={[
                    styles.chipTexto,
                    categoriaId === null && styles.chipTextoActivo,
                  ]}
                >
                  {TEXTOS.sinCategoria}
                </Text>
              </Pressable>

              {configuracion.categorias.map((c) => {
                const activo = categoriaId === c.id;
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
                    onPress={() => setCategoriaId(c.id)}
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

            <Text style={styles.label}>{TEXTOS.labelFechaVencimiento}</Text>
            {fechaVencimiento === null ? (
              <Pressable style={styles.botonFecha} onPress={inicializarFecha}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={colores.textoSecundario}
                />
                <Text style={styles.botonFechaTexto}>{TEXTOS.sinFecha}</Text>
                <Ionicons
                  name="add-circle-outline"
                  size={20}
                  color={colores.primario}
                />
              </Pressable>
            ) : (
              <View style={styles.fechaContenedor}>
                <Pressable
                  style={styles.botonFechaInterno}
                  onPress={abrirSelectorFecha}
                >
                  <Ionicons name="calendar" size={18} color={colores.primario} />
                  <Text style={styles.botonFechaTextoInterno}>
                    {fechaObj?.toLocaleDateString('es-ES')}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.botonFechaInterno}
                  onPress={abrirSelectorHora}
                >
                  <Ionicons name="time" size={18} color={colores.primario} />
                  <Text style={styles.botonFechaTextoInterno}>
                    {fechaObj?.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={limpiarFecha}
                  hitSlop={10}
                  style={styles.botonLimpiarFecha}
                >
                  <Ionicons
                    name="close-circle"
                    size={22}
                    color={colores.peligro}
                  />
                </Pressable>
              </View>
            )}

            {tareaEditar && (
              <Pressable
                style={({ pressed }) => [
                  styles.botonEliminar,
                  pressed && styles.botonEliminarPresionado,
                ]}
                onPress={handleEliminar}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={colores.peligro}
                />
                <Text
                  style={[styles.botonEliminarTexto, { color: colores.peligro }]}
                >
                  {TEXTOS.botonEliminar}
                </Text>
              </Pressable>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[styles.botonFooter, styles.botonSecundario]}
              onPress={onCerrar}
            >
              <Text style={styles.botonSecundarioTexto}>
                {TEXTOS.botonCancelar}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.botonFooter,
                { backgroundColor: colores.primario },
              ]}
              onPress={handleGuardar}
            >
              <Text style={styles.botonPrimarioTexto}>{TEXTOS.botonGuardar}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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
      maxHeight: '92%',
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
    tituloHeader: {
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
    label: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textoSecundario,
      marginBottom: 8,
      marginTop: 14,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    input: {
      borderWidth: 1,
      borderColor: c.borde,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: c.textoPrincipal,
      backgroundColor: c.fondoSuperficie,
    },
    inputError: {
      borderColor: c.peligro,
    },
    inputMultilinea: {
      minHeight: 80,
      paddingTop: 12,
    },
    textoError: {
      color: c.peligro,
      fontSize: 12,
      marginTop: 4,
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
      borderStyle: 'dashed',
      borderColor: c.borde,
    },
    botonFechaTexto: {
      flex: 1,
      fontSize: 14,
      color: c.textoSecundario,
    },
    fechaContenedor: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    botonFechaInterno: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: c.fondoInput,
    },
    botonFechaTextoInterno: {
      fontSize: 14,
      color: c.textoPrincipal,
      fontWeight: '600',
    },
    botonLimpiarFecha: {
      padding: 4,
    },
    botonEliminar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 24,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: c.peligro,
      backgroundColor: c.peligro + '22',
    },
    botonEliminarPresionado: {
      backgroundColor: c.peligro + '44',
    },
    botonEliminarTexto: {
      fontSize: 15,
      fontWeight: '700',
    },
    footer: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 20,
      paddingVertical: 16,
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