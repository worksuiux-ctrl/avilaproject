# Contexto de Diseño de Interfaz: Estructura de Datos por Entidad (10/10)
**Proyecto:** Sistema COE  
**Documento:** Especificación de Campos (Propiedades y Parámetros) para UI/UX  
**Estado:** Completo  

---

## 1. Entidad Principal
* **Definición:** La Agencia define el "Contexto". Puede contener o agrupar otras entidades (Depósitos, Sub Entidades).

### Propiedades
* **UID:** Identificador único.
* **Nombre:** Texto descriptivo de la entidad.
* **Código:** Código identificador único.
* **Tipo:** Selector que define el **Giro de Negocio** (ej: Banco, Farmacia, Restaurante, etc.). 
  * *Nota de UI:* Este campo condiciona qué tipo de unidades se pueden "ligar" en los flujos posteriores.
* **Dirección:** Ubicación física.
* **Geolocation / Coordenadas:** Datos geográficos (Latitud / Longitud).
* **Jerarquía (Evaluar):** Nivel relacional dentro de la organización.

### Parámetros
* **Monedas:** Divisas permitidas operacionalmente.
* **Límites de sub entidades:** Cantidad máxima de elementos hijo permitidos.
* **Horarios:** Ventanas de tiempo para operación (Apertura / Cierre).
* **Estado Operativo:** Estado lógico de disponibilidad de la agencia.
* **Configuración de Uso:** Etiquetas globales de la agencia (ej: "Sucursal Premium", "Centro de Distribución Local").

---

## 2. Sub Entidades
* **Definición:** Unidad secundaria operativa. Las sub-entidades definen la "Operación". Puede tener inventario temporal o activo. Puede contener Depósitos.

### Propiedades
* **UID:** Identificador único de la sub-entidad.
* **Nombre:** Texto descriptivo (ej: Nombre de la caja o ATM).
* **Código:** Código identificador de la unidad.
* **Tipo de Dispositivo:** Define la **Naturaleza operativa** mediante selectores (ej: ATM, Reciclador, Terminal Punto de Venta, Caja Registradora).
* **Modelo/Fabricante:** Selector de marca/hardware (ej: NCR, Diebold, Epson).
* **Modo de Instalación:** Clasificación física (ej: Empotrado, Stand-alone, Móvil).
* **Identificador de Red:** Dirección IP o ID de red para la comunicación directa con el servidor.

### Parámetros
* **Límites por Transacción:**
  * Monto mínimo/máximo por operación.
  * Cantidad máxima de ítems.
* **Perfil de Operación:** Define qué transacciones están permitidas (ej: Solo Retiros, Solo Depósitos, Mixto).
* **Monedas/Denominaciones:** Configuración del cono monetario aceptado o dispensado.
* **Gestión de Capacidad:**
  * Umbral de Alerta (Max).
  * Capacidad Nominal.
  * Umbral de Reabastecimiento (Min).
  * *Nota de UI:* Todos estos campos se calculan y validan en base a la **unidad de medida base**.
* **Estado Operativo:** Disponibilidad actual de la terminal.
* **Parámetros de Seguridad:** Claves, temporizadores o restricciones de acceso técnico.
* **Asignación de Responsable:** Campo dinámico condicionado por el Tipo de Dispositivo:
  * Si es **Cajas/Taquillas:** Solicita el ID del cajero humano asignado.
  * Si es **ATMs:** Solicita el ID del proveedor de servicios de custodia.

---

## 3. Depósitos
* **Definición:** Unidad de almacenamiento. Relacionada directamente con el Almacenamiento. Puede almacenar Mercancía y unidades de transporte o comercio (Vehículos, Mercancía).

### Propiedades
* **UID:** Identificador del depósito.
* **Nombre:** Nombre descriptivo de la unidad de resguardo.
* **Código:** Código de inventario.
* **Tipo:** Define la **Naturaleza física** del almacén (ej: Caja Fuerte, Cuarto Frío, Rack, Silo, Contenedor, Cajón).
* **Material de Construcción (Opcional):** Detalles de la infraestructura.
* **Dimensiones Físicas:** Volumen o medidas del espacio.

### Parámetros
* **Tipo de Contenido:** Filtro de categorías permitidas (ej: Remesas, Alimentos, Comodities).
* **Unidad de Medida Base:** Unidad estándar de conteo (ej: Fajos, Kg, etc.).
* **Gestión de Capacidad:**
  * Umbral de Alerta (Max).
  * Capacidad Nominal.
  * Umbral de Reabastecimiento (Min).
  * *Nota de UI:* Campos ligados estrictamente a la **unidad de medida base** seleccionada.
* **Estado Operativo:** Estado del punto de depósito.
* **Condiciones Ambientales (Opcional):** Bloque condicional definido por el tipo de propiedad:
  * Rango de Temperatura.
  * Nivel de Humedad.
