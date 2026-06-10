# Changelog

## [Unreleased]

### Migration DS
- Migrado design system de GitHub (`@worksuiux-ctrl/my-design-system`) a GitLab (`@coe/design-system`)
- Actualizados imports en ~43 archivos
- Eliminado `.npmrc` con token de GitHub Packages
- Corregido exports de CSS en package.json del DS (`my-design-system.css` → `design-system.css`)

### KpiCard
- Agrupado value + trend + subtitle en estructura consistente:
  - `[Label]`
  - `[Valor]` ← línea propia
  - `[↑ Trend] [Subtitle]` ← juntos debajo (si existen)
- Indicadores que usan subtitle sin trend: se muestra debajo del valor
- Indicadores que usan trend: se muestra junto al subtitle (si existe)

### Layout
- AppShell: fondo lava lamp con elipses radiales difuminadas (verde, azul, morado, cyan)
- Topbar: efecto glassmorphism (`bg-white/70 backdrop-blur-xl`)
- Sidebar:
  - Items activos: pill verde sólido con texto blanco + sombra
  - Items hover: fondo verde suave + texto verde
  - Bordes redondeados `rounded-corner-m`
  - Transiciones `duration-200`
  - Iconos inactivos con opacidad 60%
  - Altura alineada con Topbar (58px)
  - Padding lateral para evitar que items toquen el borde

### Fixes
- Ruta de "Panel General" corregida de `"/"` a `"/dashboard"`

### Entity Creator (Configuración / Unidades)
- Creado `docs/modelo-entidades.md` con documentación del modelo jerárquico
- Creado `src/data/entityCatalog.ts` — catálogo de tipos de entidad con niveles, subtipos y reglas de hijos permitidos
- Creado `src/stores/entitiesStore.ts` — store Zustand para CRUD en memoria con datos demo
- Creado `src/components/entities/EntityTree.tsx` — árbol jerárquico expandible con selección
- Creado `src/components/entities/EntityForm.tsx` — modal de creación/edición con validación por nivel
- Creado `src/components/entities/EntityDetail.tsx` — panel de detalle con info, hijos y acciones
- Creado `src/components/entities/EntityDiagram.tsx` — diagrama interactivo con React Flow (@xyflow/react v12 + dagre)
  - Visualización jerárquica automática (top-down)
  - Nodos coloreados por tipo de entidad
  - Reconexión de aristas para re-asignar padres
  - Arrastre libre de nodos
  - Sincronización de selección con panel de detalle
- Instalado `@xyflow/react` + `dagre` para diagramas
- Unidades.tsx: toggle Árbol/Diagrama en cabecera + layout dinámico

### Entity Schemas (Campos dinámicos por nivel)
- Creado `src/data/entitySchemas.ts` — schema con Propiedades + Parámetros para cada entidad
  - 14 tipos de campos: text, number, select, multiSelect, geolocation, time, switch, textarea
  - Campos condicionales (dependOn) ej: "Proveedor" solo si Propiedad=Proveedor
  - Basado en especificación completa `docs/estructura_datos_coe_completa.md`
- Entity.metadata: campo `Record<string, unknown>` en store para datos extra
- EntityForm.tsx: tabs (Básicos | Propiedades | Parámetros) con renderizado dinámico según schema
- EntityDetail.tsx: muestra metadata capturada en vista de detalle

### Tooling
- Creado `CONTRIBUTING.md` con branch strategy y conventional commits
- Rama `cmillan` para trabajo individual
