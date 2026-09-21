// ============================================================
// COMPONENTE BarraBusqueda
// Barra de busqueda + boton de filtros. Se adapta al tema.
// ============================================================

import { useMemo } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORES, TEXTOS } from '../constants';
import { useTema } from '../hooks/useTema';

interface Props {
  valor: string;
  onCambiar: (texto: string) => void;
  onPressFiltros: () => void;
  filtrosActivos: number;
}

export default function BarraBusqueda({
  valor,
  onCambiar,
  onPressFiltros,
  filtrosActivos,
}: Props) {
  const { colores } = useTema();
  const styles = useMemo(() => crearEstilos(colores), [colores]);

  return (
    <View style={styles.contenedor}>
      <View style={styles.inputContenedor}>
        <Ionicons name="search" size={20} color={colores.textoSecundario} />

        <TextInput
          style={styles.input}
          placeholder={TEXTOS.buscarPlaceholder}
          placeholderTextColor={colores.textoSecundario}
          value={valor}
          onChangeText={onCambiar}
          autoCorrect={false}
          autoCapitalize="none"
        />

        {valor.length > 0 && (
          <Pressable onPress={() => onCambiar('')} hitSlop={10}>
            <Ionicons
              name="close-circle"
              size={20}
              color={colores.textoSecundario}
            />
          </Pressable>
        )}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.botonFiltros,
          pressed && styles.botonPresionado,
        ]}
        onPress={onPressFiltros}
        hitSlop={8}
      >
        <Ionicons name="filter" size={22} color="#FFFFFF" />

        {filtrosActivos > 0 && (
          <View style={styles.badgeContador}>
            <Text style={styles.badgeTexto}>{filtrosActivos}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

function crearEstilos(c: typeof COLORES.claro) {
  return StyleSheet.create({
    contenedor: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 10,
    },
    inputContenedor: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.fondoInput,
      borderRadius: 10,
      paddingHorizontal: 12,
      height: 44,
      gap: 8,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: c.textoPrincipal,
      paddingVertical: 0,
    },
    botonFiltros: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: c.primario,
      alignItems: 'center',
      justifyContent: 'center',
    },
    botonPresionado: {
      backgroundColor: c.primarioOscuro,
    },
    badgeContador: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: '#E53935',
      borderRadius: 10,
      minWidth: 18,
      height: 18,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    badgeTexto: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
    },
  });
}