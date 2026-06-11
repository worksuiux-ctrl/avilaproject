import { create } from "zustand";

export interface Cliente {
  id: string;
  codigo: string;
  razonSocial: string;
  tipoPersona: "Natural" | "Jurídico";
  giroNegocio: string;
  idCliente: string;
  estatusCumplimiento: string;
  limiteCredito: number;
  nivelFidelidad: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sucursal {
  id: string;
  clienteId: string;
  codigo: string;
  nombre: string;
  direccion: string;
  contacto: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcuerdoComercial {
  id: string;
  clienteId: string;
  plazoPago: string;
  listaPrecios: string;
  puntosEntrega: string;
  ventanasRecepcion: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ClientesState {
  clientes: Cliente[];
  sucursales: Sucursal[];
  acuerdos: AcuerdoComercial[];
  addCliente: (c: Omit<Cliente, "id" | "createdAt" | "updatedAt">) => void;
  updateCliente: (id: string, d: Partial<Cliente>) => void;
  removeCliente: (id: string) => void;
  addSucursal: (s: Omit<Sucursal, "id" | "createdAt" | "updatedAt">) => void;
  updateSucursal: (id: string, d: Partial<Sucursal>) => void;
  removeSucursal: (id: string) => void;
  addAcuerdo: (a: Omit<AcuerdoComercial, "id" | "createdAt" | "updatedAt">) => void;
  updateAcuerdo: (id: string, d: Partial<AcuerdoComercial>) => void;
  removeAcuerdo: (id: string) => void;
  getSucursalesByCliente: (clienteId: string) => Sucursal[];
  getAcuerdosByCliente: (clienteId: string) => AcuerdoComercial[];
  getClienteById: (id: string) => Cliente | undefined;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

const GIROS = ["Farmacia", "Supermercado", "Retail", "Restaurante", "Banca", "Seguros", "Telecomunicaciones", "Logística", "Gobierno", "Otros"];
const NIVELES_FIDELIDAD = ["Estándar", "VIP", "Oro"];
const ESTATUS_CUMPLIMIENTO = ["Pendiente", "Verificado", "En Revisión", "Rechazado"];

const CLIENTES_DEMO: Cliente[] = [
  {
    id: "cli-1",
    codigo: "CLI-FAR-001",
    razonSocial: "Farmatodo C.A.",
    tipoPersona: "Jurídico",
    giroNegocio: "Farmacia",
    idCliente: "FAR-001",
    estatusCumplimiento: "Verificado",
    limiteCredito: 500000,
    nivelFidelidad: "Oro",
    activo: true,
    createdAt: "2026-01-15",
    updatedAt: "2026-01-15",
  },
  {
    id: "cli-2",
    codigo: "CLI-SUP-001",
    razonSocial: "Supermercados Plaza's C.A.",
    tipoPersona: "Jurídico",
    giroNegocio: "Supermercado",
    idCliente: "SPL-001",
    estatusCumplimiento: "Verificado",
    limiteCredito: 750000,
    nivelFidelidad: "Oro",
    activo: true,
    createdAt: "2026-02-01",
    updatedAt: "2026-02-01",
  },
  {
    id: "cli-3",
    codigo: "CLI-RET-001",
    razonSocial: "Distribuidora Textil del Centro C.A.",
    tipoPersona: "Jurídico",
    giroNegocio: "Retail",
    idCliente: "DTC-001",
    estatusCumplimiento: "En Revisión",
    limiteCredito: 250000,
    nivelFidelidad: "VIP",
    activo: true,
    createdAt: "2026-02-15",
    updatedAt: "2026-02-15",
  },
  {
    id: "cli-4",
    codigo: "CLI-RES-001",
    razonSocial: "Restaurantes La Estación C.A.",
    tipoPersona: "Jurídico",
    giroNegocio: "Restaurante",
    idCliente: "RLE-001",
    estatusCumplimiento: "Verificado",
    limiteCredito: 100000,
    nivelFidelidad: "Estándar",
    activo: true,
    createdAt: "2026-03-01",
    updatedAt: "2026-03-01",
  },
  {
    id: "cli-5",
    codigo: "CLI-BAN-001",
    razonSocial: "Banco del Pueblo",
    tipoPersona: "Jurídico",
    giroNegocio: "Banca",
    idCliente: "BDP-001",
    estatusCumplimiento: "Verificado",
    limiteCredito: 2000000,
    nivelFidelidad: "Oro",
    activo: true,
    createdAt: "2026-03-10",
    updatedAt: "2026-03-10",
  },
  {
    id: "cli-6",
    codigo: "CLI-NAT-001",
    razonSocial: "Carlos Andrés Pérez",
    tipoPersona: "Natural",
    giroNegocio: "Otros",
    idCliente: "CAP-001",
    estatusCumplimiento: "Pendiente",
    limiteCredito: 15000,
    nivelFidelidad: "Estándar",
    activo: true,
    createdAt: "2026-04-01",
    updatedAt: "2026-04-01",
  },
];

const SUCURSALES_DEMO: Sucursal[] = [
  { id: "suc-1", clienteId: "cli-1", codigo: "FAR-CCS-01", nombre: "Farmatodo Sabana Grande", direccion: "Av. Sabana Grande, Caracas", contacto: "Laura Méndez", activo: true, createdAt: "2026-01-20", updatedAt: "2026-01-20" },
  { id: "suc-2", clienteId: "cli-1", codigo: "FAR-CCS-02", nombre: "Farmatodo Las Mercedes", direccion: "Centro Comercial Galerías, Las Mercedes", contacto: "José Rivas", activo: true, createdAt: "2026-01-25", updatedAt: "2026-01-25" },
  { id: "suc-3", clienteId: "cli-1", codigo: "FAR-VLC-01", nombre: "Farmatodo Valencia", direccion: "Av. Bolívar, Valencia", contacto: "Marta Linares", activo: true, createdAt: "2026-02-01", updatedAt: "2026-02-01" },
  { id: "suc-4", clienteId: "cli-2", codigo: "SPL-CCS-01", nombre: "Plaza's Centro", direccion: "CCCT, Chuao, Caracas", contacto: "Pedro Guerra", activo: true, createdAt: "2026-02-10", updatedAt: "2026-02-10" },
  { id: "suc-5", clienteId: "cli-2", codigo: "SPL-MRD-01", nombre: "Plaza's Miranda", direccion: "Centro Comercial Lider, Miranda", contacto: "Rosa Arvelo", activo: true, createdAt: "2026-02-15", updatedAt: "2026-02-15" },
  { id: "suc-6", clienteId: "cli-4", codigo: "RLE-CCS-01", nombre: "La Estación Sabana Grande", direccion: "Av. Sabana Grande, Edif. La Estación, Caracas", contacto: "Andrés Torres", activo: true, createdAt: "2026-03-05", updatedAt: "2026-03-05" },
  { id: "suc-7", clienteId: "cli-5", codigo: "BDP-CCS-01", nombre: "Banco del Pueblo CCS Centro", direccion: "Av. Urdaneta, Caracas", contacto: "Carmen Díaz", activo: true, createdAt: "2026-03-15", updatedAt: "2026-03-15" },
  { id: "suc-8", clienteId: "cli-5", codigo: "BDP-MRQ-01", nombre: "Banco del Pueblo Maracaibo", direccion: "Av. 5 de Julio, Maracaibo", contacto: "Luis Salazar", activo: true, createdAt: "2026-03-20", updatedAt: "2026-03-20" },
];

const ACUERDOS_DEMO: AcuerdoComercial[] = [
  { id: "ac-1", clienteId: "cli-1", plazoPago: "30 días", listaPrecios: "Lista A - Farmacia", puntosEntrega: "Farmatodo Sabana Grande, Farmatodo Las Mercedes, Farmatodo Valencia", ventanasRecepcion: "Lun-Vie 8:00-16:00", activo: true, createdAt: "2026-01-20", updatedAt: "2026-01-20" },
  { id: "ac-2", clienteId: "cli-2", plazoPago: "45 días", listaPrecios: "Lista B - Supermercados", puntosEntrega: "Plaza's Centro, Plaza's Miranda", ventanasRecepcion: "Lun-Sáb 6:00-18:00", activo: true, createdAt: "2026-02-10", updatedAt: "2026-02-10" },
  { id: "ac-3", clienteId: "cli-3", plazoPago: "60 días", listaPrecios: "Lista C - Retail", puntosEntrega: "Almacén Central DTC, Av. Las Industrias", ventanasRecepcion: "Lun-Vie 7:00-15:00", activo: true, createdAt: "2026-02-20", updatedAt: "2026-02-20" },
  { id: "ac-4", clienteId: "cli-5", plazoPago: "15 días", listaPrecios: "Lista Preferencial - Banca", puntosEntrega: "Banco del Pueblo CCS Centro, Banco del Pueblo Maracaibo", ventanasRecepcion: "Lun-Vie 7:00-17:00", activo: true, createdAt: "2026-03-15", updatedAt: "2026-03-15" },
  { id: "ac-5", clienteId: "cli-4", plazoPago: "30 días", listaPrecios: "Lista A - Restaurantes", puntosEntrega: "La Estación Sabana Grande", ventanasRecepcion: "Lun-Dom 8:00-12:00", activo: true, createdAt: "2026-03-05", updatedAt: "2026-03-05" },
];

export const useClientesStore = create<ClientesState>((set, get) => ({
  clientes: CLIENTES_DEMO,
  sucursales: SUCURSALES_DEMO,
  acuerdos: ACUERDOS_DEMO,

  addCliente: (data) => {
    const now = new Date().toISOString();
    const item: Cliente = { ...data, id: makeId(), createdAt: now, updatedAt: now };
    set((s) => ({ clientes: [...s.clientes, item] }));
  },
  updateCliente: (id, data) => {
    set((s) => ({
      clientes: s.clientes.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
      ),
    }));
  },
  removeCliente: (id) => {
    set((s) => ({
      clientes: s.clientes.filter((c) => c.id !== id),
      sucursales: s.sucursales.filter((suc) => suc.clienteId !== id),
      acuerdos: s.acuerdos.filter((a) => a.clienteId !== id),
    }));
  },

  addSucursal: (data) => {
    const now = new Date().toISOString();
    const item: Sucursal = { ...data, id: makeId(), createdAt: now, updatedAt: now };
    set((s) => ({ sucursales: [...s.sucursales, item] }));
  },
  updateSucursal: (id, data) => {
    set((s) => ({
      sucursales: s.sucursales.map((su) =>
        su.id === id ? { ...su, ...data, updatedAt: new Date().toISOString() } : su
      ),
    }));
  },
  removeSucursal: (id) => {
    set((s) => ({ sucursales: s.sucursales.filter((su) => su.id !== id) }));
  },

  addAcuerdo: (data) => {
    const now = new Date().toISOString();
    const item: AcuerdoComercial = { ...data, id: makeId(), createdAt: now, updatedAt: now };
    set((s) => ({ acuerdos: [...s.acuerdos, item] }));
  },
  updateAcuerdo: (id, data) => {
    set((s) => ({
      acuerdos: s.acuerdos.map((a) =>
        a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a
      ),
    }));
  },
  removeAcuerdo: (id) => {
    set((s) => ({ acuerdos: s.acuerdos.filter((a) => a.id !== id) }));
  },

  getSucursalesByCliente: (clienteId) =>
    get().sucursales.filter((s) => s.clienteId === clienteId),

  getAcuerdosByCliente: (clienteId) =>
    get().acuerdos.filter((a) => a.clienteId === clienteId),

  getClienteById: (id) => get().clientes.find((c) => c.id === id),
}));

export { GIROS, NIVELES_FIDELIDAD, ESTATUS_CUMPLIMIENTO };
