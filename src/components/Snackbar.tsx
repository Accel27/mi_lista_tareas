// ============================================================
// COMPONENTE Snackbar
// Barra flotante en la parte inferior con mensaje y accion
// opcional. Por diseno (Material Design) es siempre oscuro,
// independientemente del tema claro/oscuro de la app.
// ============================================================

import { useEffect, useRef, useMemo } from 'react';
import { Text, Pressable, StyleSheet, Animated } from 'react-native';

interface Props {
  visible: boolean;
  mensaje: string;
  textoAccion?: string;
  duracion?: number;
  onAccion?: () => void;
  onCerrar: () => void;
}

export default function Snackbar({
  visible,
  mensaje,
  textoAccion,
  duracion = 5000,
  onAccion,
  onCerrar,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  const styles = useMemo(() => crearEstilos(), []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: visible ? 0 : 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, opacity, translateY]);

  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      onCerrar();
    }, duracion);

    return () => clearTimeout(timer);
  }, [visible, duracion, onCerrar]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.contenedor, { opacity, transform: [{ translateY }] }]}
    >
      <Text style={styles.mensaje} numberOfLines={2}>
        {mensaje}
      </Text>

      {textoAccion && onAccion && (
        <Pressable onPress={onAccion} hitSlop={10} style={styles.botonAccion}>
          <Text style={styles.botonAccionTexto}>{textoAccion}</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

function crearEstilos() {
  return StyleSheet.create({
    contenedor: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 90,
      backgroundColor: '#1A1A1A',
      borderRadius: 10,
      paddingVertical: 14,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      elevation: 6,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    mensaje: {
      flex: 1,
      color: '#FFFFFF',
      fontSize: 14,
      lineHeight: 18,
    },
    botonAccion: {
      paddingVertical: 6,
      paddingHorizontal: 8,
    },
    botonAccionTexto: {
      color: '#6A8FC5',
      fontSize: 14,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });
}