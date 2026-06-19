# Motor de Transacciones — Progreso

## Estructura
- `src/stores/transaccionesStore.ts` — Zustand store con interfaces, catálogo CAMPOS_PREDEFINIDOS, CRUD completo
- `src/pages/Configuracion/transacciones/MotorTransaccionesPage.tsx` — Página de 3 columnas
- Ruta: `/config/motor-transacciones`

## Interfaces
- `ProcesoTransaccional`: nombre, tipoCarga, origenTipo, destinoTipo, ambito, usaTransportista, transportistasPermitidos, steps
- `TransaccionStep`: nombre, orden, inventario (debita|acredita|ninguno), unidadInventario, eventoContable (placeholder), unidadResponsableId, transferenciaCarga, tipoAprobacion, timeoutMinutos, excepciones[], camposSeleccionados[]
- `Excepcion`: nombre, esTerminal, inventario (debita|acredita|ninguno), unidadInventario, eventoContable (placeholder), unidadResponsableId, ...
- `CampoPredefinido`: nombre, etiqueta, tipo, requerido, opciones[], aplicableA[]
- `TipoCampo`: "texto" | "numero" | "fecha" | "select" | "denominacion"

## Layout (3 columnas)
1. **Izquierda (260px):** Operaciones guardadas + "Crear Nueva Operación"
2. **Centro (flex):** 3 cards — Nombre, Origen-Destino/Ámbito, Flujo de pasos
3. **Derecha (320px):** Inspector de propiedades (paso o excepción seleccionada)

## Funcionalidad implementada
- Drag & drop para reordenar pasos
- Modo vista (solo lectura) al clickear operación guardada
- Modo edición con confirmación al clickear lápiz
- Perfil Responsable (Central/Agencia/Transportista/Externo)
- Ámbito (interna/entre-agencias/externa) — Transportista se desactiva en interna
- Descuento de inventario (Debita/Acredita) con unidad (Emisora/Receptora); Evento Contable placeholder para módulo de Contabilidad
- Campos predefinidos por tipo de unidad (checkboxes en inspector)
- Operación demo: "Envío de Remesa (Agencia a Agencia)" con 6 pasos y excepciones
- CAMPOS_PREDEFINIDOS: ~40 campos para Cajero, Bóveda, Caja, Agencia, Taquilla, Punto de Venta, Camión, Almacén, Banco + generales

## Constantes exportadas
- `TIPOS_UNIDAD`, `AMBITOS`, `PERFILES_RESPONSABLE`, `TIPOS_INVENTARIO`, `UNIDADES_INVENTARIO`, `TIPOS_APROBACION`, `CAMPOS_PREDEFINIDOS`, `TRANSPORTISTAS`, `TIPOS_CARGA`

## Store actions
- `setNombre`, `setTipoCarga`, `setOrigenTipo`, `setDestinoTipo`, `setAmbito`
- `setUsaTransportista`, `toggleTransportistaPermitido`
- `addStep`, `removeStep`, `moveStep`, `updateStepName`, `updateStepProperty`
- `addExcepcion`, `removeExcepcion`, `updateExcepcionName`, `updateExcepcionProperty`, `setExcepcionTerminal`
- `toggleCampoSeleccionado`
- `finalizeProceso`, `nuevoProceso`, `cargarProceso`, `eliminarProceso`

## Pendiente / Próximos pasos
- Modelar jerarquía de unidades padre (Bóveda→Anaqueles, Caja→Cofre, Cajero→Cajetines) para fase de ejecución
- Formulario de ejecución que renderice los campos dinámicamente según pasos
- Validación de campos requeridos al ejecutar
