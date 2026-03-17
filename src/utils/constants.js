// Roles de usuario
export const ROLES = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  BARISTA: 'BARISTA'
};

// Estados de pedidos
export const ESTADOS_PEDIDO = {
  PENDIENTE: 'PENDIENTE',
  EN_PROCESO: 'EN_PROCESO',
  COMPLETADO: 'COMPLETADO',
  CANCELADO: 'CANCELADO',
  DEVUELTO: 'DEVUELTO'
};

// Monedas
export const MONEDAS = {
  USD: 'USD',
  VES: 'VES',
  COP: 'COP'
};

// Símbolos de monedas
export const SIMBOLOS_MONEDA = {
  USD: '$',
  VES: 'Bs.',
  COP: 'COP$'
};

// Categorías de productos
export const CATEGORIAS = [
  'JUGOS',
  'BATIDOS',
  'CAFÉ',
  'BEBIDAS FRÍAS',
  'SNACKS'
];

// Rutas de navegación por rol
export const RUTAS_ADMIN = [
  { path: '/dashboard',    name: 'Dashboard',       icon: 'bi-speedometer2'      },
  { path: '/productos',    name: 'Bebidas y Café',          icon: 'bi-cup-straw'         },
  { path: '/toppings',     name: 'Adicionales',         icon: 'bi-stars'             },
  { path: '/siropes',      name: 'Concentrados',          icon: 'bi-droplet-half'      },
  { path: '/ventas',       name: 'Nueva Venta',      icon: 'bi-cart-plus'         },
  { path: '/ventas/lista', name: 'Lista de Ventas',  icon: 'bi-receipt'           },
  { path: '/caja',         name: 'Flujo de Caja',    icon: 'bi-cash-stack'        },
  { path: '/tasas',        name: 'Tasas de Cambio',  icon: 'bi-currency-exchange' },
  { path: '/reportes',     name: 'Reportes',         icon: 'bi-graph-up'          }
];

export const RUTAS_BARISTA = [
  { path: '/pedidos', name: 'Mis Pedidos', icon: 'bi-clipboard-check' }
];

// Configuración de paginación
export const ITEMS_PER_PAGE = 10;

// Colores para estados
export const COLORES_ESTADO = {
  PENDIENTE:   'warning',
  EN_PROCESO:  'info',
  COMPLETADO:  'success',
  CANCELADO:   'danger',
  DEVUELTO:    'secondary'
};