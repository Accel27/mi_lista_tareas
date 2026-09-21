// ============================================================
// PANTALLA ConfigScreen
// Ajustes de la app: tema, notificaciones, categorias, reset.
// ============================================================

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTareas } from '../hooks/useTareas';
import { useTema } from '../hooks/useTema';
import { Categoria, ModoTema } from '../types';
import { TEXTOS, MAX_LONGITUD_CATEGORIA } from '../constants';
import ModalConfirmacion from '../components/ModalConfirmacion';
import Snackbar from '../components/Snackbar';

const OPCIONES_MINUTOS = [0, 5, 10, 15, 30, 60];

const COLORES_CATEGORIA = [
  '#4A6FA5',
  '#7E57C2',
  '#26A69A',
  '#EF5350',
  '#FF9800',
  '#66BB6A',
  '#EC407A',
  '#5C6BC0',
];

export default function ConfigScreen() {
  const {
    cargando,
    configuracion,
    setNotificaciones,
    setMinutosRecordatorio,
    agregarCategoria,
    eliminarCategoria,
    vaciarPapelera,
    borrarTodo,
  } = useTareas();

  const { modoTema, setModoTema, colores } = useTema();

  // ----- Estado local -----
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [colorSeleccionado, setColorSeleccionado] = useState(
    COLORES_CATEGORIA[0]
  );
  const [errorCategoria, setErrorCategoria] = useState<string | null>(null);

  const [categoriaAEliminar, setCategoriaAEliminar] =
    useState<Categoria | null>(null);
  const [confirmarBorrarTodo, setConfirmarBorrarTodo] = useState(false);

  const [snackbarMensaje, setSnackbarMensaje] = useState<string | null>(null);

  // ----- Handlers de tema -----
  function handleCambiarTema(modo: ModoTema) {
    setModoTema(modo);
  }

  // ----- Handlers de categorias -----
  function handleAgregarCategoria() {
    const nombre = nuevaCategoria.trim();
    if (nombre.length === 0) {
      setErrorCategoria(TEXTOS.errorCategoriaVacia);
      return;
    }

    const duplicada = configuracion.categorias.some(
      (c) => c.nombre.toLowerCase() === nombre.toLowerCase()
    );
    if (duplicada) {
      setErrorCategoria(TEXTOS.errorCategoriaDuplicada);
      return;
    }

    agregarCategoria(nombre, colorSeleccionado);
    setNuevaCategoria('');
    setErrorCategoria(null);
  }

  function handleSolicitarEliminarCategoria(cat: Categoria) {
    setCategoriaAEliminar(cat);
  }

  function handleConfirmarEliminarCategoria() {
    if (!categoriaAEliminar) return;
    eliminarCategoria(categoriaAEliminar.id);
    setCategoriaAEliminar(null);
  }

  // ----- Handlers de reset -----
  function handleConfirmarBorrarTodo() {
    borrarTodo();
    setConfirmarBorrarTodo(false);
    setSnackbarMensaje(TEXTOS.datosBorrados);
  }

  // ----- Render -----

  if (cargando) {
    return (
      <View style={[styles.centrado, { backgroundColor: colores.fondo }]}>
        <ActivityIndicator size="large" color={colores.primario} />
        <Text style={[styles.textoCargando, { color: colores.textoSecundario }]}>
          Cargando...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.contenedor, { backgroundColor: colores.fondo }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContenido}
        showsVerticalScrollIndicator={false}
      >
        {/* ==================== APARIENCIA ==================== */}
        <Text style={[styles.seccion, { color: colores.textoSecundario }]}>
          {TEXTOS.seccionApariencia}
        </Text>

        <View
          style={[styles.tarjeta, { backgroundColor: colores.fondoSuperficie }]}
        >
          <Text style={[styles.etiqueta, { color: colores.textoPrincipal }]}>
            {TEXTOS.etiquetaTema}
          </Text>

          <View style={styles.opcionesTema}>
            <Pressable
              style={[
                styles.botonTema,
                {
                  borderColor: colores.borde,
                  backgroundColor: colores.fondoSuperficie,
                },
                modoTema === 'claro' && {
                  backgroundColor: colores.primario,
                  borderColor: colores.primario,
                },
              ]}
              onPress={() => handleCambiarTema('claro')}
            >
              <Ionicons
                name="sunny-outline"
                size={20}
                color={modoTema === 'claro' ? '#FFFFFF' : colores.textoSecundario}
              />
              <Text
                style={[
                  styles.botonTemaTexto,
                  { color: colores.textoSecundario },
                  modoTema === 'claro' && { color: '#FFFFFF' },
                ]}
              >
                {TEXTOS.temaClaro}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.botonTema,
                {
                  borderColor: colores.borde,
                  backgroundColor: colores.fondoSuperficie,
                },
                modoTema === 'oscuro' && {
                  backgroundColor: colores.primario,
                  borderColor: colores.primario,
                },
              ]}
              onPress={() => handleCambiarTema('oscuro')}
            >
              <Ionicons
                name="moon-outline"
                size={20}
                color={modoTema === 'oscuro' ? '#FFFFFF' : colores.textoSecundario}
              />
              <Text
                style={[
                  styles.botonTemaTexto,
                  { color: colores.textoSecundario },
                  modoTema === 'oscuro' && { color: '#FFFFFF' },
                ]}
              >
                {TEXTOS.temaOscuro}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ==================== NOTIFICACIONES ==================== */}
        <Text style={[styles.seccion, { color: colores.textoSecundario }]}>
          {TEXTOS.seccionNotificaciones}
        </Text>

        <View
          style={[styles.tarjeta, { backgroundColor: colores.fondoSuperficie }]}
        >
          <View style={styles.filaSwitch}>
            <View style={styles.filaSwitchTexto}>
              <Text style={[styles.etiqueta, { color: colores.textoPrincipal }]}>
                {TEXTOS.etiquetaNotificaciones}
              </Text>
              <Text
                style={[styles.etiquetaDesc, { color: colores.textoSecundario }]}
              >
                {TEXTOS.etiquetaNotificacionesDesc}
              </Text>
            </View>
            <Switch
              value={configuracion.notificacionesActivas}
              onValueChange={setNotificaciones}
              trackColor={{ false: colores.borde, true: colores.primario }}
              thumbColor="#FFFFFF"
            />
          </View>

          {configuracion.notificacionesActivas && (
            <>
              <View
                style={[styles.separador, { backgroundColor: colores.borde }]}
              />
              <Text style={[styles.etiqueta, { color: colores.textoPrincipal }]}>
                {TEXTOS.etiquetaMinutos}
              </Text>
              <View style={styles.chips}>
                {OPCIONES_MINUTOS.map((m) => {
                  const activo = configuracion.minutosRecordatorio === m;
                  return (
                    <Pressable
                      key={m}
                      style={[
                        styles.chip,
                        {
                          borderColor: colores.borde,
                          backgroundColor: colores.fondoSuperficie,
                        },
                        activo && {
                          backgroundColor: colores.primario,
                          borderColor: colores.primario,
                        },
                      ]}
                      onPress={() => setMinutosRecordatorio(m)}
                    >
                      <Text
                        style={[
                          styles.chipTexto,
                          { color: colores.textoSecundario },
                          activo && { color: '#FFFFFF' },
                        ]}
                      >
                        {m === 0
                          ? TEXTOS.sinAnticipacion
                          : TEXTOS.minutosAntes(m)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </View>

        {/* ==================== CATEGORIAS ==================== */}
        <Text style={[styles.seccion, { color: colores.textoSecundario }]}>
          {TEXTOS.seccionCategorias}
        </Text>

        <View
          style={[styles.tarjeta, { backgroundColor: colores.fondoSuperficie }]}
        >
          {configuracion.categorias.length === 0 ? (
            <Text
              style={[styles.textoVacio, { color: colores.textoSecundario }]}
            >
              {TEXTOS.sinCategorias}
            </Text>
          ) : (
            configuracion.categorias.map((c) => (
              <View key={c.id} style={styles.filaCategoria}>
                <View style={[styles.punto, { backgroundColor: c.color }]} />
                <Text
                  style={[
                    styles.nombreCategoria,
                    { color: colores.textoPrincipal },
                  ]}
                >
                  {c.nombre}
                </Text>
                <Pressable
                  onPress={() => handleSolicitarEliminarCategoria(c)}
                  hitSlop={10}
                >
                  <Ionicons name="trash-outline" size={18} color="#E53935" />
                </Pressable>
              </View>
            ))
          )}

          <View style={[styles.separador, { backgroundColor: colores.borde }]} />

          <Text style={[styles.etiqueta, { color: colores.textoPrincipal }]}>
            {TEXTOS.etiquetaNuevaCategoria}
          </Text>

          <View style={styles.filaInputCategoria}>
            <TextInput
              style={[
                styles.inputCategoria,
                {
                  borderColor: colores.borde,
                  color: colores.textoPrincipal,
                  backgroundColor: colores.fondoSuperficie,
                },
              ]}
              placeholder={TEXTOS.placeholderNombreCategoria}
              placeholderTextColor={colores.textoSecundario}
              value={nuevaCategoria}
              onChangeText={(t) => {
                setNuevaCategoria(t);
                if (errorCategoria) setErrorCategoria(null);
              }}
              maxLength={MAX_LONGITUD_CATEGORIA}
            />
            <Pressable
              style={({ pressed }) => [
                styles.botonAgregar,
                { backgroundColor: colores.primario },
                pressed && { opacity: 0.85 },
              ]}
              onPress={handleAgregarCategoria}
            >
              <Ionicons name="add" size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          {errorCategoria && (
            <Text style={styles.textoError}>{errorCategoria}</Text>
          )}

          <View style={styles.chipsColores}>
            {COLORES_CATEGORIA.map((c) => {
              const activo = colorSeleccionado === c;
              return (
                <Pressable
                  key={c}
                  style={[
                    styles.circuloColor,
                    { backgroundColor: c },
                    activo && {
                      borderWidth: 3,
                      borderColor: colores.textoPrincipal,
                    },
                  ]}
                  onPress={() => setColorSeleccionado(c)}
                >
                  {activo && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ==================== ZONA PELIGRO ==================== */}
        <Text style={[styles.seccion, { color: colores.textoSecundario }]}>
          {TEXTOS.seccionZonaPeligro}
        </Text>

        <View
          style={[styles.tarjeta, { backgroundColor: colores.fondoSuperficie }]}
        >
          <Pressable
            style={styles.filaBotonPeligro}
            onPress={vaciarPapelera}
          >
            <Ionicons name="trash-outline" size={20} color="#E53935" />
            <View style={styles.filaBotonPeligroTexto}>
              <Text style={styles.textoPeligro}>
                {TEXTOS.botonVaciarPapeleraConfig}
              </Text>
              <Text
                style={[styles.etiquetaDesc, { color: colores.textoSecundario }]}
              >
                {TEXTOS.botonVaciarPapeleraConfigDesc}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colores.textoSecundario}
            />
          </Pressable>

          <View style={[styles.separador, { backgroundColor: colores.borde }]} />

          <Pressable
            style={styles.filaBotonPeligro}
            onPress={() => setConfirmarBorrarTodo(true)}
          >
            <Ionicons name="warning-outline" size={20} color="#E53935" />
            <View style={styles.filaBotonPeligroTexto}>
              <Text style={styles.textoPeligro}>{TEXTOS.botonBorrarTodo}</Text>
              <Text
                style={[styles.etiquetaDesc, { color: colores.textoSecundario }]}
              >
                {TEXTOS.botonBorrarTodoDesc}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colores.textoSecundario}
            />
          </Pressable>
        </View>

        {/* ==================== ACERCA DE ==================== */}
        <Text style={[styles.seccion, { color: colores.textoSecundario }]}>
          {TEXTOS.seccionAcercaDe}
        </Text>

        <View
          style={[styles.tarjeta, { backgroundColor: colores.fondoSuperficie }]}
        >
          <Text style={[styles.textoAcerca, { color: colores.textoPrincipal }]}>
            {TEXTOS.appNombre}
          </Text>
          <Text
            style={[styles.etiquetaDesc, { color: colores.textoSecundario }]}
          >
            {TEXTOS.acercaDescripcion}
          </Text>
          <Text
            style={[styles.etiquetaDesc, { color: colores.textoSecundario }]}
          >
            {TEXTOS.acercaMateria}
          </Text>
          <Text
            style={[styles.etiquetaDesc, { color: colores.textoSecundario }]}
          >
            {TEXTOS.acercaVersion}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <ModalConfirmacion
        visible={categoriaAEliminar !== null}
        titulo={TEXTOS.confirmarEliminarCategoriaTitulo}
        mensaje={TEXTOS.confirmarEliminarCategoriaMensaje}
        textoConfirmar={TEXTOS.botonEliminar}
        textoCancelar={TEXTOS.botonCancelar}
        icono="trash-outline"
        colorPeligro={true}
        onConfirmar={handleConfirmarEliminarCategoria}
        onCancelar={() => setCategoriaAEliminar(null)}
      />

      <ModalConfirmacion
        visible={confirmarBorrarTodo}
        titulo={TEXTOS.confirmarBorrarTodoTitulo}
        mensaje={TEXTOS.confirmarBorrarTodoMensaje}
        textoConfirmar={TEXTOS.botonBorrarTodoConfirmar}
        textoCancelar={TEXTOS.botonCancelar}
        icono="warning-outline"
        colorPeligro={true}
        onConfirmar={handleConfirmarBorrarTodo}
        onCancelar={() => setConfirmarBorrarTodo(false)}
      />

      <Snackbar
        visible={snackbarMensaje !== null}
        mensaje={snackbarMensaje ?? ''}
        duracion={3000}
        onCerrar={() => setSnackbarMensaje(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
  },
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  textoCargando: {
    marginTop: 12,
    fontSize: 15,
  },
  scrollContenido: {
    padding: 16,
  },
  seccion: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  tarjeta: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  etiqueta: {
    fontSize: 15,
    fontWeight: '600',
  },
  etiquetaDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  separador: {
    height: 1,
    marginVertical: 4,
  },
  textoVacio: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  },
  opcionesTema: {
    flexDirection: 'row',
    gap: 10,
  },
  botonTema: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  botonTemaTexto: {
    fontSize: 14,
    fontWeight: '600',
  },
  filaSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  filaSwitchTexto: {
    flex: 1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipTexto: {
    fontSize: 12,
    fontWeight: '600',
  },
  filaCategoria: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  punto: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  nombreCategoria: {
    flex: 1,
    fontSize: 14,
  },
  filaInputCategoria: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  inputCategoria: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  botonAgregar: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsColores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  circuloColor: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoError: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 4,
  },
  filaBotonPeligro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  filaBotonPeligroTexto: {
    flex: 1,
  },
  textoPeligro: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E53935',
  },
  textoAcerca: {
    fontSize: 16,
    fontWeight: '700',
  },
});