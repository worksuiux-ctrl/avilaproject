export type FieldType = "text" | "number" | "select" | "multiSelect" | "geolocation" | "time" | "switch" | "textarea";

export interface SchemaField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  section: "propiedades" | "parametros";
  dependsOn?: { field: string; value: string };
}

export interface EntitySchema {
  nivel: string;
  fields: SchemaField[];
}

const GIROS_NEGOCIO = [
  "Banco", "Farmacia", "Restaurante", "Supermercado", "Tienda",
  "Transporte", "Logística", "Seguros", "Telecomunicaciones", "Otro",
];

const MODELOS_ATM = ["NCR", "Diebold", "Wincor", "Hyosung", "Genmega", "Otro"];
const MODELOS_POS = ["Ingenico", "Verifone", "PAX", "BBPOS", "Otro"];
const MATERIALES_CONTENEDOR = ["Plástico", "Cartón", "Metal", "Madera", "Vidrio", "Mixto"];
const PERFILES_OPERACION = ["Solo Retiros", "Solo Depósitos", "Mixto", "Solo Consulta"];
const TIPOS_CIERRE = ["Sello", "Ziplock", "Termosellado", "Bisagra", "Broche"];
const CATEGORIAS_CONTENIDO = ["Efectivo", "Valores", "Alimentos", "Commodities", "Documentos", "Mixto"];
const UMBRALES_CAPACIDAD = ["Unidades", "Kg", "Litros", "Fajos", "Cajas"];

