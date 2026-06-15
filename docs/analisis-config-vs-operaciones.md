# Análisis: Motor de Transacciones (Config) vs Operaciones

## Problema detectado

Cambios en la configuración (nombres de estados, estructura) no siempre se reflejan en las operaciones en ejecución, generando riesgo de divergencia entre lo configurado y lo que realmente ejecuta el sistema.

## ¿Cómo se sincroniza actualmente?

### Live-sync (se resuelve en vivo desde la plantilla)

- Nombre del estado actual → `template.steps.find(s => s.id === instancia.estadoActual).nombre`
- Siguiente paso → `template.steps[currentStepIdx + 1]`
- Excepciones disponibles → `currentStep.excepciones`
- Campos requeridos → `nextStep.camposSeleccionados`
- Orden de pasos → `template.steps[]` orden

### Snapshot (se copia en creación/transición)

- `instancia.nombre` — copia del nombre del proceso al crearse
- `historial[].stepName` — nombre del paso al momento de la transición
- Códigos de remesa/envío — generados al crear la instancia

### Bug conocido

El primer `stepName` en `historial` guarda el **nombre del proceso** en vez del nombre del primer paso (en `crearInstancia`, línea 74 de `instanciasStore.ts`).

## Brecha: lo que la operación hace pero la config NO captura

| Aspecto | En Config | En Operación |
|---------|-----------|--------------|
| Denominaciones (fajos/piezas) | ❌ Solo `modoIngreso` | ✅ Desglose completo con cantidad, denominación, total |
| Variables por paso (`requiereVariables`) | ✅ Campo `variables` (string) | ❌ No se renderizan campos de variables |
| Timeout (`timeoutMinutos`) | ✅ Configurado por paso | ❌ No hay timer ni alerta |
| Transferencia de carga | ✅ `transferenciaCarga` | ❌ No se muestra ni se ejecuta |
| Evento contable | ✅ `eventoContable` | ❌ No se ejecuta descuenta/suma |
| Aprobación | ✅ `requiereAprobacion` + `tipoAprobacion` | ❌ No se valida ni ejecuta |
| Retroceso en excepciones | ✅ `retrocedeA` (step ID) | ❌ No implementado |

## Riesgos identificados

| Riesgo | Impacto | Severidad |
|--------|---------|-----------|
| Eliminar un paso con instancias activas | Instancia huérfana: no muestra nombre, no puede avanzar | Alta |
| Reordenar pasos | El "siguiente paso" cambia para instancias en medio del flujo | Media |
| Cambiar excepciones | Excepciones nuevas/modificadas/eliminadas afectan acciones disponibles | Media |
| Cambiar campos seleccionados | Afecta qué campos se piden al avanzar | Media |
| Renombrar proceso | `instancia.nombre` (snapshot) desactualizado | Baja |
| Eliminar plantilla | Instancia referencias templateId inexistente | Alta |
| Sin versionado | No se sabe bajo qué versión se creó la instancia | Media |

## Pendientes a futuro

1. Agregar bloqueo de edición si hay instancias activas usando la plantilla
2. Sincronizar `instancia.nombre` con el nombre actual del proceso
3. Implementar en operaciones: variables, timeout, transferencia de carga, evento contable, aprobación, retroceso de excepciones
4. Versionado de plantillas para saber bajo qué versión se creó cada instancia
5. Validación de integridad al guardar cambios en config