* **Reglas de Seguridad/Acceso:** Atributos de resguardo como el Nivel de Blindaje o roles.

---

## 4. Contenedores
* **Definición:** Unidad de empaquetado, envasado o agrupación de productos. Su fin es la agrupación de Mercancía.

### Propiedades
* **UID:** Identificador único del contenedor.
* **Peso Vacío (Tara):** Peso neto sin carga.
* **Tipo:** Clasificación del contenedor (ej: Container, Envases, Bultos, Bolsas, Empaques, Paletas).
* **Código:** Código identificador o serial.
* **Material:** Composición física del empaque.
* **Sistema de Cierre/Seguridad:** Mechanism de bloqueo o sellado.
* **Jerarquía:** Define los **Niveles Logísticos de Contenidos**.
  * *Flujo jerárquico:* Container > Paleta > Bulto / Caja > Envase / Empaque > Producto.
  * *Reglas de negocio para UI:* 1. Si el producto es más grande que la caja, no aplica caja como contenedor.
    2. Si el producto pesa más que la carga que puede soportar la paleta, paleta no aplica.

### Parámetros
* **Capacidad:**
  * Volumen.
  * Peso Máximo.
  * Cantidad de Unidades.
* **Estado de Sello:** Integridad del contenedor.
* **Certificaciones:**
  * Uso alimentario (Sí/No).
  * Grado de blindaje.
  * Fecha de caducidad del contenedor.
* **Ubicación Actual:** Campo de referencia al **Depósito** o **Vehículo** donde se encuentra "incrustado" el contenedor actualmente.
* **Propiedad Especial (Tracking):** Número de Precinto físico.

---

## 5. Vehículos / Depósitos Móviles Temporales
* **Definición:** Unidad operativa de transporte. Configura tamaño, capacidades, clasificación y tipo de carga o mercancía (Agrupa Mercancía).

### Propiedades
* **UID:** Identificador único del activo de transporte.
* **Propiedad (Ownership):** Campo tipo "Enum" para marcar si el vehículo es **Propio** o de **Proveedor**.
* **Tipo:** Categoría del transporte (ej: Camiones, Carros, Barcos, Aviones, Trenes).
* **ID de Vehículo / Placa:** Patente o matrícula legal.
* **Modelo y Marca:** Detalles del fabricante.
* **Identificador de Proveedor:** Campo condicional vinculado si en *Propiedad* se seleccionó "Proveedor".

### Parámetros
* **Capacidad de Carga:**
  * Peso Máximo Soportado.
  * Volumen Máximo.
  * Capacidad en Contenedores.
* **Estado de Disponibilidad:** Estatus logístico en tiempo real.
* **Geolocalización (Tracking):** Seguimiento del vector móvil.
* **Nivel de Seguridad:** Grado de protección o blindaje del transporte.
* **Consumo y Odómetro:** Bloque condicional activo **Solo para Flota Propia**, utilizado para registrar el kilometraje y rendimiento de combustible para mantenimiento preventivo.

---

## 6. Mercancía
* **Definición:** Material de comercio. Unidad comercializable.

### Propiedades
* **Unidad de Medida:** Magnitud base de conteo.
* **Descripción:** Detalle del producto.
* **SKU / Código de Producto:** Identificador comercial único de stock.
* **Categoría:** Clasificación del producto (ej: Commodities, Valores, Alimentos, Productos, Remesas).
* **Atributos Físicos:** Peso unitario, dimensions y requerimientos de almacenamiento (ej: "Requiere refrigeración").
* **Reglas de Agrupación:** Define si la mercancía se puede mezclar en un mismo contenedor.
  * *Regla explícita:* "No mezclar Mercancía tipo 'Alimentos' con 'Químicos' en el mismo Contenedor/Vehículo".

### Parámetros
* **Propiedad de Origen:** Procedencia del lote.
* **Valor Unitario:** Costo o valor nominal por unidad individual.
* **Lote / Serie:** Trazabilidad de producción.
* **Fecha de Vencimiento:** Caducidad del lote de mercancía.
* **Estado de la Mercancía:** Condición física o lógica actual del producto.

---

## 7. Proveedor
* **Definición:** Entidad externa de negocio que surte inventario.

### Propiedades
* **UID:** Identificador del proveedor.
* **Razón Social:** Nombre legal de la empresa.
* **Identificador Legal:** ID tributario o fiscal.
* **Categoría:** Sector del proveedor.
* **Domicilio Fiscal:** Dirección legal de contacto.
* **Tipo de Proveedor:** Selector para definir si provee **Servicios o Consumibles**. *Este campo despliega la estructura interna dependiente.*

