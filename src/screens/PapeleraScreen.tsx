// ============================================================
// PANTALLA PapeleraScreen
// Muestra las tareas eliminadas. Permite restaurarlas,
// eliminarlas permanentemente o vaciar toda la papelera.
// ============================================================

import { useState } from 'react';
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
import { TareaEliminada } from '../types';
import { TEXTOS } from '../constants';
import ModalConfirmacion from '../components/ModalConfirmacion';
import Snackbar from '../components/Snackbar';
import TareaEliminadaItem from '../components/TareaEliminadaItem';

export default function PapeleraScreen() {
  const {
    papelera,
    cargando,
    restaurarTarea,
    eliminarPermanentemente,
    vaciarPapelera,
  } = useTareas();

  const { colores } = useTema();

  // ----- Estado de la pantalla -----
  const [tareaAEliminar, setTareaAEliminar] = useState<TareaEliminada | null>(
    null
  );
  const [confirmarVaciar, setConfirmarVaciar] = useState(false);

  // Snackbar de feedback al restaurar
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // ----- Handlers -----
  function handleRestaurar(tarea: TareaEliminada) {
    restaurarTarea(tarea.id);
    setSnackbarVisible(true);
  }

  function handleSolicitarEliminarPermanente(tarea: TareaEliminada) {
    setTareaAEliminar(tarea);
  }

  function handleConfirmarEliminarPermanente() {
    if (!tareaAEliminar) return;
    eliminarPermanentemente(tareaAEliminar.id);
    setTareaAEliminar(null);
  }

  function handleCancelarEliminarPermanente() {
    setTareaAEliminar(null);
  }

  function handleSolicitarVaciar() {
    setConfirmarVaciar(true);
  }

  function handleConfirmarVaciar() {
    vaciarPapelera();
    setConfirmarVaciar(false);
  }

  function handleCancelarVaciar() {
    setConfirmarVaciar(false);
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

  const vacia = papelera.length === 0;

  return (
    <View style={[styles.contenedor, { backgroundColor: colores.fondo }]}>
      {/* Header con info y boton vaciar */}
      {!vacia && (
        <View
          style={[
            styles.header,
            {
              backgroundColor: colores.fondoSuperficie,
              borderBottomColor: colores.borde,
            },
          ]}
        >
          <View style={styles.headerInfo}>
            <Text
              style={[styles.headerContador, { color: colores.textoPrincipal }]}
            >
              {papelera.length === 1
                ? TEXTOS.papeleraContadorUno
                : TEXTOS.papeleraContadorVarias(papelera.length)}
            </Text>
            <Text
              style={[styles.headerNota, { color: colores.textoSecundario }]}
            >
              {TEXTOS.papeleraNota}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.botonVaciar,
              { backgroundColor: colores.peligro },
              pressed && { opacity: 0.85 },
            ]}
            onPress={handleSolicitarVaciar}
          >
            <Ionicons name="trash" size={16} color="#FFFFFF" />
            <Text style={styles.botonVaciarTexto}>
              {TEXTOS.botonVaciarPapelera}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Lista o mensaje vacio */}
      {vacia ? (
        <View style={styles.centrado}>
          <Ionicons name="trash-outline" size={64} color="#CCCCCC" />
          <Text style={[styles.textoVacio, { color: colores.textoSecundario }]}>
            {TEXTOS.papeleraVacia}
          </Text>
          <Text style={[styles.textoVacioNota, { color: colores.textoSecundario }]}>
            {TEXTOS.papeleraNota}
          </Text>
        </View>
      ) : (
        <FlatList
          data={papelera}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TareaEliminadaItem
              tarea={item}
              onRestaurar={handleRestaurar}
              onEliminarPermanente={handleSolicitarEliminarPermanente}
            />
          )}
          contentContainerStyle={styles.listaContenido}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modales */}
      <ModalConfirmacion
        visible={tareaAEliminar !== null}
        titulo={TEXTOS.confirmarEliminarPermanenteTitulo}
        mensaje={TEXTOS.confirmarEliminarPermanenteMensaje}
        textoConfirmar={TEXTOS.botonEliminar}
        textoCancelar={TEXTOS.botonCancelar}
        icono="trash-outline"
        colorPeligro={true}
        onConfirmar={handleConfirmarEliminarPermanente}
        onCancelar={handleCancelarEliminarPermanente}
      />

      <ModalConfirmacion
        visible={confirmarVaciar}
        titulo={TEXTOS.confirmarVaciarPapeleraTitulo}
        mensaje={TEXTOS.confirmarVaciarPapeleraMensaje}
        textoConfirmar={TEXTOS.botonVaciarPapelera}
        textoCancelar={TEXTOS.botonCancelar}
        icono="warning-outline"
        colorPeligro={true}
        onConfirmar={handleConfirmarVaciar}
        onCancelar={handleCancelarVaciar}
      />

      <Snackbar
        visible={snackbarVisible}
        mensaje={TEXTOS.tareaRestauradaMensaje}
        duracion={3000}
        onCerrar={() => setSnackbarVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  headerInfo: {
    gap: 2,
  },
  headerContador: {
    fontSize: 15,
    fontWeight: '700',
  },
  headerNota: {
    fontSize: 12,
  },
  botonVaciar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  botonVaciarTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
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
  textoVacioNota: {
    marginTop: 6,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 260,
  },
  listaContenido: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
});