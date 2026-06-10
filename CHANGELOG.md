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

### Tooling
- Creado `CONTRIBUTING.md` con branch strategy y conventional commits
- Rama `cmillan` para trabajo individual
