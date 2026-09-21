// ============================================================
// PANTALLA HomeScreen
// Pantalla principal: lista de tareas + busqueda + filtros +
// paginacion + crear/editar/eliminar con confirmacion y undo.
// ============================================================

import { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTareas } from '../hooks/useTareas';
import { useTema } from '../hooks/useTema';
import { FiltrosTarea, Tarea } from '../types';
import { TEXTOS, TAREAS_POR_PAGINA } from '../constants';
import {
  aplicarFiltros,
  contarFiltrosActivos,
  FILTROS_INICIALES,
} from '../utils/filtros';
import {
  calcularTotalPaginas,
  obtenerPagina,
  ajustarPagina,
} from '../utils/paginacion';
import BarraBusqueda from '../components/BarraBusqueda';
import ModalFiltros from '../components/ModalFiltros';
import ModalTarea from '../components/ModalTarea';
import ModalConfirmacion from '../components/ModalConfirmacion';
import Snackbar from '../components/Snackbar';
import Paginador from '../components/Paginador';
import TareaItem from '../components/TareaItem';
import {
  DatosActualizacionTarea,
  DatosNuevaTarea,
} from '../context/TareasContext';

export default function HomeScreen() {
  const {
    tareas,
    cargando,
    crearTarea,
    actualizarTarea,
    eliminarTarea,
    restaurarTarea,
  } = useTareas();

  const { colores } = useTema();

  // ----- Estado de la pantalla -----
  const [filtros, setFiltros] = useState<FiltrosTarea>(FILTROS_INICIALES);
  const [paginaActual, setPaginaActual] = useState(1);

  // Modales
  const [modalFiltrosVisible, setModalFiltrosVisible] = useState(false);
  const [modalTareaVisible, setModalTareaVisible] = useState(false);
  const [tareaEnEdicion, setTareaEnEdicion] = useState<Tarea | null>(null);

  // Confirmacion de eliminacion
  const [tareaAEliminar, setTareaAEliminar] = useState<Tarea | null>(null);

  // Snackbar de "deshacer"
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [tareaRecienEliminadaId, setTareaRecienEliminadaId] = useState<
    string | null
  >(null);

  // ----- Derivados -----
  const tareasFiltradas = useMemo(
    () => aplicarFiltros(tareas, filtros),
    [tareas, filtros]
  );

  const totalPaginas = calcularTotalPaginas(
    tareasFiltradas.length,
    TAREAS_POR_PAGINA
  );

  useEffect(() => {
    const paginaAjustada = ajustarPagina(paginaActual, totalPaginas);
    if (paginaAjustada !== paginaActual) {
      setPaginaActual(paginaAjustada);
    }
  }, [paginaActual, totalPaginas]);

  useEffect(() => {
    setPaginaActual(1);
  }, [filtros]);

  const tareasDeLaPagina = useMemo(
    () => obtenerPagina(tareasFiltradas, paginaActual, TAREAS_POR_PAGINA),
    [tareasFiltradas, paginaActual]
  );

  // ----- Handlers de filtros -----
  function handleCambiarBusqueda(texto: string) {
    setFiltros((f) => ({ ...f, busqueda: texto }));
  }

  function handleAplicarFiltros(nuevos: FiltrosTarea) {
    setFiltros(nuevos);
  }

  function handleLimpiarFiltros() {
    setFiltros({
      ...filtros,
      prioridades: [],
      estados: [],
      categoriaIds: [],
      fechaDesde: null,
      fechaHasta: null,
    });
  }

  // ----- Handlers del modal de tarea -----
  function handlePressCrear() {
    setTareaEnEdicion(null);
    setModalTareaVisible(true);
  }

  function handlePressTarea(tarea: Tarea) {
    setTareaEnEdicion(tarea);
    setModalTareaVisible(true);
  }

  function handleCerrarModalTarea() {
    setModalTareaVisible(false);
    setTareaEnEdicion(null);
  }

  function handleCrearTarea(datos: DatosNuevaTarea) {
    crearTarea(datos);
  }

  function handleActualizarTarea(id: string, cambios: DatosActualizacionTarea) {
    actualizarTarea(id, cambios);
  }

  function handleToggleCompletada(tarea: Tarea) {
    const nuevoEstado = tarea.completada ? 'pendiente' : 'completada';
    actualizarTarea(tarea.id, { estado: nuevoEstado });
  }

  // ----- Flujo de eliminacion -----
  function handleSolicitarEliminar(tarea: Tarea) {
    setModalTareaVisible(false);
    setTareaEnEdicion(null);
    setTareaAEliminar(tarea);
  }

  function handleCancelarEliminar() {
    setTareaAEliminar(null);
  }

  function handleConfirmarEliminar() {
    if (!tareaAEliminar) return;
    const id = tareaAEliminar.id;
    eliminarTarea(id);
    setTareaAEliminar(null);
    setTareaRecienEliminadaId(id);
    setSnackbarVisible(true);
  }

  function handleDeshacer() {
    if (!tareaRecienEliminadaId) return;
    restaurarTarea(tareaRecienEliminadaId);
    setSnackbarVisible(false);
    setTareaRecienEliminadaId(null);
  }

  function handleCerrarSnackbar() {
    setSnackbarVisible(false);
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

  const filtrosActivos = contarFiltrosActivos(filtros);
  const sinTareas = tareas.length === 0;
  const sinResultados = !sinTareas && tareasFiltradas.length === 0;

  return (
    <View style={[styles.contenedor, { backgroundColor: colores.fondo }]}>
      <BarraBusqueda
        valor={filtros.busqueda}
        onCambiar={handleCambiarBusqueda}
        onPressFiltros={() => setModalFiltrosVisible(true)}
        filtrosActivos={filtrosActivos}
      />

      {sinTareas ? (
        <View style={styles.centrado}>
          <Ionicons name="clipboard-outline" size={64} color="#CCCCCC" />
          <Text style={[styles.textoVacio, { color: colores.textoSecundario }]}>
            {TEXTOS.sinTareas}
          </Text>
        </View>
      ) : sinResultados ? (
        <View style={styles.centrado}>
          <Ionicons name="search-outline" size={64} color="#CCCCCC" />
          <Text style={[styles.textoVacio, { color: colores.textoSecundario }]}>
            {TEXTOS.sinResultados}
          </Text>
        </View>
      ) : (
        <FlatList
          data={tareasDeLaPagina}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TareaItem
              tarea={item}
              onPress={handlePressTarea}
              onToggleCompletada={handleToggleCompletada}
            />
          )}
          contentContainerStyle={styles.listaContenido}
          showsVerticalScrollIndicator={false}
        />
      )}

      {!sinTareas && !sinResultados && (
        <Paginador
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          onCambiarPagina={setPaginaActual}
        />
      )}

      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colores.primario },
          pressed && { backgroundColor: colores.primarioOscuro, transform: [{ scale: 0.96 }] },
        ]}
        onPress={handlePressCrear}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      <ModalFiltros
        visible={modalFiltrosVisible}
        filtros={filtros}
        onCerrar={() => setModalFiltrosVisible(false)}
        onAplicar={handleAplicarFiltros}
        onLimpiar={handleLimpiarFiltros}
      />

      <ModalTarea
        visible={modalTareaVisible}
        tareaEditar={tareaEnEdicion}
        onCerrar={handleCerrarModalTarea}
        onCrear={handleCrearTarea}
        onActualizar={handleActualizarTarea}
        onEliminar={handleSolicitarEliminar}
      />

      <ModalConfirmacion
        visible={tareaAEliminar !== null}
        titulo={TEXTOS.confirmarEliminarTitulo}
        mensaje={TEXTOS.confirmarEliminarMensaje}
        textoConfirmar={TEXTOS.botonEliminar}
        textoCancelar={TEXTOS.botonCancelar}
        icono="trash-outline"
        colorPeligro={true}
        onConfirmar={handleConfirmarEliminar}
        onCancelar={handleCancelarEliminar}
      />

      <Snackbar
        visible={snackbarVisible}
        mensaje={TEXTOS.tareaEliminada}
        textoAccion={TEXTOS.botonDeshacer}
        duracion={5000}
        onAccion={handleDeshacer}
        onCerrar={handleCerrarSnackbar}
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
  textoVacio: {
    marginTop: 16,
    fontSize: 15,
    textAlign: 'center',
    maxWidth: 260,
  },
  listaContenido: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 90,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});