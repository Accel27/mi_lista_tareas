import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TareasProvider } from './src/context/TareasContext';
import RootNavigator from './src/navigation/RootNavigator';
import { useTema } from './src/hooks/useTema';

/**
 * La StatusBar (barra superior del telefono) cambia de color
 * segun el modo del tema. Debe estar DENTRO del TareasProvider
 * para poder acceder al tema.
 */
function BarraEstadoTematica() {
  const { esOscuro } = useTema();
  return <StatusBar style={esOscuro ? 'light' : 'dark'} />;
}

function ContenidoApp() {
  return (
    <>
      <RootNavigator />
      <BarraEstadoTematica />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TareasProvider>
          <ContenidoApp />
        </TareasProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}