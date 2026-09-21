// ============================================================
// COMPONENTE ModalConfirmacion
// Modal generico para pedir confirmacion al usuario.
// Reutilizable y adaptado al tema.
// ============================================================

import { useMemo } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORES } from '../constants';
import { useTema } from '../hooks/useTema';

interface Props {
  visible: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  icono?: keyof typeof Ionicons.glyphMap;
  colorPeligro?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ModalConfirmacion({
  visible,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  icono = 'alert-circle-outline',
  colorPeligro = true,
  onConfirmar,
  onCancelar,
}: Props) {
  const { colores } = useTema();
  const styles = useMemo(() => crearEstilos(colores), [colores]);

  const colorIcono = colorPeligro ? colores.peligro : colores.primario;
  const colorFondoIcono = colorPeligro
    ? colores.peligro + '22'
    : colores.primario + '22';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancelar}
    >
      <View style={styles.fondo}>
        <View style={styles.contenedor}>
          <View
            style={[styles.iconoContenedor, { backgroundColor: colorFondoIcono }]}
          >
            <Ionicons name={icono} size={36} color={colorIcono} />
          </View>

          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.mensaje}>{mensaje}</Text>

          <View style={styles.botones}>
            <Pressable
              style={({ pressed }) => [
                styles.boton,
                styles.botonCancelar,
                pressed && styles.botonPresionado,
              ]}
              onPress={onCancelar}
            >
              <Text style={styles.botonCancelarTexto}>{textoCancelar}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.boton,
                {
                  backgroundColor: colorPeligro
                    ? colores.peligro
                    : colores.primario,
                },
                pressed && styles.botonPresionado,
              ]}
              onPress={onConfirmar}
            >
              <Text style={styles.botonConfirmarTexto}>{textoConfirmar}</Text>
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
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    contenedor: {
      backgroundColor: c.fondoSuperficie,
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 340,
      alignItems: 'center',
    },
    iconoContenedor: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    titulo: {
      fontSize: 18,
      fontWeight: '700',
      color: c.textoPrincipal,
      textAlign: 'center',
      marginBottom: 8,
    },
    mensaje: {
      fontSize: 14,
      color: c.textoSecundario,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
    },
    botones: {
      flexDirection: 'row',
      gap: 10,
      width: '100%',
    },
    boton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    botonPresionado: {
      opacity: 0.85,
    },
    botonCancelar: {
      backgroundColor: c.fondoInput,
    },
    botonCancelarTexto: {
      fontSize: 15,
      fontWeight: '600',
      color: c.textoSecundario,
    },
    botonConfirmarTexto: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
}