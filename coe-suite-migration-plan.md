# COE Suite — Plan de Migración a React

## Objetivo

Migrar la aplicación COE Suite de un archivo HTML/JS monolítico (`17,908` líneas) a un proyecto React moderno con TypeScript, consumiendo el Design System `@coe/design-system`.

## Arquitectura objetivo

```
coe-suite/
├── src/
│   ├── layouts/
│   │   └── AppShell.tsx          # Sidebar + Topbar + Router outlet
│   ├── pages/
│   │   ├── Dashboard/            # Panel principal con KPIs
│   │   ├── BotForecast/          # COENGINE BOT
│   │   ├── Forecast/             # COENGINE IA
│   │   ├── KpiGerencial/         # KPIs Estratégicos
│   │   ├── KpiOperativo/         # KPIs Operativos
│   │   ├── PerfilBanco/          # Perfil Banco
│   │   ├── PerfilBCV/            # Perfil Banco Central
│   │   ├── PerfilTransportista/  # Perfil CIT
│   │   ├── PerfilCorporativo/    # Perfil Corp
│   │   ├── PerfilNegocios/       # Perfil Negocios
│   │   ├── WarRoom/              # War Room · Tesorería
│   │   ├── Reportes/             # Reportes Operativos
│   │   ├── ReportesRegulatorios/ # Reportes Regulatorios
│   │   ├── Transacciones/        # Todas las Transacciones
│   │   ├── Georef/               # Mapa Interactivo (Leaflet)
│   │   └── Config/               # Configuraciones
│   ├── components/
│   │   ├── ui/                   # Wrappers del DS (CoeButton, CoeCard, etc.)
│   │   ├── kpi/                  # KpiCard, ScorecardGrid
│   │   ├── charts/               # Chart.js wrappers
│   │   ├── map/                  # Leaflet wrappers
│   │   ├── modals/               # Modal components
│   │   └── shared/               # Badge, Panel, Table, Tabs, etc.
│   ├── stores/                   # Zustand stores
│   │   ├── navStore.ts           # Navegación (vista activa, título)
│   │   ├── userStore.ts          # Usuario actual
│   │   ├── opStore.ts            # Operaciones / TXN_STORE
│   │   ├── inventoryStore.ts     # Inventarios
│   │   ├── botStore.ts           # Estado del COENGINE BOT
│   │   ├── configStore.ts        # Configuraciones (bóvedas, productos, etc.)
│   │   └── warRoomStore.ts       # War Room data
│   ├── data/
│   │   ├── users.ts              # USERS_DB
│   │   ├── operations.ts         # OPT definitions
│   │   ├── inventory.ts          # INVENTARIOS, INV_DETALLE
│   │   ├── geography.ts          # GEO_REGIONES, GEO_NODOS
│   │   ├── products.ts           # PRODUCTOS_CONFIG
│   │   ├── vaults.ts             # BOVEDAS_CONFIG
│   │   └── bot.ts                # BOT_STATE, BOT_MOCK_PROPS
│   ├── hooks/
│   │   ├── useChart.ts           # Chart.js initialization
│   │   ├── useMap.ts             # Leaflet map
│   │   └── useToast.ts           # Toast notifications
│   ├── lib/
│   │   ├── chart.ts              # Chart.js helpers
│   │   ├── map.ts                # Leaflet helpers
│   │   └── format.ts             # Currency, date formatters
│   ├── App.tsx                   # Router principal
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Tailwind + DS imports
├── public/
│   └── Icono coe.png
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Fases

### Sprint 1: Fundación + Dashboard + COENGINE BOT (~1 semana)

| Paso | Descripción | Archivos clave |
|------|-------------|----------------|
| 1.1 | Setup Vite + React 19 + TypeScript | `vite.config.ts`, `tsconfig.json`, `package.json` |
| 1.2 | Configurar Tailwind CSS v4 + DS tokens | `src/index.css` |
| 1.3 | Crear AppShell con Sidebar (DS) + Topbar + Router | `src/layouts/AppShell.tsx` |
| 1.4 | Crear NavStore + UserStore | `src/stores/navStore.ts`, `userStore.ts` |
| 1.5 | Migrar mock data (users, bot state, dashboard data) | `src/data/` |
| 1.6 | Componentes compartidos: CoeBadge, CoePanel, CoeButton | `src/components/shared/` |
| 1.7 | **Dashboard**: KPIs, Dual Balance, Weekly Chart, Panels | `src/pages/Dashboard/` |
| 1.8 | **COENGINE BOT**: toggles, canales, estado, acciones | `src/pages/BotForecast/` |
| 1.9 | Placeholder pages (Coming soon → link a HTML legacy) | `src/pages/ComingSoon.tsx` |

### Sprint 2: KPIs + Perfiles + Config (~1 semana)

| Paso | Descripción |
|------|-------------|
| 2.1 | KPI Gerencial: scorecards, IED module, Chart.js |
| 2.2 | KPI Operativo: tablas de rotación, stock-outs |
| 2.3 | Perfil Banco: tabs, operaciones, inventario |
| 2.4 | Perfil BCV: emisión, distribución, encaje legal |
| 2.5 | Perfil Transportista: flota, manifiestos |
| 2.6 | Perfil Corporativo: portal B2B |
| 2.7 | Perfil Negocios: compromisos, denominaciones |
| 2.8 | Config: users, vaults, products, tariffs |

### Sprint 3: War Room + COENGINE IA + Reportes (~1 semana)

| Paso | Descripción |
|------|-------------|
| 3.1 | War Room: grid de bancos, filtros, compromisos |
| 3.2 | COENGINE IA: históricos, calibración Montecarlo |
| 3.3 | Reportes Operativos: tabla + filtros |
| 3.4 | Reportes Regulatorios: BCV, SUDEBAN |
| 3.5 | Transacciones: todas las operaciones |
| 3.6 | Georef: Leaflet map con markers |

### Sprint 4: Modales + State Machine + Pulido (~1 semana)

| Paso | Descripción |
|------|-------------|
| 4.1 | Modal de operaciones (2-step wizard) |
| 4.2 | State Machine (stepper de flujo) |
| 4.3 | Modal de aprobación, reglas, IED, etc. |
| 4.4 | Toast notification system |
| 4.5 | Dark mode + responsive |
| 4.6 | Animaciones de entrada |
| 4.7 | Eliminar dependencia del HTML legacy |

## Design System — Componentes disponibles

| Componente DS | Uso en COE Suite |
|---------------|------------------|
| `Sidebar` | Navegación lateral |
| `Button` | Todos los botones (4 variantes × 2 tamaños) |
| `Card` | Paneles, KPI cards |
| `Table` | Tablas de datos |
| `Tabs` | Sub-tabs en perfiles |
| `Badge` | Badges de estado (OK, Alerta, Déficit) |
| `Dialog` | Modales |
| `Toast` | Notificaciones |
| `ProgressBar` | Barras de progreso |
| `Switch` | Toggles (BOT activo/inactivo) |
| `Stepper` | State machine de operaciones |
| `Input` / `Select` | Formularios |
| `Avatar` | Avatar de usuario |
| `Skeleton` | Loaders |
| `KpiCard` | Tarjetas KPI |
| `Tag` | Tags de filtro |

## Convenciones

- **Naming**: PascalCase para componentes, camelCase para stores/hooks/utils
- **Estilos**: Tailwind CSS v4 con tokens del DS (nunca CSS manual)
- **Estado global**: Zustand (stores modulares por dominio)
- **Routing**: React Router con layouts anidados
- **Iconos**: `react-icons` (lucide) — reemplazo de FontAwesome
- **Gráficos**: Chart.js 4.x con wrapper React
- **Mapas**: Leaflet 1.9.x con wrapper React
- **Tipado**: TypeScript estricto, interfaces para toda la data mock

## Legacy

El archivo original `20260529_194438.html` y su backup están preservados en `legacy/`. No se modifican durante la migración. Las vistas no migradas redirigen a una pantalla "Coming soon" con enlace al HTML legacy.
