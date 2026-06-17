import { create } from "zustand";

/* ──────────────── Interfaces Base ──────────────── */

export interface Proveedor {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VariableTarifaria {
  id: string;
  servicioId: string;
  nombre: string;
  etiqueta: string;
  tipo: "numero" | "select";
  opciones?: string[];
  requerida: boolean;
  valorDefecto: number | string;
  factorCalculo: number;
}

export interface Servicio {
  id: string;
  codigo: string;
  proveedorId: string;
  categoria: string;
  nombre: string;
  descripcion: string;
  precio: number;
  variables: VariableTarifaria[];
  formula?: string;
  activo: boolean;
  fechaInicio: string;
  fechaVencimiento: string;
  accionVencimiento: "Renovar" | "Cancelar";
  diasPreaviso: number;
  ultimaRenovacion: string;
  estadosAplicables: string[];
  rutas: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UnidadTransporte {
  id: string;
  proveedorId: string;
  placa: string;
  marcaModelo: string;
  capacidadKg: number;
  nivelSeguridad: string;
  activo: boolean;
  latitud: number;
  longitud: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServicioUnidad {
  id: string;
  servicioId: string;
  unidadId: string;
  rol: "Principal" | "Secundario" | "Backup";
  fechaAsignacion: string;
}

export interface SucursalProveedor {
  id: string;
  proveedorId: string;
  codigo: string;
  nombre: string;
  direccion: string;
  contacto: string;
  telefono: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepositoProveedor {
  id: string;
  proveedorId: string;
  codigo: string;
  nombre: string;
  tipo: string;
  direccion: string;
  capacidad: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CentroAcopio {
  id: string;
  proveedorId: string;
  codigo: string;
  nombre: string;
  tipo: string;
  direccion: string;
  latitud: number;
  longitud: number;
  capacidad: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalTransportista {
  id: string;
  proveedorId: string;
  codigo: string;
  nombre: string;
  cedula: string;
  telefono: string;
  cargo: string;
  foto: string;
  carnet: string;
  codigoValidacion: string;
  licencia: string;
  tipoLicencia: string;
  fechaVencimientoLicencia: string;
  fechaIngreso: string;
  validadoBanco: boolean;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrdenCompra {
  id: string;
  proveedorId: string;
  numero: string;
  fecha: string;
  estado: "Borrador" | "Emitida" | "Aprobada" | "Recibida" | "Cancelada";
  total: number;
  notas: string;
  createdAt: string;
  updatedAt: string;
}

/* ──────────────── Catálogos ──────────────── */

export const CATEGORIAS_POR_TIPO_PROVEEDOR: Record<string, string[]> = {
  "Transportista de Valores": ["Traslado", "Custodia", "Conteo", "Manipulación", "Consumible"],
  "Seguridad": ["Monitoreo", "Vigilancia Electrónica", "Respuesta a Emergencias", "Consumible"],
  "Insumos": ["Consumible"],
  "Tecnología": ["Soporte Técnico", "Instalación", "Mantenimiento", "Consumible"],
  "Mantenimiento": ["Mantenimiento Preventivo", "Mantenimiento Correctivo"],
  "Servicios": ["Servicio General"],
};

export const VARIABLES_POR_CATEGORIA: Record<string, Omit<VariableTarifaria, "id" | "servicioId">[]> = {
  Traslado: [
    { nombre: "distancia", etiqueta: "Distancia (km)", tipo: "numero", requerida: true, valorDefecto: 0, factorCalculo: 0.5 },
    { nombre: "peso", etiqueta: "Peso (kg)", tipo: "numero", requerida: false, valorDefecto: 0, factorCalculo: 0.05 },
    { nombre: "valorRemesa", etiqueta: "Valor de la Remesa ($)", tipo: "numero", requerida: true, valorDefecto: 0, factorCalculo: 0.001 },
    { nombre: "gasolina", etiqueta: "Gasolina (litros)", tipo: "numero", requerida: false, valorDefecto: 0, factorCalculo: 1.2 },
    { nombre: "peajes", etiqueta: "Peajes ($)", tipo: "numero", requerida: false, valorDefecto: 0, factorCalculo: 1 },
    { nombre: "tiempoEstimado", etiqueta: "Tiempo Estimado (hrs)", tipo: "numero", requerida: false, valorDefecto: 0, factorCalculo: 15 },
  ],
  Custodia: [
    { nombre: "tiempo", etiqueta: "Tiempo (hrs)", tipo: "numero", requerida: true, valorDefecto: 0, factorCalculo: 10 },
    { nombre: "valorAsegurado", etiqueta: "Valor Asegurado ($)", tipo: "numero", requerida: true, valorDefecto: 0, factorCalculo: 0.0005 },
    { nombre: "nivelRiesgo", etiqueta: "Nivel de Riesgo", tipo: "select", opciones: ["Bajo", "Medio", "Alto", "Crítico"], requerida: true, valorDefecto: "Medio", factorCalculo: 1 },
  ],
  Conteo: [
    { nombre: "volumenUnidades", etiqueta: "Volumen (unidades)", tipo: "numero", requerida: true, valorDefecto: 0, factorCalculo: 0.1 },
    { nombre: "tiempoEstimado", etiqueta: "Tiempo Estimado (hrs)", tipo: "numero", requerida: false, valorDefecto: 0, factorCalculo: 20 },
    { nombre: "tipoBillete", etiqueta: "Tipo de Billete", tipo: "select", opciones: ["Mixto", "Solo Efectivo", "Solo Moneda", "Valores"], requerida: true, valorDefecto: "Mixto", factorCalculo: 1 },
  ],
  Manipulación: [
    { nombre: "peso", etiqueta: "Peso (kg)", tipo: "numero", requerida: true, valorDefecto: 0, factorCalculo: 0.08 },
    { nombre: "volumen", etiqueta: "Volumen (m³)", tipo: "numero", requerida: false, valorDefecto: 0, factorCalculo: 2 },
    { nombre: "tipoOperacion", etiqueta: "Tipo de Operación", tipo: "select", opciones: ["Recepción", "Clasificación", "Empaque", "Despacho"], requerida: true, valorDefecto: "Recepción", factorCalculo: 1 },
  ],
  Consumible: [
    { nombre: "cantidad", etiqueta: "Cantidad (unidades)", tipo: "numero", requerida: true, valorDefecto: 1, factorCalculo: 1 },
    { nombre: "precioUnitario", etiqueta: "Precio Unitario ($)", tipo: "numero", requerida: true, valorDefecto: 0, factorCalculo: 1 },
  ],
  Monitoreo: [
    { nombre: "tiempo", etiqueta: "Tiempo (días)", tipo: "numero", requerida: true, valorDefecto: 30, factorCalculo: 50 },
    { nombre: "cantidadDispositivos", etiqueta: "Dispositivos", tipo: "numero", requerida: true, valorDefecto: 1, factorCalculo: 10 },
    { nombre: "nivelCobertura", etiqueta: "Nivel de Cobertura", tipo: "select", opciones: ["Básico", "Estándar", "Premium", "24/7"], requerida: true, valorDefecto: "Estándar", factorCalculo: 1 },
  ],
  "Vigilancia Electrónica": [
    { nombre: "tiempo", etiqueta: "Tiempo (días)", tipo: "numero", requerida: true, valorDefecto: 30, factorCalculo: 80 },
    { nombre: "cantidadDispositivos", etiqueta: "Cámaras/Sensores", tipo: "numero", requerida: true, valorDefecto: 4, factorCalculo: 25 },
    { nombre: "almacenamiento", etiqueta: "Almacenamiento (GB)", tipo: "numero", requerida: false, valorDefecto: 0, factorCalculo: 0.5 },
  ],
  "Respuesta a Emergencias": [
    { nombre: "tiempoRespuesta", etiqueta: "Tiempo de Respuesta (min)", tipo: "numero", requerida: true, valorDefecto: 15, factorCalculo: 5 },
    { nombre: "tipoEmergencia", etiqueta: "Tipo de Emergencia", tipo: "select", opciones: ["Alarma", "Intrusión", "Incendio", "Otro"], requerida: true, valorDefecto: "Alarma", factorCalculo: 1 },
    { nombre: "cantidadUnidades", etiqueta: "Unidades de Respuesta", tipo: "numero", requerida: false, valorDefecto: 1, factorCalculo: 100 },
  ],
  "Soporte Técnico": [
    { nombre: "tiempo", etiqueta: "Horas", tipo: "numero", requerida: true, valorDefecto: 1, factorCalculo: 45 },
    { nombre: "nivelUrgencia", etiqueta: "Nivel de Urgencia", tipo: "select", opciones: ["Bajo", "Normal", "Alto", "Crítico"], requerida: true, valorDefecto: "Normal", factorCalculo: 1 },
    { nombre: "tipoEquipo", etiqueta: "Tipo de Equipo", tipo: "select", opciones: ["ATM", "POS", "Servidor", "Red", "Otro"], requerida: true, valorDefecto: "ATM", factorCalculo: 1 },
  ],
  Instalación: [
    { nombre: "cantidadEquipos", etiqueta: "Cantidad de Equipos", tipo: "numero", requerida: true, valorDefecto: 1, factorCalculo: 100 },
    { nombre: "complejidad", etiqueta: "Complejidad", tipo: "select", opciones: ["Baja", "Media", "Alta"], requerida: true, valorDefecto: "Media", factorCalculo: 1 },
    { nombre: "distancia", etiqueta: "Distancia (km)", tipo: "numero", requerida: false, valorDefecto: 0, factorCalculo: 0.5 },
  ],
  "Mantenimiento Preventivo": [
    { nombre: "tiempo", etiqueta: "Horas", tipo: "numero", requerida: true, valorDefecto: 2, factorCalculo: 35 },
    { nombre: "tipoEquipo", etiqueta: "Tipo de Equipo", tipo: "select", opciones: ["ATM", "POS", "Cámara", "Sensor", "Otro"], requerida: true, valorDefecto: "ATM", factorCalculo: 1 },
    { nombre: "periodicidad", etiqueta: "Periodicidad", tipo: "select", opciones: ["Único", "Mensual", "Trimestral", "Semestral", "Anual"], requerida: true, valorDefecto: "Mensual", factorCalculo: 1 },
  ],
  "Mantenimiento Correctivo": [
    { nombre: "tiempo", etiqueta: "Horas", tipo: "numero", requerida: true, valorDefecto: 1, factorCalculo: 55 },
    { nombre: "tipoEquipo", etiqueta: "Tipo de Equipo", tipo: "select", opciones: ["ATM", "POS", "Cámara", "Sensor", "Otro"], requerida: true, valorDefecto: "ATM", factorCalculo: 1 },
    { nombre: "nivelUrgencia", etiqueta: "Nivel de Urgencia", tipo: "select", opciones: ["Bajo", "Normal", "Alto", "Crítico"], requerida: true, valorDefecto: "Normal", factorCalculo: 1 },
  ],
  "Servicio General": [
    { nombre: "tiempo", etiqueta: "Horas", tipo: "numero", requerida: true, valorDefecto: 1, factorCalculo: 30 },
    { nombre: "tipoServicio", etiqueta: "Tipo", tipo: "select", opciones: ["Consultoría", "Auditoría", "Capacitación", "Otro"], requerida: true, valorDefecto: "Consultoría", factorCalculo: 1 },
  ],
};

export const TIPOS_PROVEEDOR = Object.keys(CATEGORIAS_POR_TIPO_PROVEEDOR);
export const CATEGORIAS_SERVICIO = Object.keys(VARIABLES_POR_CATEGORIA);

/* ──────────────── Helpers ──────────────── */

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function cloneVariables(servicioId: string, base: Omit<VariableTarifaria, "id" | "servicioId">[]): VariableTarifaria[] {
  return base.map((v) => ({ ...v, id: makeId(), servicioId }));
}

export function calcularPrecio(servicio: Servicio, valores: Record<string, number>): number {
  let total = 0;
  for (const v of servicio.variables) {
    const val = valores[v.nombre] ?? Number(v.valorDefecto) ?? 0;
    if (v.tipo === "select") {
      const idx = (v.opciones ?? []).indexOf(String(v.valorDefecto));
      total += (idx + 1) * v.factorCalculo;
    } else {
      total += val * v.factorCalculo;
    }
  }
  return total;
}

/* ──────────────── Demo Data ──────────────── */

const PROVEEDORES_DEMO: Proveedor[] = [
  {
    id: "prov-1",
    codigo: "PROV-TV-001",
    nombre: "Panamericano C.A.",
    tipo: "Transportista de Valores",
    contacto: "Juan Pérez",
    telefono: "+58 212-555.0101",
    email: "contacto@trasvalven.com",
    direccion: "Av. Principal, Zona Industrial Los Cortijos, Caracas",
    activo: true,
    createdAt: "2026-01-15",
    updatedAt: "2026-01-15",
  },
  {
    id: "prov-6",
    codigo: "PROV-TV-002",
    nombre: "Viseteca",
    tipo: "Transportista de Valores",
    contacto: "Luis Fernández",
    telefono: "+58 251-555.0606",
    email: "contacto@viseteca.com",
    direccion: "Carrera 4, Edif. Central, Barquisimeto",
    activo: true,
    createdAt: "2026-02-15",
    updatedAt: "2026-02-15",
  },
  {
    id: "prov-7",
    codigo: "PROV-TV-003",
    nombre: "Tranvalor",
    tipo: "Transportista de Valores",
    contacto: "Ricardo Gómez",
    telefono: "+58 261-555.0707",
    email: "contacto@tranvalor.com",
    direccion: "Av. Delicias, Torre Empresarial, Maracaibo",
    activo: true,
    createdAt: "2026-03-01",
    updatedAt: "2026-03-01",
  },
  {
    id: "prov-2",
    codigo: "PROV-IN-001",
    nombre: "Suministros Bancarios C.A.",
    tipo: "Insumos",
    contacto: "María García",
    telefono: "+58 241-555.0202",
    email: "ventas@suministrosbancarios.com",
    direccion: "Calle 10, Edif. Comercial, Valencia",
    activo: true,
    createdAt: "2026-02-01",
    updatedAt: "2026-02-01",
  },
  {
    id: "prov-3",
    codigo: "PROV-IN-002",
    nombre: "Precintos de Seguridad C.A.",
    tipo: "Insumos",
    contacto: "Carlos Mendoza",
    telefono: "+58 261-555.0303",
    email: "info@precintosseguros.com",
    direccion: "Calle 72, Edif. Central, Maracaibo",
    activo: true,
    createdAt: "2026-02-10",
    updatedAt: "2026-02-10",
  },
  {
    id: "prov-4",
    codigo: "PROV-SV-001",
    nombre: "Servicios de Seguridad Global C.A.",
    tipo: "Seguridad",
    contacto: "Ana Rodríguez",
    telefono: "+58 212-555.0404",
    email: "seguridad@serviciosglobal.com",
    direccion: "Av. Libertador, Torre Empresarial, Caracas",
    activo: true,
    createdAt: "2026-03-01",
    updatedAt: "2026-03-01",
  },
  {
    id: "prov-5",
    codigo: "PROV-TEC-001",
    nombre: "Soluciones Tecnológicas COE C.A.",
    tipo: "Tecnología",
    contacto: "Pedro Rivas",
    telefono: "+58 212-555.0505",
    email: "soporte@solucionestecnologicas.com",
    direccion: "Av. Francisco de Miranda, Edif. Cristal, Caracas",
    activo: true,
    createdAt: "2026-03-15",
    updatedAt: "2026-03-15",
  },
];

let _servSeq = 0;

function nextServCode(categoria: string): string {
  _servSeq++;
  const cat = categoria.slice(0, 3).toUpperCase();
  return `SRV-${cat}-${String(_servSeq).padStart(3, "0")}`;
}

function defVigencia(): Pick<Servicio, "fechaInicio" | "fechaVencimiento" | "accionVencimiento" | "diasPreaviso" | "ultimaRenovacion" | "estadosAplicables" | "rutas"> {
  const inicio = new Date("2026-01-01");
  const venc = new Date("2026-12-31");
  return {
    fechaInicio: inicio.toISOString().split("T")[0],
    fechaVencimiento: venc.toISOString().split("T")[0],
    accionVencimiento: "Renovar",
    diasPreaviso: 30,
    ultimaRenovacion: inicio.toISOString().split("T")[0],
    estadosAplicables: [],
    rutas: [],
  };
}

function buildServiciosConVariables(): Servicio[] {
  return [
    { id: "serv-1", codigo: nextServCode("Traslado"), proveedorId: "prov-1", categoria: "Traslado", nombre: "Transporte de Valores CCS-Centro", descripcion: "Traslado de efectivo y valores agencias del Centro", precio: 2500, variables: cloneVariables("serv-1", VARIABLES_POR_CATEGORIA.Traslado), activo: true, ...defVigencia(), createdAt: "2026-01-15", updatedAt: "2026-01-15" },
    { id: "serv-14", codigo: nextServCode("Traslado"), proveedorId: "prov-1", categoria: "Traslado", nombre: "Transporte de Valores CCS-Este", descripcion: "Traslado de efectivo y valores agencias del Este", precio: 3200, variables: cloneVariables("serv-14", VARIABLES_POR_CATEGORIA.Traslado), activo: true, ...defVigencia(), createdAt: "2026-01-20", updatedAt: "2026-01-20" },
    { id: "serv-4", codigo: nextServCode("Custodia"), proveedorId: "prov-1", categoria: "Custodia", nombre: "Custodia Temporal en Bóveda", descripcion: "Almacenamiento temporal seguro de efectivo en tránsito", precio: 900, variables: cloneVariables("serv-4", VARIABLES_POR_CATEGORIA.Custodia), activo: true, ...defVigencia(), createdAt: "2026-01-15", updatedAt: "2026-01-15" },
    { id: "serv-3", codigo: nextServCode("Conteo"), proveedorId: "prov-1", categoria: "Conteo", nombre: "Conteo y Verificación Mecanizada", descripcion: "Conteo mecanizado y verificación de autenticidad de efectivo", precio: 1200, variables: cloneVariables("serv-3", VARIABLES_POR_CATEGORIA.Conteo), activo: true, ...defVigencia(), createdAt: "2026-01-15", updatedAt: "2026-01-15" },
    { id: "serv-2", codigo: nextServCode("Manipulación"), proveedorId: "prov-1", categoria: "Manipulación", nombre: "Manipulación de Efectivo", descripcion: "Recepción, clasificación y empaque de billetes y monedas", precio: 1800, variables: cloneVariables("serv-2", VARIABLES_POR_CATEGORIA.Manipulación), activo: true, ...defVigencia(), createdAt: "2026-01-15", updatedAt: "2026-01-15" },
    { id: "serv-15", codigo: nextServCode("Consumible"), proveedorId: "prov-1", categoria: "Consumible", nombre: "Bolsas de Seguridad para Transporte", descripcion: "Bolsas plastificadas con precinto numerado", precio: 0.5, variables: cloneVariables("serv-15", VARIABLES_POR_CATEGORIA.Consumible), activo: true, ...defVigencia(), createdAt: "2026-02-01", updatedAt: "2026-02-01" },
    { id: "serv-5", codigo: nextServCode("Consumible"), proveedorId: "prov-2", categoria: "Consumible", nombre: "Bolsas para Efectivo", descripcion: "Bolsas plásticas con precinto de seguridad para transporte de efectivo", precio: 0.35, variables: cloneVariables("serv-5", VARIABLES_POR_CATEGORIA.Consumible), activo: true, ...defVigencia(), createdAt: "2026-02-01", updatedAt: "2026-02-01" },
    { id: "serv-6", codigo: nextServCode("Consumible"), proveedorId: "prov-2", categoria: "Consumible", nombre: "Bolsas para Monedas", descripcion: "Bolsas de distintos tamaños para transporte de monedas fraccionarias", precio: 0.25, variables: cloneVariables("serv-6", VARIABLES_POR_CATEGORIA.Consumible), activo: true, ...defVigencia(), createdAt: "2026-02-01", updatedAt: "2026-02-01" },
    { id: "serv-7", codigo: nextServCode("Consumible"), proveedorId: "prov-2", categoria: "Consumible", nombre: "Sobres de Depósito", descripcion: "Sobres con cierre de seguridad para depósitos de clientes", precio: 0.15, variables: cloneVariables("serv-7", VARIABLES_POR_CATEGORIA.Consumible), activo: true, ...defVigencia(), createdAt: "2026-02-01", updatedAt: "2026-02-01" },
    { id: "serv-8", codigo: nextServCode("Consumible"), proveedorId: "prov-3", categoria: "Consumible", nombre: "Precintos Plásticos Numerados", descripcion: "Precintos de seguridad con numeración correlativa para bolsas de efectivo", precio: 0.08, variables: cloneVariables("serv-8", VARIABLES_POR_CATEGORIA.Consumible), activo: true, ...defVigencia(), createdAt: "2026-02-10", updatedAt: "2026-02-10" },
    { id: "serv-9", codigo: nextServCode("Consumible"), proveedorId: "prov-3", categoria: "Consumible", nombre: "Precintos Metálicos Alta Seguridad", descripcion: "Precintos metálicos inviolables para contenedores y bóvedas", precio: 0.45, variables: cloneVariables("serv-9", VARIABLES_POR_CATEGORIA.Consumible), activo: true, ...defVigencia(), createdAt: "2026-02-10", updatedAt: "2026-02-10" },
    { id: "serv-10", codigo: nextServCode("Consumible"), proveedorId: "prov-3", categoria: "Consumible", nombre: "Precintos Electrónicos RFID", descripcion: "Precintos inteligentes con chip RFID para trazabilidad", precio: 2.5, variables: cloneVariables("serv-10", VARIABLES_POR_CATEGORIA.Consumible), activo: true, ...defVigencia(), createdAt: "2026-02-10", updatedAt: "2026-02-10" },
    { id: "serv-11", codigo: nextServCode("Monitoreo"), proveedorId: "prov-4", categoria: "Monitoreo", nombre: "Monitoreo de Alarmas 24/7", descripcion: "Monitoreo 24/7 de sistemas de alarma de bóvedas y agencias", precio: 1500, variables: cloneVariables("serv-11", VARIABLES_POR_CATEGORIA.Monitoreo), activo: true, ...defVigencia(), createdAt: "2026-03-01", updatedAt: "2026-03-01" },
    { id: "serv-12", codigo: nextServCode("Vigilancia Electrónica"), proveedorId: "prov-4", categoria: "Vigilancia Electrónica", nombre: "Vigilancia Electrónica Perimetral", descripcion: "Sistema de cámaras y sensores con central de monitoreo", precio: 2200, variables: cloneVariables("serv-12", VARIABLES_POR_CATEGORIA["Vigilancia Electrónica"]), activo: true, ...defVigencia(), createdAt: "2026-03-01", updatedAt: "2026-03-01" },
    { id: "serv-13", codigo: nextServCode("Respuesta a Emergencias"), proveedorId: "prov-4", categoria: "Respuesta a Emergencias", nombre: "Respuesta a Emergencias 24h", descripcion: "Unidad de respuesta rápida ante activación de alarmas", precio: 1800, variables: cloneVariables("serv-13", VARIABLES_POR_CATEGORIA["Respuesta a Emergencias"]), activo: true, ...defVigencia(), createdAt: "2026-03-01", updatedAt: "2026-03-01" },
    { id: "serv-16", codigo: nextServCode("Consumible"), proveedorId: "prov-4", categoria: "Consumible", nombre: "Kit de Reposición Sensores", descripcion: "Kit de baterías y sensores de reposición", precio: 45, variables: cloneVariables("serv-16", VARIABLES_POR_CATEGORIA.Consumible), activo: true, ...defVigencia(), createdAt: "2026-03-15", updatedAt: "2026-03-15" },
    { id: "serv-17", codigo: nextServCode("Soporte Técnico"), proveedorId: "prov-5", categoria: "Soporte Técnico", nombre: "Soporte Técnico ATM", descripcion: "Soporte técnico especializado para cajeros automáticos", precio: 45, variables: cloneVariables("serv-17", VARIABLES_POR_CATEGORIA["Soporte Técnico"]), activo: true, ...defVigencia(), createdAt: "2026-03-15", updatedAt: "2026-03-15" },
    { id: "serv-18", codigo: nextServCode("Instalación"), proveedorId: "prov-5", categoria: "Instalación", nombre: "Instalación de ATM Nuevo", descripcion: "Instalación completa de cajero automático nuevo", precio: 500, variables: cloneVariables("serv-18", VARIABLES_POR_CATEGORIA.Instalación), activo: true, ...defVigencia(), createdAt: "2026-03-15", updatedAt: "2026-03-15" },
    { id: "serv-19", codigo: nextServCode("Mantenimiento Preventivo"), proveedorId: "prov-5", categoria: "Mantenimiento Preventivo", nombre: "Mantenimiento Preventivo ATM", descripcion: "Mantenimiento preventivo mensual de ATM", precio: 70, variables: cloneVariables("serv-19", VARIABLES_POR_CATEGORIA["Mantenimiento Preventivo"]), activo: true, ...defVigencia(), createdAt: "2026-03-15", updatedAt: "2026-03-15" },
    // Viseteca
    { id: "serv-20", codigo: nextServCode("Traslado"), proveedorId: "prov-6", categoria: "Traslado", nombre: "Transporte de Valores Occidente", descripcion: "Traslado de efectivo para agencias del Occidente", precio: 2300, variables: cloneVariables("serv-20", VARIABLES_POR_CATEGORIA.Traslado), activo: true, ...defVigencia(), createdAt: "2026-02-15", updatedAt: "2026-02-15" },
    { id: "serv-21", codigo: nextServCode("Manipulación"), proveedorId: "prov-6", categoria: "Manipulación", nombre: "Manipulación de Efectivo Viseteca", descripcion: "Recepción, clasificación y empaque de efectivo", precio: 1900, variables: cloneVariables("serv-21", VARIABLES_POR_CATEGORIA.Manipulación), activo: true, ...defVigencia(), createdAt: "2026-02-15", updatedAt: "2026-02-15" },
    { id: "serv-22", codigo: nextServCode("Custodia"), proveedorId: "prov-6", categoria: "Custodia", nombre: "Custodia Temporal Occidente", descripcion: "Almacenamiento temporal seguro en agencias Occidente", precio: 850, variables: cloneVariables("serv-22", VARIABLES_POR_CATEGORIA.Custodia), activo: true, ...defVigencia(), createdAt: "2026-02-15", updatedAt: "2026-02-15" },
    { id: "serv-23", codigo: nextServCode("Conteo"), proveedorId: "prov-6", categoria: "Conteo", nombre: "Conteo Mecanizado Viseteca", descripcion: "Conteo mecanizado y verificación de autenticidad", precio: 1300, variables: cloneVariables("serv-23", VARIABLES_POR_CATEGORIA.Conteo), activo: true, ...defVigencia(), createdAt: "2026-02-15", updatedAt: "2026-02-15" },
    // Tranvalor
    { id: "serv-24", codigo: nextServCode("Traslado"), proveedorId: "prov-7", categoria: "Traslado", nombre: "Transporte de Valores Zulia", descripcion: "Traslado de efectivo para agencias del Zulia", precio: 2700, variables: cloneVariables("serv-24", VARIABLES_POR_CATEGORIA.Traslado), activo: true, ...defVigencia(), createdAt: "2026-03-01", updatedAt: "2026-03-01" },
    { id: "serv-25", codigo: nextServCode("Manipulación"), proveedorId: "prov-7", categoria: "Manipulación", nombre: "Manipulación de Efectivo Tranvalor", descripcion: "Recepción, clasificación y empaque de billetes y monedas", precio: 1700, variables: cloneVariables("serv-25", VARIABLES_POR_CATEGORIA.Manipulación), activo: true, ...defVigencia(), createdAt: "2026-03-01", updatedAt: "2026-03-01" },
    { id: "serv-26", codigo: nextServCode("Custodia"), proveedorId: "prov-7", categoria: "Custodia", nombre: "Custodia Temporal Zulia", descripcion: "Almacenamiento temporal seguro en agencias Zulia", precio: 950, variables: cloneVariables("serv-26", VARIABLES_POR_CATEGORIA.Custodia), activo: true, ...defVigencia(), createdAt: "2026-03-01", updatedAt: "2026-03-01" },
    { id: "serv-27", codigo: nextServCode("Conteo"), proveedorId: "prov-7", categoria: "Conteo", nombre: "Conteo Mecanizado Tranvalor", descripcion: "Conteo mecanizado y verificación de autenticidad", precio: 1100, variables: cloneVariables("serv-27", VARIABLES_POR_CATEGORIA.Conteo), activo: true, ...defVigencia(), createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  ];
}

const UNIDADES_DEMO: UnidadTransporte[] = [
  { id: "und-1", proveedorId: "prov-1", placa: "ABC-123", marcaModelo: "Ford F-350 Blindado 2024", capacidadKg: 1500, nivelSeguridad: "Blindado", activo: true, latitud: 10.4806, longitud: -66.9036, createdAt: "2026-01-15", updatedAt: "2026-01-15" },
  { id: "und-2", proveedorId: "prov-1", placa: "DEF-456", marcaModelo: "Chevrolet Silverado Blindado 2023", capacidadKg: 2000, nivelSeguridad: "Máxima Seguridad", activo: true, latitud: 10.4850, longitud: -66.9000, createdAt: "2026-01-15", updatedAt: "2026-01-15" },
  { id: "und-3", proveedorId: "prov-1", placa: "GHI-789", marcaModelo: "Ram 1500 Blindado 2025", capacidadKg: 1200, nivelSeguridad: "Blindado", activo: true, latitud: 10.4900, longitud: -66.8500, createdAt: "2026-02-01", updatedAt: "2026-02-01" },
  { id: "und-4", proveedorId: "prov-4", placa: "JKL-012", marcaModelo: "Toyota Hilux 2024", capacidadKg: 800, nivelSeguridad: "Estándar", activo: true, latitud: 10.4700, longitud: -66.9100, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "und-5", proveedorId: "prov-4", placa: "MNO-345", marcaModelo: "Jeep Wrangler 2024", capacidadKg: 600, nivelSeguridad: "Estándar", activo: false, latitud: 10.4750, longitud: -66.9150, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "und-6", proveedorId: "prov-6", placa: "VIS-001", marcaModelo: "Toyota Hiace Blindado 2024", capacidadKg: 1000, nivelSeguridad: "Blindado", activo: true, latitud: 10.0730, longitud: -69.3220, createdAt: "2026-02-15", updatedAt: "2026-02-15" },
  { id: "und-7", proveedorId: "prov-6", placa: "VIS-002", marcaModelo: "Nissan Frontier Blindado 2023", capacidadKg: 1300, nivelSeguridad: "Blindado", activo: true, latitud: 10.0750, longitud: -69.3250, createdAt: "2026-02-15", updatedAt: "2026-02-15" },
  { id: "und-8", proveedorId: "prov-7", placa: "TRV-001", marcaModelo: "Chevrolet Silverado Blindado 2025", capacidadKg: 1800, nivelSeguridad: "Máxima Seguridad", activo: true, latitud: 10.6316, longitud: -71.6405, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "und-9", proveedorId: "prov-7", placa: "TRV-002", marcaModelo: "Ford Transit Blindado 2024", capacidadKg: 1100, nivelSeguridad: "Blindado", activo: true, latitud: 10.6350, longitud: -71.6450, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
];

const ASIGNACIONES_DEMO: ServicioUnidad[] = [
  { id: "asig-1", servicioId: "serv-1", unidadId: "und-1", rol: "Principal", fechaAsignacion: "2026-03-01" },
  { id: "asig-2", servicioId: "serv-1", unidadId: "und-2", rol: "Secundario", fechaAsignacion: "2026-03-01" },
  { id: "asig-3", servicioId: "serv-14", unidadId: "und-3", rol: "Principal", fechaAsignacion: "2026-03-15" },
  { id: "asig-4", servicioId: "serv-20", unidadId: "und-6", rol: "Principal", fechaAsignacion: "2026-02-15" },
  { id: "asig-5", servicioId: "serv-20", unidadId: "und-7", rol: "Secundario", fechaAsignacion: "2026-02-15" },
  { id: "asig-6", servicioId: "serv-24", unidadId: "und-8", rol: "Principal", fechaAsignacion: "2026-03-01" },
  { id: "asig-7", servicioId: "serv-24", unidadId: "und-9", rol: "Backup", fechaAsignacion: "2026-03-01" },
];

const ORDENES_DEMO: OrdenCompra[] = [
  { id: "oc-1", proveedorId: "prov-1", numero: "OC-2026-001", fecha: "2026-03-10", estado: "Aprobada", total: 4500, notas: "Servicio mensual de transporte y manipulación para agencia CCS Centro", createdAt: "2026-03-10", updatedAt: "2026-03-12" },
  { id: "oc-2", proveedorId: "prov-2", numero: "OC-2026-002", fecha: "2026-03-15", estado: "Recibida", total: 1250.5, notas: "Pedido trimestral de bolsas para efectivo y monedas", createdAt: "2026-03-15", updatedAt: "2026-03-20" },
  { id: "oc-3", proveedorId: "prov-3", numero: "OC-2026-003", fecha: "2026-04-01", estado: "Emitida", total: 340, notas: "Precintos plásticos numerados lote 10,000 unidades", createdAt: "2026-04-01", updatedAt: "2026-04-01" },
  { id: "oc-4", proveedorId: "prov-1", numero: "OC-2026-004", fecha: "2026-04-05", estado: "Borrador", total: 3200, notas: "Servicio de custodia temporal para fin de mes", createdAt: "2026-04-05", updatedAt: "2026-04-05" },
  { id: "oc-5", proveedorId: "prov-4", numero: "OC-2026-005", fecha: "2026-04-10", estado: "Aprobada", total: 5500, notas: "Monitoreo y vigilancia Q2 2026", createdAt: "2026-04-10", updatedAt: "2026-04-10" },
];

/* ──────────────── Store ──────────────── */

interface ProveedoresState {
  proveedores: Proveedor[];
  servicios: Servicio[];
  unidades: UnidadTransporte[];
  asignaciones: ServicioUnidad[];
  ordenes: OrdenCompra[];
  selectedProveedorId: string | null;
  selectedServicioId: string | null;
  selectedOrdenId: string | null;

  addProveedor: (p: Omit<Proveedor, "id" | "createdAt" | "updatedAt">) => void;
  updateProveedor: (id: string, d: Partial<Proveedor>) => void;
  removeProveedor: (id: string) => void;

  addServicio: (s: Omit<Servicio, "id" | "codigo" | "createdAt" | "updatedAt" | "estadosAplicables" | "rutas"> & { estadosAplicables?: string[]; rutas?: string[] }) => void;
  updateServicio: (id: string, d: Partial<Servicio>) => void;
  removeServicio: (id: string) => void;

  addUnidad: (u: Omit<UnidadTransporte, "id" | "createdAt" | "updatedAt">) => void;
  updateUnidad: (id: string, d: Partial<UnidadTransporte>) => void;
  removeUnidad: (id: string) => void;
  getUnidadesByProveedor: (proveedorId: string) => UnidadTransporte[];

  asignarUnidad: (a: Omit<ServicioUnidad, "id">) => void;
  desasignarUnidad: (id: string) => void;
  getUnidadesByServicio: (servicioId: string) => ServicioUnidad[];

  /* Sucursales */
  sucursales: SucursalProveedor[];
  addSucursal: (s: Omit<SucursalProveedor, "id" | "createdAt" | "updatedAt">) => void;
  updateSucursal: (id: string, d: Partial<SucursalProveedor>) => void;
  removeSucursal: (id: string) => void;
  getSucursalesByProveedor: (proveedorId: string) => SucursalProveedor[];

  /* Depósitos */
  depositos: DepositoProveedor[];
  addDeposito: (d: Omit<DepositoProveedor, "id" | "createdAt" | "updatedAt">) => void;
  updateDeposito: (id: string, d: Partial<DepositoProveedor>) => void;
  removeDeposito: (id: string) => void;
  getDepositosByProveedor: (proveedorId: string) => DepositoProveedor[];

  /* Centros de Acopio */
  centrosAcopio: CentroAcopio[];
  addCentroAcopio: (c: Omit<CentroAcopio, "id" | "createdAt" | "updatedAt">) => void;
  updateCentroAcopio: (id: string, d: Partial<CentroAcopio>) => void;
  removeCentroAcopio: (id: string) => void;
  getCentrosAcopioByProveedor: (proveedorId: string) => CentroAcopio[];

  /* Personal de Transportista */
  personalTransportista: PersonalTransportista[];
  addPersonal: (p: Omit<PersonalTransportista, "id" | "createdAt" | "updatedAt">) => void;
  updatePersonal: (id: string, d: Partial<PersonalTransportista>) => void;
  removePersonal: (id: string) => void;
  getPersonalByProveedor: (proveedorId: string) => PersonalTransportista[];

  addOrden: (o: Omit<OrdenCompra, "id" | "createdAt" | "updatedAt">) => void;
  updateOrden: (id: string, d: Partial<OrdenCompra>) => void;
  removeOrden: (id: string) => void;

  selectProveedor: (id: string | null) => void;
  selectServicio: (id: string | null) => void;
  selectOrden: (id: string | null) => void;

  getServiciosByProveedor: (proveedorId: string) => Servicio[];
  getOrdenesByProveedor: (proveedorId: string) => OrdenCompra[];
  getProveedorById: (id: string) => Proveedor | undefined;
  getCategoriasByTipoProveedor: (tipo: string) => string[];
  getVariablesPorDefecto: (categoria: string) => Omit<VariableTarifaria, "id" | "servicioId">[];
  calcularPrecio: (servicioId: string, valores: Record<string, number>) => number;
}

const SUCURSALES_DEMO: SucursalProveedor[] = [
  { id: "suc-prov-1", proveedorId: "prov-1", codigo: "SC-CCS-001", nombre: "Sucursal Caracas Centro", direccion: "Av. Universidad, Edif. Central, Caracas", contacto: "Luis Medina", telefono: "+58 212-555.0102", activo: true, createdAt: "2026-01-15", updatedAt: "2026-01-15" },
  { id: "suc-prov-2", proveedorId: "prov-1", codigo: "SC-VLC-001", nombre: "Sucursal Valencia", direccion: "Calle 100, Zona Industrial, Valencia", contacto: "Marta Rivas", telefono: "+58 241-555.0103", activo: true, createdAt: "2026-02-01", updatedAt: "2026-02-01" },
  { id: "suc-prov-3", proveedorId: "prov-2", codigo: "SC-MRQ-001", nombre: "Depósito Maracaibo", direccion: "Av. 5 de Julio, Maracaibo", contacto: "José López", telefono: "+58 261-555.0203", activo: true, createdAt: "2026-02-15", updatedAt: "2026-02-15" },
  { id: "suc-prov-4", proveedorId: "prov-4", codigo: "SC-CCS-002", nombre: "Oficina Las Mercedes", direccion: "Av. Principal de Las Mercedes, Caracas", contacto: "Carmen Díaz", telefono: "+58 212-555.0405", activo: true, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
];

const DEPOSITOS_DEMO: DepositoProveedor[] = [
  { id: "dep-prov-1", proveedorId: "prov-1", codigo: "DEP-CCS-001", nombre: "Bóveda Central Caracas", tipo: "Bóveda", direccion: "Av. Principal, Zona Industrial Los Cortijos", capacidad: 50000, activo: true, createdAt: "2026-01-15", updatedAt: "2026-01-15" },
  { id: "dep-prov-2", proveedorId: "prov-1", codigo: "DEP-VLC-001", nombre: "Depósito Valencia", tipo: "Almacén", direccion: "Calle 100, Zona Industrial Valencia", capacidad: 20000, activo: true, createdAt: "2026-02-01", updatedAt: "2026-02-01" },
  { id: "dep-prov-3", proveedorId: "prov-4", codigo: "DEP-CCS-002", nombre: "Depósito de Equipos", tipo: "Almacén", direccion: "Av. Libertador, Torre Empresarial", capacidad: 10000, activo: true, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
];

const CENTROS_ACOPIO_DEMO: CentroAcopio[] = [
  { id: "ca-prov-1", proveedorId: "prov-1", codigo: "CA-CCS-001", nombre: "Centro de Acopio Caracas", tipo: "Centro de Acopio", direccion: "Av. Principal, Zona Industrial Los Cortijos, Caracas", latitud: 10.4806, longitud: -66.9036, capacidad: 100000, activo: true, createdAt: "2026-01-15", updatedAt: "2026-01-15" },
  { id: "ca-prov-2", proveedorId: "prov-1", codigo: "CA-VLC-001", nombre: "Centro de Acopio Valencia", tipo: "Punto de Recolección", direccion: "Calle 100, Zona Industrial Valencia", latitud: 10.162, longitud: -68.003, capacidad: 50000, activo: true, createdAt: "2026-02-01", updatedAt: "2026-02-01" },
  { id: "ca-prov-3", proveedorId: "prov-1", codigo: "CA-MRQ-001", nombre: "Base Operativa Maracaibo", tipo: "Base Operativa", direccion: "Av. 5 de Julio, Maracaibo", latitud: 10.6316, longitud: -71.6405, capacidad: 75000, activo: true, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
];

const PERSONAL_DEMO: PersonalTransportista[] = [
  { id: "per-prov-1", proveedorId: "prov-1", codigo: "EMP-001", nombre: "Carlos Mendoza", cedula: "V-12.345.678", telefono: "+58 412-555.1001", cargo: "Conductor", foto: "", carnet: "", codigoValidacion: "VLD-A7X9-K2M4", licencia: "L-987654", tipoLicencia: "Tipo E", fechaVencimientoLicencia: "2027-06-15", fechaIngreso: "2024-03-01", validadoBanco: true, activo: true, createdAt: "2026-01-15", updatedAt: "2026-01-15" },
  { id: "per-prov-2", proveedorId: "prov-1", codigo: "EMP-002", nombre: "Ana Rodríguez", cedula: "V-23.456.789", telefono: "+58 414-555.1002", cargo: "Custodio", foto: "", carnet: "", codigoValidacion: "VLD-B8Y3-P5N7", licencia: "L-876543", tipoLicencia: "Tipo D", fechaVencimientoLicencia: "2026-12-20", fechaIngreso: "2024-06-15", validadoBanco: true, activo: true, createdAt: "2026-01-15", updatedAt: "2026-01-15" },
  { id: "per-prov-3", proveedorId: "prov-1", codigo: "EMP-003", nombre: "Pedro López", cedula: "V-34.567.890", telefono: "+58 416-555.1003", cargo: "Supervisor", foto: "", carnet: "", codigoValidacion: "VLD-C6Z1-R8T2", licencia: "L-765432", tipoLicencia: "Tipo E", fechaVencimientoLicencia: "2027-09-30", fechaIngreso: "2023-11-01", validadoBanco: true, activo: true, createdAt: "2026-01-15", updatedAt: "2026-01-15" },
  { id: "per-prov-4", proveedorId: "prov-1", codigo: "EMP-004", nombre: "María Torres", cedula: "V-45.678.901", telefono: "+58 424-555.1004", cargo: "Escolta", foto: "", carnet: "", codigoValidacion: "VLD-D4W2-Q3L9", licencia: "L-654321", tipoLicencia: "Tipo D", fechaVencimientoLicencia: "2026-08-15", fechaIngreso: "2024-09-01", validadoBanco: false, activo: true, createdAt: "2026-02-01", updatedAt: "2026-02-01" },
];

export const useProveedoresStore = create<ProveedoresState>((set, get) => ({
  proveedores: PROVEEDORES_DEMO,
  servicios: buildServiciosConVariables(),
  unidades: UNIDADES_DEMO,
  asignaciones: ASIGNACIONES_DEMO,
  sucursales: SUCURSALES_DEMO,
  depositos: DEPOSITOS_DEMO,
  centrosAcopio: CENTROS_ACOPIO_DEMO,
  personalTransportista: PERSONAL_DEMO,
  ordenes: ORDENES_DEMO,
  selectedProveedorId: null,
  selectedServicioId: null,
  selectedOrdenId: null,

  /* ── Proveedores CRUD ── */
  addProveedor: (data) => {
    const now = new Date().toISOString();
    const item: Proveedor = { ...data, id: makeId(), createdAt: now, updatedAt: now };
    set((s) => ({ proveedores: [...s.proveedores, item] }));
  },
  updateProveedor: (id, data) => {
    set((s) => ({
      proveedores: s.proveedores.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
      ),
    }));
  },
  removeProveedor: (id) => {
    set((s) => ({
      proveedores: s.proveedores.filter((p) => p.id !== id),
      servicios: s.servicios.filter((s) => s.proveedorId !== id),
      unidades: s.unidades.filter((u) => u.proveedorId !== id),
      sucursales: s.sucursales.filter((sc) => sc.proveedorId !== id),
      depositos: s.depositos.filter((d) => d.proveedorId !== id),
      centrosAcopio: s.centrosAcopio.filter((c) => c.proveedorId !== id),
      personalTransportista: s.personalTransportista.filter((p) => p.proveedorId !== id),
      asignaciones: s.asignaciones.filter((a) =>
        !s.servicios.some((sv) => sv.id === a.servicioId && sv.proveedorId === id)
      ),
      ordenes: s.ordenes.filter((o) => o.proveedorId !== id),
    }));
  },

  /* ── Servicios CRUD ── */
  addServicio: (data) => {
    const now = new Date().toISOString();
    const variables = get().getVariablesPorDefecto(data.categoria).map((v) => ({
      ...v, id: makeId(), servicioId: makeId(),
    }));
    const servicioId = makeId();
    const hoy = now.split("T")[0];
    const venc = new Date();
    venc.setFullYear(venc.getFullYear() + 1);
    const item: Servicio = {
      id: servicioId,
      codigo: nextServCode(data.categoria),
      variables: variables.map((v) => ({ ...v, servicioId })),
      estadosAplicables: [],
      rutas: [],
      fechaInicio: hoy,
      fechaVencimiento: venc.toISOString().split("T")[0],
      accionVencimiento: "Renovar",
      diasPreaviso: 30,
      ultimaRenovacion: hoy,
      createdAt: now,
      updatedAt: now,
      ...data,
    };
    set((s) => ({ servicios: [...s.servicios, item] }));
  },
  updateServicio: (id, data) => {
    set((s) => ({
      servicios: s.servicios.map((sv) =>
        sv.id === id ? { ...sv, ...data, updatedAt: new Date().toISOString() } : sv
      ),
    }));
  },
  removeServicio: (id) => {
    set((s) => ({
      servicios: s.servicios.filter((sv) => sv.id !== id),
      asignaciones: s.asignaciones.filter((a) => a.servicioId !== id),
    }));
  },

  /* ── Unidades de Transporte CRUD ── */
  addUnidad: (data) => {
    const now = new Date().toISOString();
    const item: UnidadTransporte = { ...data, id: makeId(), createdAt: now, updatedAt: now };
    set((s) => ({ unidades: [...s.unidades, item] }));
  },
  updateUnidad: (id, data) => {
    set((s) => ({
      unidades: s.unidades.map((u) =>
        u.id === id ? { ...u, ...data, updatedAt: new Date().toISOString() } : u
      ),
    }));
  },
  removeUnidad: (id) => {
    set((s) => ({
      unidades: s.unidades.filter((u) => u.id !== id),
      asignaciones: s.asignaciones.filter((a) => a.unidadId !== id),
    }));
  },
  getUnidadesByProveedor: (proveedorId) =>
    get().unidades.filter((u) => u.proveedorId === proveedorId && u.activo),

  /* ── Asignaciones Servicio ↔ Unidad ── */
  asignarUnidad: (data) => {
    const item: ServicioUnidad = { ...data, id: makeId() };
    set((s) => ({ asignaciones: [...s.asignaciones, item] }));
  },
  desasignarUnidad: (id) => {
    set((s) => ({ asignaciones: s.asignaciones.filter((a) => a.id !== id) }));
  },
  getUnidadesByServicio: (servicioId) =>
    get().asignaciones.filter((a) => a.servicioId === servicioId),

  /* ── Sucursales CRUD ── */
  addSucursal: (data) => {
    const now = new Date().toISOString();
    const item: SucursalProveedor = { ...data, id: makeId(), createdAt: now, updatedAt: now };
    set((s) => ({ sucursales: [...s.sucursales, item] }));
  },
  updateSucursal: (id, data) => {
    set((s) => ({
      sucursales: s.sucursales.map((sc) => sc.id === id ? { ...sc, ...data, updatedAt: new Date().toISOString() } : sc),
    }));
  },
  removeSucursal: (id) => {
    set((s) => ({ sucursales: s.sucursales.filter((sc) => sc.id !== id) }));
  },
  getSucursalesByProveedor: (proveedorId) =>
    get().sucursales.filter((s) => s.proveedorId === proveedorId && s.activo),

  /* ── Depósitos CRUD ── */
  addDeposito: (data) => {
    const now = new Date().toISOString();
    const item: DepositoProveedor = { ...data, id: makeId(), createdAt: now, updatedAt: now };
    set((s) => ({ depositos: [...s.depositos, item] }));
  },
  updateDeposito: (id, data) => {
    set((s) => ({
      depositos: s.depositos.map((d) => d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d),
    }));
  },
  removeDeposito: (id) => {
    set((s) => ({ depositos: s.depositos.filter((d) => d.id !== id) }));
  },
  getDepositosByProveedor: (proveedorId) =>
    get().depositos.filter((d) => d.proveedorId === proveedorId && d.activo),

  /* ── Centros de Acopio CRUD ── */
  addCentroAcopio: (data) => {
    const now = new Date().toISOString();
    const item: CentroAcopio = { ...data, id: makeId(), createdAt: now, updatedAt: now };
    set((s) => ({ centrosAcopio: [...s.centrosAcopio, item] }));
  },
  updateCentroAcopio: (id, data) => {
    set((s) => ({
      centrosAcopio: s.centrosAcopio.map((c) => c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c),
    }));
  },
  removeCentroAcopio: (id) => {
    set((s) => ({ centrosAcopio: s.centrosAcopio.filter((c) => c.id !== id) }));
  },
  getCentrosAcopioByProveedor: (proveedorId) =>
    get().centrosAcopio.filter((c) => c.proveedorId === proveedorId && c.activo),

  /* ── Personal de Transportista CRUD ── */
  addPersonal: (data) => {
    const now = new Date().toISOString();
    const item: PersonalTransportista = { ...data, id: makeId(), createdAt: now, updatedAt: now };
    set((s) => ({ personalTransportista: [...s.personalTransportista, item] }));
  },
  updatePersonal: (id, data) => {
    set((s) => ({
      personalTransportista: s.personalTransportista.map((p) => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p),
    }));
  },
  removePersonal: (id) => {
    set((s) => ({ personalTransportista: s.personalTransportista.filter((p) => p.id !== id) }));
  },
  getPersonalByProveedor: (proveedorId) =>
    get().personalTransportista.filter((p) => p.proveedorId === proveedorId && p.activo),

  /* ── Órdenes CRUD ── */
  addOrden: (data) => {
    const now = new Date().toISOString();
    const item: OrdenCompra = { ...data, id: makeId(), createdAt: now, updatedAt: now };
    set((s) => ({ ordenes: [...s.ordenes, item] }));
  },
  updateOrden: (id, data) => {
    set((s) => ({
      ordenes: s.ordenes.map((o) =>
        o.id === id ? { ...o, ...data, updatedAt: new Date().toISOString() } : o
      ),
    }));
  },
  removeOrden: (id) => {
    set((s) => ({ ordenes: s.ordenes.filter((o) => o.id !== id) }));
  },

  /* ── Selection ── */
  selectProveedor: (id) => set({ selectedProveedorId: id }),
  selectServicio: (id) => set({ selectedServicioId: id }),
  selectOrden: (id) => set({ selectedOrdenId: id }),

  /* ── Queries ── */
  getServiciosByProveedor: (proveedorId) =>
    get().servicios.filter((s) => s.proveedorId === proveedorId),

  getOrdenesByProveedor: (proveedorId) =>
    get().ordenes.filter((o) => o.proveedorId === proveedorId),

  getProveedorById: (id) => get().proveedores.find((p) => p.id === id),

  getCategoriasByTipoProveedor: (tipo) =>
    CATEGORIAS_POR_TIPO_PROVEEDOR[tipo] ?? [],

  getVariablesPorDefecto: (categoria) =>
    VARIABLES_POR_CATEGORIA[categoria] ?? [],

  calcularPrecio: (servicioId, valores) => {
    const sv = get().servicios.find((s) => s.id === servicioId);
    if (!sv) return 0;
    return calcularPrecio(sv, valores);
  },
}));
