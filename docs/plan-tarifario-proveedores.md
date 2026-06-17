# Plan: Módulo Tarifario de Proveedores

## Objetivo

Construir un sistema de tarifario robusto que, según el **tipo de proveedor**, habilite **categorías de servicio** específicas, cada una con sus **variables tarifarias** configurables (distancia, peso, valor remesa, etc.) y la capacidad de **asignar unidades/vehículos** a servicios de traslado.

---

## Fase 1 — Extensión del Modelo de Datos

### 1.1 Catálogo de Tipos de Proveedor

Cada `tipoProveedor` define qué categorías de servicio ofrece:

| Tipo Proveedor | Categorías de Servicio |
|---|---|
| Transportista de Valores | Traslado, Custodia, Conteo, Manipulación, Consumible |
| Seguridad | Monitoreo, Vigilancia Electrónica, Respuesta a Emergencias, Consumible |
| Insumos | Consumible |
| Tecnología | Soporte Técnico, Instalación, Mantenimiento, Consumible |
| Mantenimiento | Mantenimiento Preventivo, Mantenimiento Correctivo, Consumible |

### 1.2 Categorías de Servicio y Variables Tarifarias

Cada categoría tiene un conjunto de **variables** que alimentan el cálculo de precio:

| Categoría | Variables Tarifarias | Unidad |
|---|---|---|
| **Traslado** | distancia, peso, valorRemesa, gasolina, peajes, tiempoEstimado | km, kg, $, litros, $, hrs |
| **Custodia** | tiempo, valorAsegurado, nivelRiesgo | hrs, $, enum |
| **Conteo** | volumenUnidades, tipoBillete, tiempoEstimado | fajos/piezas, enum, hrs |
| **Manipulación** | peso, volumen, tipoOperacion | kg, m³, enum |
| **Consumible** | cantidad, precioUnitario | unidades, $ |
| **Monitoreo** | tiempo, cantidadDispositivos, nivelCobertura | hrs/días, unidades, enum |
| **Vigilancia** | tiempo, cantidadDispositivos, almacenamiento | hrs, unidades, GB |
| **Soporte Técnico** | tiempo, nivelUrgencia, tipoEquipo | hrs, enum, enum |
| **Instalación** | cantidadEquipos, complejidad, distancia | unidades, enum, km |
| **Mantenimiento** | tiempo, tipoEquipo, periodicidad | hrs, enum, enum |

### 1.3 Variables Tarifarias — Estructura

Cada variable es un registro configurable:

```typescript
interface VariableTarifaria {
  id: string;
  servicioId: string;
  nombre: string;          // distancia, peso, valorRemesa, etc.
  etiqueta: string;        // "Distancia (km)"
  tipo: "numero" | "select" | "switch";
  opciones?: string[];     // para tipo select
  requerida: boolean;
  valorDefecto?: number | string;
  factorCalculo: number;   // multiplicador para el tarifario
}
```

### 1.4 Relación Servicio → Unidades (Traslados)

Para servicios de categoría **Traslado**, se pueden asignar una o más unidades operativas:

```typescript
interface ServicioUnidad {
  servicioId: string;
  unidadId: string;
  rol: string;             // Principal, Secundario, Backup
  fechaAsignacion: string;
}
```

### 1.5 Interfaces Propuestas

```typescript
// Extensión de Proveedor
interface Proveedor {
  // ...campos existentes
  tipoProveedor: TipoProveedor;  // "Transportista de Valores" | "Seguridad" | ...
}

// Nuevo: categorías de servicio por tipo de proveedor
interface CategoriaServicioConfig {
  tipoProveedor: string;
  categorias: string[];    // ["Traslado", "Custodia", ...]
}

// Extensión de Servicio
interface Servicio {
  // ...campos existentes
  categoria: string;        // "Traslado" | "Custodia" | "Conteo" | ...
  variables: VariableTarifaria[];
  formula: string;          // Opcional: fórmula personalizada ej: "(distancia*0.5)+(peso*0.05)"
}

// Nueva: asignación de unidades a servicio
interface ServicioUnidad {
  id: string;
  servicioId: string;
  unidadId: string;
  rol: "Principal" | "Secundario" | "Backup";
  fechaAsignacion: string;
}
```

---

## Fase 2 — Refactorización del Store

### 2.1 Cambios en `proveedoresStore.ts`

