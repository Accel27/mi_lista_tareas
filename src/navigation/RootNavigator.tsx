// ============================================================
// NAVEGADOR PRINCIPAL
// Define los 3 tabs (Papelera, Home, Config) y aplica el
// tema (claro/oscuro) a los headers, tabs y fondos.
// ============================================================

import { useMemo } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import PapeleraScreen from '../screens/PapeleraScreen';
import ConfigScreen from '../screens/ConfigScreen';
import { TEXTOS } from '../constants';
import { useTema } from '../hooks/useTema';

export type RootTabParamList = {
  Home: undefined;
  Papelera: undefined;
  Config: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function RootNavigator() {
  const { colores, esOscuro } = useTema();

  // Tema de React Navigation: afecta los headers, el fondo
  // de las pantallas, los tabs y las transiciones.
  const navigationTheme = useMemo(
    () => ({
      ...(esOscuro ? DarkTheme : DefaultTheme),
      colors: {
        ...(esOscuro ? DarkTheme.colors : DefaultTheme.colors),
        primary: colores.primario,
        background: colores.fondo,
        card: colores.fondoSuperficie,
        text: colores.textoPrincipal,
        border: colores.borde,
      },
    }),
    [colores, esOscuro]
  );

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Papelera') {
              iconName = focused ? 'trash' : 'trash-outline';
            } else {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colores.tabActivo,
          tabBarInactiveTintColor: colores.tabInactivo,
          tabBarStyle: {
            backgroundColor: colores.fondoSuperficie,
            borderTopColor: colores.borde,
          },
          headerStyle: {
            backgroundColor: colores.fondoSuperficie,
          },
          headerTintColor: colores.textoPrincipal,
          headerShadowVisible: false,
        })}
      >
        <Tab.Screen
          name="Papelera"
          component={PapeleraScreen}
          options={{ title: TEXTOS.tabPapelera }}
        />
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: TEXTOS.tabHome }}
        />
        <Tab.Screen
          name="Config"
          component={ConfigScreen}
          options={{ title: TEXTOS.tabConfig }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}