### Parámetros
* **Status de Auditoría:** Estado de revisión interna del proveedor.
* **Nivel de Riesgo:** Calificación de riesgo operativo/legal.
* **Capacidad Operativa:** Parámetros de suficiencia de respuesta.
* **Documentación Legal:** Estado de carga de credenciales obligatorias.

#### Estructura Secundaria: Servicio / Consumible (Dependiente de Proveedor)
* **Definición:** Atributos específicos del catálogo provisto cuando se desglosa el tipo de insumo del Proveedor.

##### Propiedades
* **Unidad de Cobro:** Esquema de tarifas (por hora, por evento, por volumen).
* **SKU de Servicio:** Identificador interno del servicio.
* **Tipo de Insumo:** Clasificación técnica del recurso.

##### Parámetros
* **Plazo de Entrega:** Tiempos de respuesta o SLA establecidos.
* **Costo Base:** Tarifa plana o inicial del servicio.
* **Tiempo de Vida Útil:** Durabilidad o expiración del entregable.
* **Tarifas:**
  * Vigencia.
  * Negociación (Condiciones particulares).

---

## 8. Cliente
* **Definición:** Entidad externa consumidora. Entidad que consume inventario.

### Propiedades
* **UID:** Identificador único del cliente.
* **Giro de Negocio:** Selector de clasificación económica (ej: Sector Bancario, Retail, Farmacia...).
* **Tipo de Persona:** Clasificación legal (ej: Natural / Jurídico).
* **ID de Cliente:** Código interno o número identificador comercial.
* **Razón Social / Nombre Completo:** Nombre de registro de la persona o corporación.

### Parámetros
* **Estatus de Cumplimiento:** Estado de validaciones regulatorias.
* **Límite de Crédito Global:**
  * *Nota crítica para Banca:* Parámetro crítico que indica si el cliente pasó las pruebas de origen de fondos.
* **Nivel de Fidelidad/Segmento:** Clasificación operativa de atención (ej: Cliente Oro, VIP, Estándar).

#### Estructura Vinculada: Acuerdo Comercial
* **Definición:** Parámetros contractuales y de logística acordados para la entrega o consumo de mercancía.

##### Parámetros
* **Plazo de Pago:** Ventana de tiempo permitida para liquidar saldos o facturas.
* **Lista de Precios Aplicada:** Catálogo de tarifas asignado al cliente.
* **Puntos de Entrega Autorizados:** Destinos o direcciones geográficas validadas en el contrato.
* **Ventanas de Recepción:** Bloques horarios permitidos para realizar las entregas operativas.

---

## 9. Moneda / Divisa
* **Definición:** Unidad de valor utilizada para calcular el precio, costo de compra y venta del negocio.

### Propiedades
* **Tipo de Moneda:** Clasificación de la unidad de valor (ej: Divisa, Moneda, Oro, Stable Coin).
* **Abreviatura / Código ISO:** Código internacional estandarizado (ej: USD, EUR, MXN).
* **Nombre de la Divisa:** Denominación completa de la moneda.
* **Símbolo:** Carácter gráfico representativo (ej: $, €, ¥).
* **País / Región de Origen:** Territorio legal de emisión de la divisa.

### Parámetros
* **Tabla de Denominaciones:** Configuración detallada de los valores faciales físicos existentes (billetes y monedas).
* **Clasificación por Estado Físico:** Criterios para catalogar el desgaste físico o aptitud operativa (ej: Apto para ATM, Deteriorado, Falso).
* **Tasa de Cambio:** Factor numérico de conversión respecto a la moneda base del sistema.
* **Factor de Redondeo:** Regla matemática aplicada a los decimales en los cálculos transaccionales.

---

## 10. Grupos Geográficos / Grupos
* **Definición:** Agrupador logístico de unidades organizacionales.
* *Regla de asignación:* El "Grupo" aplica y despliega reglas operativas directamente sobre **Oficinas, Vehículos y Clientes**.

### Propiedades
* **Tipo:** Naturaleza funcional del agrupador mediante selectores:
  * **Logístico**
  * **Geográfico** (ej: Zonas, Ciudades, Estados, Municipios, Continentes, Países, Flotas).
  * **Funcional**
* **Nombre:** Texto identificador del grupo.
* **Jerarquía:** Define la estructura escalada relacional de dependencia (Estructura Escalada Padre / Hijo).

### Parámetros
* **Restricciones de Movimiento:** Reglas de tránsito, bloqueos logísticos o delimitaciones de fronteras operativas permitidas.
* **Reglas de Impuestos/Fiscalidad:** Parámetros impositivos que se heredan automáticamente según la localización geográfica o jurisdicción.
* **Moneda Operativa Predeterminada:** Unidad monetaria asignada por defecto para transaccionar en esa región o grupo.
* **Configuración de SLA Regional:** Tiempos de servicio y acuerdos de respuesta condicionados por la ubicación o naturaleza del grupo.
