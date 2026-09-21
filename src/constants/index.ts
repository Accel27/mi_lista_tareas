// ============================================================
// CONSTANTES GLOBALES
// Colores, textos y valores por defecto que se usan
// en toda la aplicacion. Centralizados aqui para no
// repetirlos y para poder cambiarlos en un solo lugar.
// ============================================================

import { Categoria, ModoTema, Prioridad, EstadoTarea } from '../types';

// ------------------------------------------------------------
// PALETA DE COLORES
// ------------------------------------------------------------

export const COLORES = {
  claro: {
    // Fondos
    fondo: '#F5F5F5',
    fondoSuperficie: '#FFFFFF',
    fondoInput: '#EFEFEF',

    // Textos
    textoPrincipal: '#1A1A1A',
    textoSecundario: '#666666',
    textoInverso: '#FFFFFF',

    // Bordes y separadores
    borde: '#DDDDDD',

    // Marca (color de acento principal)
    primario: '#4A6FA5',
    primarioOscuro: '#3A5580',

    // Estados
    exito: '#4CAF50',
    advertencia: '#FF9800',
    peligro: '#E53935',

    // Tabs
    tabActivo: '#4A6FA5',
    tabInactivo: '#999999',
  },

  oscuro: {
    // Fondos
    fondo: '#121212',
    fondoSuperficie: '#1E1E1E',
    fondoInput: '#2A2A2A',

    // Textos
    textoPrincipal: '#F5F5F5',
    textoSecundario: '#AAAAAA',
    textoInverso: '#1A1A1A',

    // Bordes y separadores
    borde: '#333333',

    // Marca
    primario: '#6A8FC5',
    primarioOscuro: '#4A6FA5',

    // Estados
    exito: '#66BB6A',
    advertencia: '#FFA726',
    peligro: '#EF5350',

    // Tabs
    tabActivo: '#6A8FC5',
    tabInactivo: '#777777',
  },
} as const;

// ------------------------------------------------------------
// COLORES DE PRIORIDAD
// ------------------------------------------------------------

export const COLORES_PRIORIDAD: Record<Prioridad, string> = {
  baja: '#4CAF50',
  media: '#FF9800',
  alta: '#E53935',
};

// ------------------------------------------------------------
// ETIQUETAS DE PRIORIDAD
// ------------------------------------------------------------

export const ETIQUETAS_PRIORIDAD: Record<Prioridad, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
};

// ------------------------------------------------------------
// ETIQUETAS DE ESTADO
// ------------------------------------------------------------

