import { create } from "zustand";

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

export interface Servicio {
  id: string;
  proveedorId: string;
  nombre: string;
  descripcion: string;
  precio: number;
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

interface ProveedoresState {
  proveedores: Proveedor[];
  servicios: Servicio[];
  ordenes: OrdenCompra[];
  selectedProveedorId: string | null;
  selectedServicioId: string | null;
  selectedOrdenId: string | null;
  addProveedor: (p: Omit<Proveedor, "id" | "createdAt" | "updatedAt">) => void;
  updateProveedor: (id: string, d: Partial<Proveedor>) => void;
  removeProveedor: (id: string) => void;
  addServicio: (s: Omit<Servicio, "id" | "createdAt" | "updatedAt">) => void;
  updateServicio: (id: string, d: Partial<Servicio>) => void;
  removeServicio: (id: string) => void;
  addOrden: (o: Omit<OrdenCompra, "id" | "createdAt" | "updatedAt">) => void;
  updateOrden: (id: string, d: Partial<OrdenCompra>) => void;
  removeOrden: (id: string) => void;
  selectProveedor: (id: string | null) => void;
  selectServicio: (id: string | null) => void;
  selectOrden: (id: string | null) => void;
  getServiciosByProveedor: (proveedorId: string) => Servicio[];
  getOrdenesByProveedor: (proveedorId: string) => OrdenCompra[];
  getProveedorById: (id: string) => Proveedor | undefined;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

const PROVEEDORES_DEMO: Proveedor[] = [
  {
    id: "prov-1",
    codigo: "PROV-TV-001",
    nombre: "Trasvalven C.A.",
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
    tipo: "Servicios",
    contacto: "Ana Rodríguez",
    telefono: "+58 212-555.0404",
    email: "seguridad@serviciosglobal.com",
    direccion: "Av. Libertador, Torre Empresarial, Caracas",
    activo: true,
    createdAt: "2026-03-01",
    updatedAt: "2026-03-01",
  },
];

const SERVICIOS_DEMO: Servicio[] = [
  /* Trasvalven */
  { id: "serv-1", proveedorId: "prov-1", nombre: "Transporte de Valores", descripcion: "Traslado de efectivo y valores entre agencias y bóvedas", precio: 2500, activo: true, createdAt: "2026-01-15", updatedAt: "2026-01-15" },
  { id: "serv-2", proveedorId: "prov-1", nombre: "Manipulación de Efectivo", descripcion: "Recepción, clasificación y empaque de billetes y monedas", precio: 1800, activo: true, createdAt: "2026-01-15", updatedAt: "2026-01-15" },
  { id: "serv-3", proveedorId: "prov-1", nombre: "Conteo y Verificación", descripcion: "Conteo mecanizado y verificación de autenticidad de efectivo", precio: 1200, activo: true, createdAt: "2026-01-15", updatedAt: "2026-01-15" },
  { id: "serv-4", proveedorId: "prov-1", nombre: "Custodia Temporal", descripcion: "Almacenamiento temporal seguro de efectivo en tránsito", precio: 900, activo: true, createdAt: "2026-01-15", updatedAt: "2026-01-15" },
  /* Suministros Bancarios */
  { id: "serv-5", proveedorId: "prov-2", nombre: "Bolsas para Efectivo", descripcion: "Bolsas plásticas con precinto de seguridad para transporte de efectivo", precio: 0.35, activo: true, createdAt: "2026-02-01", updatedAt: "2026-02-01" },
  { id: "serv-6", proveedorId: "prov-2", nombre: "Bolsas para Monedas", descripcion: "Bolsas de distintos tamaños para transporte de monedas fraccionarias", precio: 0.25, activo: true, createdAt: "2026-02-01", updatedAt: "2026-02-01" },
  { id: "serv-7", proveedorId: "prov-2", nombre: "Sobres de Depósito", descripcion: "Sobres con cierre de seguridad para depósitos de clientes", precio: 0.15, activo: true, createdAt: "2026-02-01", updatedAt: "2026-02-01" },
  /* Precintos de Seguridad */
  { id: "serv-8", proveedorId: "prov-3", nombre: "Precintos Plásticos Numerados", descripcion: "Precintos de seguridad con numeración correlativa para bolsas de efectivo", precio: 0.08, activo: true, createdAt: "2026-02-10", updatedAt: "2026-02-10" },
  { id: "serv-9", proveedorId: "prov-3", nombre: "Precintos Metálicos Alta Seguridad", descripcion: "Precintos metálicos inviolables para contenedores y bóvedas", precio: 0.45, activo: true, createdAt: "2026-02-10", updatedAt: "2026-02-10" },
  { id: "serv-10", proveedorId: "prov-3", nombre: "Precintos Electrónicos RFID", descripcion: "Precintos inteligentes con chip RFID para trazabilidad", precio: 2.5, activo: true, createdAt: "2026-02-10", updatedAt: "2026-02-10" },
  /* Seguridad Global */
  { id: "serv-11", proveedorId: "prov-4", nombre: "Monitoreo de Alarmas", descripcion: "Monitoreo 24/7 de sistemas de alarma de bóvedas y agencias", precio: 1500, activo: true, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "serv-12", proveedorId: "prov-4", nombre: "Vigilancia Electrónica", descripcion: "Sistema de cámaras y sensores con central de monitoreo", precio: 2200, activo: true, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "serv-13", proveedorId: "prov-4", nombre: "Respuesta a Emergencias", descripcion: "Unidad de respuesta rápida ante activación de alarmas", precio: 1800, activo: true, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
];

const ORDENES_DEMO: OrdenCompra[] = [
  { id: "oc-1", proveedorId: "prov-1", numero: "OC-2026-001", fecha: "2026-03-10", estado: "Aprobada", total: 4500, notas: "Servicio mensual de transporte y manipulación para agencia CCS Centro", createdAt: "2026-03-10", updatedAt: "2026-03-12" },
  { id: "oc-2", proveedorId: "prov-2", numero: "OC-2026-002", fecha: "2026-03-15", estado: "Recibida", total: 1250.5, notas: "Pedido trimestral de bolsas para efectivo y monedas", createdAt: "2026-03-15", updatedAt: "2026-03-20" },
  { id: "oc-3", proveedorId: "prov-3", numero: "OC-2026-003", fecha: "2026-04-01", estado: "Emitida", total: 340, notas: "Precintos plásticos numerados lote 10,000 unidades", createdAt: "2026-04-01", updatedAt: "2026-04-01" },
  { id: "oc-4", proveedorId: "prov-1", numero: "OC-2026-004", fecha: "2026-04-05", estado: "Borrador", total: 3200, notas: "Servicio de custodia temporal para fin de mes", createdAt: "2026-04-05", updatedAt: "2026-04-05" },
  { id: "oc-5", proveedorId: "prov-4", numero: "OC-2026-005", fecha: "2026-04-10", estado: "Aprobada", total: 5500, notas: "Monitoreo y vigilancia Q2 2026", createdAt: "2026-04-10", updatedAt: "2026-04-10" },
];

export const useProveedoresStore = create<ProveedoresState>((set, get) => ({
  proveedores: PROVEEDORES_DEMO,
  servicios: SERVICIOS_DEMO,
  ordenes: ORDENES_DEMO,
  selectedProveedorId: null,
  selectedServicioId: null,
  selectedOrdenId: null,

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
      ordenes: s.ordenes.filter((o) => o.proveedorId !== id),
    }));
  },

  addServicio: (data) => {
    const now = new Date().toISOString();
    const item: Servicio = { ...data, id: makeId(), createdAt: now, updatedAt: now };
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
    set((s) => ({ servicios: s.servicios.filter((sv) => sv.id !== id) }));
  },

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

  selectProveedor: (id) => set({ selectedProveedorId: id }),
  selectServicio: (id) => set({ selectedServicioId: id }),
  selectOrden: (id) => set({ selectedOrdenId: id }),

  getServiciosByProveedor: (proveedorId) =>
    get().servicios.filter((s) => s.proveedorId === proveedorId),

  getOrdenesByProveedor: (proveedorId) =>
    get().ordenes.filter((o) => o.proveedorId === proveedorId),

  getProveedorById: (id) => get().proveedores.find((p) => p.id === id),
}));
