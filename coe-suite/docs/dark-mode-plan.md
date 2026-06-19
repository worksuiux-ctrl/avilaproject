# Dark Mode — Plan de Implementación

## Estado Actual
- El design system (`@coe/design-system`) tiene una clase `.dark` con overrides parciales de variables `--color-surface-*`, `--color-text-*` y `--color-stroke-*`
- La app no tiene toggle, ni detección de `prefers-color-scheme`, ni uso de `dark:` variants
- +100 lugares usan `bg-white`, `text-gray-*`, `border-gray-*` hardcodeados

## Pasos

### 1. ThemeProvider (~30 min)
- Crear un `ThemeContext` con estado `light | dark`
- Detectar `prefers-color-scheme` con `matchMedia`
- Persistir preferencia en `localStorage`
- Proveer un toggle accesible (botón en Topbar)
- Aplicar/remover clase `.dark` en `<html>` o `<body>`

### 2. Extender variables CSS en `.dark` (~30 min)
Agregar en `src/index.css` o en el design system:
- `--color-neutro-100` → `#1f1f1f`
- `--color-neutro-200` → `#2f2f2f`
- `--color-neutro-300` → `#3f3f3f`
- `--color-neutro-500` → `#c2c7ca`
- `--color-neutro-800` → `#e1e1e1`
- `--color-neutro-900` → `#f3f4f6`
- `--color-verde-100` → versión más brillante o ajustada
- `--color-ind-*` → mantener legibilidad sobre fondo oscuro

### 3. Migrar `bg-white` a variables (2-3 hr)
Buscar `bg-white` en `src/` (100+ ocurrencias):
- Reemplazar con `bg-[var(--color-surface-white)]`
- Verificar que no rompa el layout en modo claro

### 4. Revisar colores hardcodeados (1-2 hr)
- `text-gray-*` → `text-[var(--color-neutro-*)]`
- `border-gray-*` → `border-[var(--color-stroke-*)]`
- Sombras, fondos de inputs, hover states, etc.

### 5. Pruebas (~1 hr)
- Probar cada pantalla en modo claro (sin regresión)
- Activar `.dark` y verificar contraste legibilidad
- Ajustar colores específicos que no funcionen

## Estimado total
**4-6 horas** de trabajo minucioso, más prueba y ajuste.