export const ETIQUETAS_ESTADO: Record<EstadoTarea, string> = {
  pendiente: 'Pendiente',
  'en-progreso': 'En progreso',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

// ------------------------------------------------------------
// COLORES DE ESTADO
// ------------------------------------------------------------

export const COLORES_ESTADO: Record<EstadoTarea, string> = {
  pendiente: '#9E9E9E',
  'en-progreso': '#2196F3',
  completada: '#4CAF50',
  cancelada: '#E53935',
};

// ------------------------------------------------------------
// CATEGORIAS POR DEFECTO
// ------------------------------------------------------------

export const CATEGORIAS_POR_DEFECTO: Categoria[] = [
  { id: 'cat-personal', nombre: 'Personal', color: '#4A6FA5' },
  { id: 'cat-trabajo', nombre: 'Trabajo', color: '#7E57C2' },
  { id: 'cat-estudio', nombre: 'Estudio', color: '#26A69A' },
];

// ------------------------------------------------------------
// CONFIGURACION INICIAL
// ------------------------------------------------------------

export const CONFIGURACION_INICIAL = {
  modoTema: 'claro' as ModoTema,
  categorias: CATEGORIAS_POR_DEFECTO,
  notificacionesActivas: true,
  minutosRecordatorio: 10,
};

// ------------------------------------------------------------
// VALORES DE LA APLICACION
// ------------------------------------------------------------

export const TAREAS_POR_PAGINA = 5;
export const DIAS_EXPIRACION_PAPELERA = 7;
export const MAX_LONGITUD_TITULO = 80;
export const MAX_LONGITUD_DESCRIPCION = 500;
export const MAX_LONGITUD_CATEGORIA = 20;

// ------------------------------------------------------------
// CLAVES DE ALMACENAMIENTO (AsyncStorage)
// ------------------------------------------------------------

export const STORAGE_KEYS = {
  tareas: '@mi_lista_tareas:tareas',
  papelera: '@mi_lista_tareas:papelera',
  configuracion: '@mi_lista_tareas:configuracion',
} as const;

// ------------------------------------------------------------
// TEXTOS REUTILIZABLES (lo que ve el usuario)
// ------------------------------------------------------------

export const TEXTOS = {
  appNombre: 'Mi Lista de Tareas',

  // Navegacion inferior
  tabHome: 'Inicio',
  tabPapelera: 'Papelera',
  tabConfig: 'Ajustes',

  // Pantalla Home
  buscarPlaceholder: 'Buscar tareas...',
  sinTareas: 'No hay tareas. ¡Crea una para empezar!',
  sinResultados: 'No se encontraron tareas con esos filtros.',

  // Botones generales
  botonCrear: 'Nueva tarea',
  botonGuardar: 'Guardar',
  botonCancelar: 'Cancelar',
  botonEliminar: 'Eliminar',
  botonRestaurar: 'Restaurar',
  botonDeshacer: 'Deshacer',
  botonConfirmar: 'Confirmar',
  botonAplicarFiltros: 'Aplicar filtros',
  botonLimpiarFiltros: 'Limpiar filtros',

  // Modal de tarea
  modalTareaCrear: 'Nueva tarea',
  modalTareaEditar: 'Editar tarea',
  labelTitulo: 'Título',
  labelDescripcion: 'Descripción',
  labelPrioridad: 'Prioridad',
  labelEstado: 'Estado',
  labelCategoria: 'Categoría',
  labelFechaVencimiento: 'Vencimiento',
  placeholderTitulo: 'Ej: Comprar despensa',
  placeholderDescripcion: 'Detalles adicionales (opcional)',
  sinCategoria: 'Sin categoría',
  sinFecha: 'Sin fecha',
  errorTituloRequerido: 'El título es obligatorio',

  // Confirmaciones (Home)
  confirmarEliminarTitulo: 'Eliminar tarea',
  confirmarEliminarMensaje:
    '¿Seguro que quieres enviar esta tarea a la papelera?',

  // Papelera
  papeleraVacia: 'La papelera está vacía.',
  papeleraNota:
    'Las tareas se eliminan automáticamente después de 7 días.',
  papeleraContadorUno: '1 tarea en la papelera',
  papeleraContadorVarias: (n: number) => `${n} tareas en la papelera`,
  botonVaciarPapelera: 'Vaciar papelera',
  confirmarEliminarPermanenteTitulo: 'Eliminar permanentemente',
  confirmarEliminarPermanenteMensaje:
    'Esta tarea se eliminará para siempre. Esta acción no se puede deshacer.',
  confirmarVaciarPapeleraTitulo: 'Vaciar papelera',
  confirmarVaciarPapeleraMensaje:
    'Se eliminarán TODAS las tareas de la papelera. Esta acción no se puede deshacer.',
  eliminadaHace: 'Eliminada hace',
  expiraEnDias: 'Se elimina en',
  expiraHoy: 'Se elimina hoy',
  expiraUnDia: 'Se elimina mañana',
  tareaEliminada: 'Tarea enviada a la papelera',
  tareaRestauradaMensaje: 'Tarea restaurada',

  // Configuracion - Secciones
  seccionApariencia: 'Apariencia',
  seccionNotificaciones: 'Notificaciones',
  seccionCategorias: 'Categorías',
  seccionZonaPeligro: 'Zona peligrosa',
  seccionAcercaDe: 'Acerca de',

  // Configuracion - Tema
  etiquetaTema: 'Tema de la aplicación',
  temaClaro: 'Claro',
  temaOscuro: 'Oscuro',

  // Configuracion - Notificaciones
  etiquetaNotificaciones: 'Activar recordatorios',
  etiquetaNotificacionesDesc:
    'Recibe avisos antes de que venza una tarea',
  etiquetaMinutos: 'Avisar con anticipación',
  minutosAntes: (n: number) => `${n} minutos antes`,
  sinAnticipacion: 'Justo al vencer',
  etiquetaSinPermiso:
    'Necesitas dar permiso de notificaciones en tu teléfono',

  // Configuracion - Categorias
  etiquetaNuevaCategoria: 'Nueva categoría',
  placeholderNombreCategoria: 'Ej: Ejercicio',
  botonAgregarCategoria: 'Agregar',
  confirmarEliminarCategoriaTitulo: 'Eliminar categoría',
  confirmarEliminarCategoriaMensaje:
    'Las tareas que usaban esta categoría quedarán sin categoría. ¿Continuar?',
  errorCategoriaVacia: 'El nombre no puede estar vacío',
  errorCategoriaDuplicada: 'Ya existe una categoría con ese nombre',
  sinCategorias: 'No hay categorías creadas',

  // Configuracion - Reset
  botonVaciarPapeleraConfig: 'Vaciar papelera',
  botonVaciarPapeleraConfigDesc:
    'Elimina todas las tareas de la papelera',
  botonBorrarTodo: 'Borrar todos los datos',
  botonBorrarTodoDesc: 'Elimina tareas, papelera y configuración',
  confirmarBorrarTodoTitulo: 'Borrar todos los datos',
  confirmarBorrarTodoMensaje:
    'Se eliminarán TODAS las tareas, la papelera y la configuración. Esta acción no se puede deshacer.',
  botonBorrarTodoConfirmar: 'Borrar todo',
  datosBorrados: 'Todos los datos fueron eliminados',

  // Acerca de
  acercaVersion: 'Versión 1.0.0',
  acercaDescripcion: 'Aplicación de lista de tareas',
  acercaMateria: 'Aplicaciones Móviles',
} as const;