- Agregar `categoriasServicio` como catálogo: mapeo de `tipoProveedor → categorías[]`
- Extender `Servicio` con `categoria` y opcional `variables`
- Agregar `serviciosUnidades: ServicioUnidad[]` para asignación vehículos
- Nuevos métodos CRUD para `ServicioUnidad`
- Helper `getVariablesByCategoria(categoria): VariableTarifaria[]`
- Helper `calcularPrecio(servicioId, valores): number`

### 2.2 Datos Demo

- Proveedor "Trasvalven C.A." con servicios reales categorizados
  - Traslado: "Transporte de Valores CCS-Centro", "Transporte de Valores CCS-Este"
  - Custodia: "Custodia Temporal en Bóveda"
  - Conteo: "Conteo y Verificación Mecanizada"
  - Manipulación: "Manipulación de Efectivo"
  - Consumible: "Bolsas de Seguridad para Transporte"
- Variables demo con factores de cálculo
- Unidades demo (vehículos) para asignar a traslados

---

## Fase 3 — UI Dinámica

### 3.1 Formulario de Proveedor

- Selector de `tipoProveedor` que determina qué servicios estarán disponibles
- Agregar campos: RIF, Razón Social, Domicilio Fiscal, Nivel de Riesgo, Status Auditoría

### 3.2 Formulario de Servicio (dinámico)

- Al crear/editar un servicio, primero seleccionar **proveedor** → luego **categoría** (según tipo de proveedor)
- Según la categoría, mostrar las **variables tarifarias** correspondientes con sus campos
- Para **Traslado**: sección de asignación de unidades (vehículos)
- Vista previa del cálculo según valores ingresados

### 3.3 Tabla de Servicios

- Nueva columna: Categoría
- Badge/filtro por categoría
- Tooltip con variables tarifarias

---

## Fase 4 — Selección de Unidades para Traslados

### 4.1 Catálogo de Unidades

- Las unidades se toman del catálogo de `Vehículos` existente (entityCatalog)
- Se filtran por disponibilidad
- Se muestran: placa, modelo, capacidad, nivel de seguridad

### 4.2 Asignación en el Servicio

- Dentro del formulario de servicio (cuando categoría = Traslado):
  - Selector múltiple de unidades
  - Asignar rol a cada unidad (Principal/Secundario/Backup)
  - Resumen de unidades asignadas

### 4.3 Store de Unidades

- Integración con `unidadesStore` existente o proveedores temporal
- Relación desde proveedor: `Proveedor → Vehículos` (tal como indica entityCatalog)

---

## Fase 5 — Motor de Tarifario

### 5.1 Fórmula Base

```
precio_base = SUM(variable[i].valor * variable[i].factorCalculo)
```

Ejemplo para Traslado:
```
precio = (distancia_km * 0.50) + (peso_kg * 0.05) + (valor_remesa * 0.001) + (gasolina_litros * 1.20) + costo_base
```

### 5.2 Modos de Cálculo

- **Automático**: usa las variables y factores definidos
- **Manual**: permite escribir fórmula personalizada
- **Híbrido**: fórmula base + recargos por variables adicionales

### 5.3 Vista de Cálculo

- Panel de simulación dentro del formulario de servicio
- A medida que se ingresan variables, se actualiza el precio estimado
- Desglose de cada componente del precio

### 5.4 Persistencia

- La fórmula y factores se guardan por servicio
- Se puede recalcular al modificar variables
- Historial de cambios de tarifa (opcional)

---

## Resumen de Archivos a Modificar/Crear

| Archivo | Acción |
|---|---|
| `src/stores/proveedoresStore.ts` | Refactorizar — nuevas interfaces, métodos, datos demo |
| `src/pages/Configuracion/Proveedores.tsx` | Refactorizar — formularios dinámicos, selección unidades, tarifario |
| `src/data/entitySchemas.ts` | Actualizar schema de Proveedores |
| `src/data/entityCatalog.ts` | Actualizar subtipos de Proveedores si es necesario |
| `docs/plan-tarifario-proveedores.md` | Este archivo |

---

## Progreso

- [ ] **Fase 1**: Modelo de datos extendido
- [ ] **Fase 2**: Store con nuevas interfaces y demo data
- [ ] **Fase 3**: UI con formularios dinámicos
- [ ] **Fase 4**: Selección de unidades para traslados
- [ ] **Fase 5**: Motor de tarifario