export const ENTITY_SCHEMAS: EntitySchema[] = [
  /* ───────── Grupos Geográficos ───────── */
  {
    nivel: "Grupos",
    fields: [
      { key: "tipoGrupo", label: "Tipo de Grupo", type: "select", options: ["Logístico", "Geográfico", "Funcional"], section: "propiedades", required: true },
      { key: "restriccionesMovimiento", label: "Restricciones de Movimiento", type: "textarea", section: "parametros" },
      { key: "reglasFiscales", label: "Reglas de Impuestos/Fiscalidad", type: "textarea", section: "parametros" },
      { key: "monedaOperativa", label: "Moneda Operativa Predeterminada", type: "select", options: ["USD", "EUR", "VES", "COP", "MXN", "Otro"], section: "parametros" },
      { key: "configSLA", label: "Configuración SLA Regional", type: "text", placeholder: "Tiempos de servicio", section: "parametros" },
    ],
  },

  /* ───────── Central Administrativa ───────── */
  {
    nivel: "Central Administrativa",
    fields: [
      { key: "codigoCentral", label: "Código de Central", type: "text", section: "propiedades", required: true },
      { key: "region", label: "Región / Zona de Influencia", type: "text", section: "propiedades" },
      { key: "direccionCentral", label: "Dirección", type: "text", section: "propiedades" },
      { key: "monedaBase", label: "Moneda Base", type: "select", options: ["USD", "EUR", "VES", "COP", "MXN", "Otro"], section: "parametros" },
      { key: "estadoCentral", label: "Estado Operativo", type: "select", options: ["Activo", "Inactivo"], section: "parametros" },
    ],
  },

  /* ───────── Oficinas / Entidad Principal ───────── */
  {
    nivel: "Oficinas",
    fields: [
      { key: "giroNegocio", label: "Giro de Negocio", type: "select", options: GIROS_NEGOCIO, section: "propiedades", required: true },
      { key: "jerarquia", label: "Jerarquía (Nivel relacional)", type: "select", options: ["Casa Matriz", "Regional", "Sucursal", "Agencia Local", "Punto de Servicio"], section: "propiedades" },
      { key: "direccion", label: "Dirección", type: "text", section: "propiedades", required: true },
      { key: "coordenadas", label: "Geolocalización", type: "geolocation", section: "propiedades" },
      { key: "monedas", label: "Monedas Permitidas", type: "multiSelect", options: ["USD", "EUR", "VES", "COP", "MXN", "GBP", "CHF"], section: "parametros" },
      { key: "limiteHijos", label: "Límite de Sub Entidades", type: "number", placeholder: "Máximo de hijos", section: "parametros" },
      { key: "horarioApertura", label: "Horario Apertura", type: "time", section: "parametros" },
      { key: "horarioCierre", label: "Horario Cierre", type: "time", section: "parametros" },
      { key: "estadoOperativo", label: "Estado Operativo", type: "select", options: ["Activo", "Inactivo", "Mantenimiento"], section: "parametros" },
      { key: "etiquetaGlobal", label: "Configuración de Uso", type: "text", placeholder: "Ej: Sucursal Premium", section: "parametros" },
    ],
  },

  /* ───────── Dispositivos ───────── */
  {
    nivel: "Dispositivos",
    fields: [
      { key: "modeloFabricante", label: "Modelo/Fabricante", type: "select", options: [...MODELOS_ATM, ...MODELOS_POS], section: "propiedades" },
      { key: "modoInstalacion", label: "Modo de Instalación", type: "select", options: ["Empotrado", "Stand-alone", "Móvil"], section: "propiedades" },
      { key: "identificadorRed", label: "Identificador de Red", type: "text", placeholder: "IP o ID de red", section: "propiedades" },
      { key: "monedaMin", label: "Monto Mínimo por Operación", type: "number", section: "parametros" },
      { key: "monedaMax", label: "Monto Máximo por Operación", type: "number", section: "parametros" },
      { key: "maxItems", label: "Cantidad Máxima de Ítems", type: "number", section: "parametros" },
      { key: "perfilOperacion", label: "Perfil de Operación", type: "select", options: PERFILES_OPERACION, section: "parametros" },
      { key: "monedasAceptadas", label: "Monedas/Denominaciones", type: "multiSelect", options: ["USD", "EUR", "VES", "COP", "MXN"], section: "parametros" },
      { key: "umbralAlerta", label: "Umbral de Alerta (Max)", type: "number", section: "parametros" },
      { key: "capacidadNominal", label: "Capacidad Nominal", type: "number", section: "parametros" },
      { key: "umbralMinimo", label: "Umbral de Reabastecimiento (Min)", type: "number", section: "parametros" },
      { key: "estadoSub", label: "Estado Operativo", type: "select", options: ["Operativo", "Fuera de Servicio", "Mantenimiento"], section: "parametros" },
      { key: "responsableAsignado", label: "Responsable Asignado", type: "text", placeholder: "ID del cajero o proveedor de custodia", section: "parametros" },
      { key: "parametrosSeguridad", label: "Parámetros de Seguridad", type: "textarea", placeholder: "Claves, temporizadores, restricciones de acceso", section: "parametros" },
    ],
  },

  /* ───────── Depósitos ───────── */
  {
    nivel: "Depósitos",
    fields: [
      { key: "materialConstruccion", label: "Material de Construcción", type: "text", placeholder: "Ej: Acero, Concreto", section: "propiedades" },
      { key: "dimensiones", label: "Dimensiones Físicas", type: "text", placeholder: "Ej: 2m x 3m x 2.5m", section: "propiedades" },
      { key: "tipoContenido", label: "Tipo de Contenido", type: "select", options: CATEGORIAS_CONTENIDO, section: "parametros" },
      { key: "unidadMedida", label: "Unidad de Medida Base", type: "select", options: UMBRALES_CAPACIDAD, section: "parametros" },
      { key: "umbralAlertaDep", label: "Umbral de Alerta (Max)", type: "number", section: "parametros" },
      { key: "capacidadNominalDep", label: "Capacidad Nominal", type: "number", section: "parametros" },
      { key: "umbralMinimoDep", label: "Umbral de Reabastecimiento (Min)", type: "number", section: "parametros" },
      { key: "estadoDep", label: "Estado Operativo", type: "select", options: ["Disponible", "Ocupado", "Mantenimiento", "Clausurado"], section: "parametros" },
      { key: "tempMin", label: "Rango Temperatura Mín", type: "number", section: "parametros", dependsOn: { field: "subtipo", value: "Cuarto Frío" } },
      { key: "tempMax", label: "Rango Temperatura Máx", type: "number", section: "parametros", dependsOn: { field: "subtipo", value: "Cuarto Frío" } },
      { key: "humedad", label: "Nivel de Humedad", type: "number", placeholder: "%", section: "parametros", dependsOn: { field: "subtipo", value: "Cuarto Frío" } },
      { key: "nivelBlindaje", label: "Nivel de Blindaje", type: "select", options: ["Bajo", "Medio", "Alto", "Máximo"], section: "parametros" },
    ],
  },

  /* ───────── Contenedores ───────── */
  {
    nivel: "Contenedores",
    fields: [
      { key: "tara", label: "Peso Vacío (Tara)", type: "number", placeholder: "Kg", section: "propiedades" },
      { key: "material", label: "Material", type: "select", options: MATERIALES_CONTENEDOR, section: "propiedades" },
      { key: "sistemaCierre", label: "Sistema de Cierre/Seguridad", type: "select", options: TIPOS_CIERRE, section: "propiedades" },
      { key: "volumen", label: "Capacidad - Volumen", type: "number", placeholder: "m³", section: "parametros" },
      { key: "pesoMaximo", label: "Capacidad - Peso Máximo", type: "number", placeholder: "Kg", section: "parametros" },
      { key: "cantidadUnidades", label: "Capacidad - Cantidad de Unidades", type: "number", section: "parametros" },
      { key: "estadoSello", label: "Estado de Sello", type: "select", options: ["Intacto", "Violado", "Sin Sello"], section: "parametros" },
      { key: "usoAlimentario", label: "Uso Alimentario", type: "switch", section: "parametros" },
      { key: "gradoBlindaje", label: "Grado de Blindaje", type: "select", options: ["Ninguno", "Bajo", "Medio", "Alto"], section: "parametros" },
      { key: "fechaCaducidad", label: "Fecha de Caducidad", type: "text", placeholder: "AAAA-MM-DD", section: "parametros" },
      { key: "precinto", label: "Número de Precinto (Tracking)", type: "text", section: "parametros" },
    ],
  },

  /* ───────── Vehículos ───────── */
  {
    nivel: "Vehículos",
    fields: [
      { key: "propiedad", label: "Propiedad", type: "select", options: ["Propio", "Proveedor"], section: "propiedades", required: true },
      { key: "placa", label: "ID de Vehículo / Placa", type: "text", section: "propiedades", required: true },
      { key: "marcaModelo", label: "Modelo y Marca", type: "text", placeholder: "Ej: Ford F-350 2024", section: "propiedades" },
      {
        key: "idProveedor", label: "Identificador de Proveedor", type: "text",
        placeholder: "ID del proveedor de transporte",
        section: "propiedades",
        dependsOn: { field: "propiedad", value: "Proveedor" },
      },
      { key: "pesoMaxCarga", label: "Capacidad - Peso Máximo", type: "number", placeholder: "Kg", section: "parametros" },
      { key: "volumenMax", label: "Capacidad - Volumen Máximo", type: "number", placeholder: "m³", section: "parametros" },
      { key: "capacidadContenedores", label: "Capacidad en Contenedores", type: "number", section: "parametros" },
      { key: "disponibilidad", label: "Estado de Disponibilidad", type: "select", options: ["Disponible", "En Ruta", "Mantenimiento", "Fuera de Servicio"], section: "parametros" },
      { key: "nivelSeguridad", label: "Nivel de Seguridad", type: "select", options: ["Estándar", "Blindado", "Máxima Seguridad"], section: "parametros" },
      { key: "geolocalizacion", label: "Geolocalización (Tracking)", type: "geolocation", section: "parametros" },
      { key: "odometro", label: "Consumo y Odómetro", type: "text", placeholder: "Km actuales", section: "parametros", dependsOn: { field: "propiedad", value: "Propio" } },
    ],
  },

  /* ───────── Mercancía ───────── */
  {
    nivel: "Mercancía",
    fields: [
      { key: "unidadMedidaMerc", label: "Unidad de Medida", type: "select", options: ["Unidad", "Kg", "Litros", "Fajos", "Cajas", "Paletas"], section: "propiedades", required: true },
      { key: "descripcion", label: "Descripción", type: "textarea", section: "propiedades" },
      { key: "sku", label: "SKU / Código de Producto", type: "text", section: "propiedades" },
      { key: "categoriaMerc", label: "Categoría", type: "select", options: ["Commodity", "Valor", "Alimento", "Producto", "Remesa"], section: "propiedades" },
      { key: "pesoUnitario", label: "Peso Unitario", type: "number", placeholder: "Kg", section: "propiedades" },
      { key: "requiereRefrigeracion", label: "Requiere Refrigeración", type: "switch", section: "propiedades" },
      { key: "reglasAgrupacion", label: "Reglas de Agrupación", type: "textarea", placeholder: "Ej: No mezclar con químicos", section: "propiedades" },
      { key: "origen", label: "Propiedad de Origen", type: "text", section: "parametros" },
      { key: "valorUnitario", label: "Valor Unitario", type: "number", section: "parametros" },
      { key: "lote", label: "Lote / Serie", type: "text", section: "parametros" },
      { key: "fechaVencimiento", label: "Fecha de Vencimiento", type: "text", placeholder: "AAAA-MM-DD", section: "parametros" },
      { key: "estadoMerc", label: "Estado de la Mercancía", type: "select", options: ["Disponible", "Reservado", "Dañado", "Vencido", "En Tránsito"], section: "parametros" },
    ],
  },

  /* ───────── Proveedores ───────── */
  {
    nivel: "Proveedores",
    fields: [
      { key: "razonSocial", label: "Razón Social", type: "text", section: "propiedades", required: true },
      { key: "idLegal", label: "Identificador Legal", type: "text", placeholder: "RIF / NIT", section: "propiedades" },
      { key: "categoriaProv", label: "Categoría", type: "text", section: "propiedades" },
      { key: "domicilioFiscal", label: "Domicilio Fiscal", type: "text", section: "propiedades" },
      { key: "tipoProveedor", label: "Tipo de Proveedor", type: "select", options: ["Servicios", "Consumibles"], section: "propiedades", required: true },
      { key: "statusAuditoria", label: "Status de Auditoría", type: "select", options: ["Pendiente", "Aprobado", "Rechazado", "En Revisión"], section: "parametros" },
      { key: "nivelRiesgo", label: "Nivel de Riesgo", type: "select", options: ["Bajo", "Medio", "Alto", "Crítico"], section: "parametros" },
      { key: "capacidadOperativa", label: "Capacidad Operativa", type: "text", placeholder: "Volumen de respuesta", section: "parametros" },
      { key: "documentacionLegal", label: "Documentación Legal", type: "select", options: ["Completa", "Incompleta", "Vencida", "No Aplica"], section: "parametros" },
      // Sub-estructura Servicio/Consumible
      { key: "unidadCobro", label: "Unidad de Cobro", type: "select", options: ["Por hora", "Por evento", "Por volumen", "Por unidad"], section: "parametros" },
      { key: "skuServicio", label: "SKU de Servicio", type: "text", section: "parametros" },
      { key: "tipoInsumo", label: "Tipo de Insumo", type: "text", section: "parametros" },
      { key: "plazoEntrega", label: "Plazo de Entrega", type: "text", placeholder: "Ej: 24-48 hrs", section: "parametros" },
      { key: "costoBase", label: "Costo Base", type: "number", section: "parametros" },
      { key: "tiempoVidaUtil", label: "Tiempo de Vida Útil", type: "text", placeholder: "Ej: 6 meses", section: "parametros" },
    ],
  },

  /* ───────── Clientes ───────── */
  {
    nivel: "Clientes",
    fields: [
      { key: "giroCliente", label: "Giro de Negocio", type: "select", options: GIROS_NEGOCIO, section: "propiedades", required: true },
      { key: "tipoPersona", label: "Tipo de Persona", type: "select", options: ["Natural", "Jurídico"], section: "propiedades", required: true },
      { key: "idCliente", label: "ID de Cliente", type: "text", section: "propiedades" },
      { key: "razonSocialCliente", label: "Razón Social / Nombre Completo", type: "text", section: "propiedades", required: true },
      { key: "statusCumplimiento", label: "Estatus de Cumplimiento", type: "select", options: ["Validado", "Pendiente", "Rechazado", "En Revisión"], section: "parametros" },
      { key: "limiteCredito", label: "Límite de Crédito Global", type: "number", section: "parametros" },
      { key: "segmento", label: "Nivel de Fidelidad/Segmento", type: "select", options: ["Estándar", "Oro", "VIP", "Corporativo"], section: "parametros" },
      // Acuerdo Comercial
      { key: "plazoPago", label: "Plazo de Pago", type: "text", placeholder: "Ej: 30 días", section: "parametros" },
      { key: "listaPrecios", label: "Lista de Precios Aplicada", type: "text", section: "parametros" },
      { key: "puntosEntrega", label: "Puntos de Entrega Autorizados", type: "textarea", section: "parametros" },
      { key: "ventanasRecepcion", label: "Ventanas de Recepción", type: "text", placeholder: "Ej: Lun-Vie 8:00-17:00", section: "parametros" },
    ],
  },

  /* ───────── Monedas ───────── */
  {
    nivel: "Monedas",
    fields: [
      { key: "tipoMoneda", label: "Tipo de Moneda", type: "select", options: ["Divisa", "Moneda", "Oro", "Stable Coin"], section: "propiedades", required: true },
      { key: "codigoISO", label: "Abreviatura / Código ISO", type: "text", placeholder: "Ej: USD, EUR", section: "propiedades", required: true },
      { key: "nombreDivisa", label: "Nombre de la Divisa", type: "text", placeholder: "Ej: Dólar Americano", section: "propiedades" },
      { key: "simbolo", label: "Símbolo", type: "text", placeholder: "Ej: $, €", section: "propiedades" },
      { key: "paisOrigen", label: "País / Región de Origen", type: "text", section: "propiedades" },
      { key: "denominaciones", label: "Tabla de Denominaciones", type: "textarea", placeholder: "Ej: 100, 50, 20, 10, 5, 2, 1", section: "parametros" },
      { key: "clasificacionFisico", label: "Clasificación por Estado Físico", type: "multiSelect", options: ["Apto para ATM", "Deteriorado", "Falso", "Mutilado"], section: "parametros" },
      { key: "tasaCambio", label: "Tasa de Cambio", type: "number", placeholder: "Frente a moneda base", section: "parametros" },
      { key: "factorRedondeo", label: "Factor de Redondeo", type: "number", placeholder: "Ej: 0.01", section: "parametros" },
    ],
  },
];

export function getEntitySchema(nivel: string): EntitySchema | undefined {
  return ENTITY_SCHEMAS.find((s) => s.nivel === nivel);
}
