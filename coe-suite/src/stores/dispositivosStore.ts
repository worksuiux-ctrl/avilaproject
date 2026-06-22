import { create } from "zustand";

export interface TipoDispositivo {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarcaDispositivo {
  id: string;
  nombre: string;
  tipoDispositivoIds: string[];
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CajetinConfig {
  nombre: string;
  capacidad: number;
  moneda: string;
  denominacion: number;
}

export interface DepositoModuleConfig {
  capacidad: number;
  aceptaSobres: boolean;
}

export interface ATMMultifuncionalConfig {
  cajetines: CajetinConfig[];
  deposito: DepositoModuleConfig;
}

export interface ATMDepositoConfig {
  deposito: DepositoModuleConfig;
}

export interface ATMRemotoConfig {
  cajetines: CajetinConfig[];
  comunicacion: "GPRS" | "Satelital" | "VSAT";
  fuentePoder: "Red" | "Solar" | "Batería";
}

export interface CofreConfig {
  capacidad: number;
}

export interface POSConfig {
  tipoConectividad: "WiFi" | "Ethernet" | "GPRS";
  tieneImpresora: boolean;
}

export interface ModeloDispositivo {
  id: string;
  marcaId: string;
  tipoDispositivoId: string;
  nombre: string;
  descripcion?: string;
  configuracion?: CajetinConfig[] | ATMMultifuncionalConfig | ATMDepositoConfig | ATMRemotoConfig | CofreConfig | POSConfig | Record<string, unknown>;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

/* ──────────── Demo Data ──────────── */

const TIPOS_DEMO: TipoDispositivo[] = [
  { id: "tpd-1a", nombre: "ATM de Retiro", descripcion: "Cajero automático solo dispensación de efectivo", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "tpd-1b", nombre: "ATM Multifuncional", descripcion: "Cajero automático con retiro y depósito", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "tpd-1c", nombre: "ATM de Depósito", descripcion: "Cajero automático para depósitos", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "tpd-1d", nombre: "ATM Multimoneda", descripcion: "Cajero automático multidivisa", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "tpd-1e", nombre: "ATM Remoto", descripcion: "Cajero automático remoto autónomo", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "tpd-2", nombre: "Caja", descripcion: "Caja registradora / caja de banco", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "tpd-3", nombre: "Terminal Punto de Venta", descripcion: "POS para transacciones comerciales", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "tpd-4", nombre: "Máquina Contadora", descripcion: "Equipo de conteo y clasificación de billetes", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "tpd-5", nombre: "Lector Biométrico", descripcion: "Dispositivo de autenticación por huella, rostro o iris", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
];

const MARCAS_DEMO: MarcaDispositivo[] = [
  { id: "marc-1", nombre: "NCR", tipoDispositivoIds: ["tpd-1a", "tpd-1b", "tpd-1d", "tpd-1e", "tpd-2"], activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "marc-2", nombre: "Diebold Nixdorf", tipoDispositivoIds: ["tpd-1a", "tpd-1b", "tpd-1e"], activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "marc-3", nombre: "Hyosung", tipoDispositivoIds: ["tpd-1b", "tpd-1d"], activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "marc-4", nombre: "Genmega", tipoDispositivoIds: ["tpd-1a"], activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "marc-5", nombre: "Ingenico", tipoDispositivoIds: ["tpd-3"], activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "marc-6", nombre: "Verifone", tipoDispositivoIds: ["tpd-3"], activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "marc-7", nombre: "PAX", tipoDispositivoIds: ["tpd-3"], activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "marc-8", nombre: "Epson", tipoDispositivoIds: ["tpd-2"], activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "marc-9", nombre: "Oki", tipoDispositivoIds: ["tpd-2"], activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "marc-10", nombre: "BSPM", tipoDispositivoIds: ["tpd-4"], activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "marc-11", nombre: "Laurel", tipoDispositivoIds: ["tpd-4"], activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "marc-12", nombre: "De La Rue", tipoDispositivoIds: ["tpd-4"], activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "marc-13", nombre: "Suprema", tipoDispositivoIds: ["tpd-5"], activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "marc-14", nombre: "HID Global", tipoDispositivoIds: ["tpd-5"], activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "marc-15", nombre: "ZKTeco", tipoDispositivoIds: ["tpd-5"], activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
];

const MODELOS_DEMO: ModeloDispositivo[] = [
  /* ── ATM de Retiro ── */
  {
    id: "mod-1", marcaId: "marc-1", tipoDispositivoId: "tpd-1a", nombre: "NCR 5587",
    configuracion: [
      { nombre: "Cajetín 1 USD", capacidad: 2000, moneda: "USD", denominacion: 100 },
      { nombre: "Cajetín 2 VES", capacidad: 3000, moneda: "VES", denominacion: 20 },
    ] as CajetinConfig[],
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  {
    id: "mod-4", marcaId: "marc-2", tipoDispositivoId: "tpd-1a", nombre: "Diebold 460",
    configuracion: [
      { nombre: "Cajetín 1 USD", capacidad: 2000, moneda: "USD", denominacion: 100 },
      { nombre: "Cajetín 2 VES", capacidad: 3500, moneda: "VES", denominacion: 20 },
    ] as CajetinConfig[],
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  /* ── ATM Multifuncional ── */
  {
    id: "mod-2", marcaId: "marc-1", tipoDispositivoId: "tpd-1b", nombre: "NCR SelfServ 22",
    configuracion: {
      cajetines: [
        { nombre: "Cajetín 1 USD", capacidad: 2500, moneda: "USD", denominacion: 50 },
        { nombre: "Cajetín 2 VES", capacidad: 4000, moneda: "VES", denominacion: 20 },
        { nombre: "Cajetín 3 VES", capacidad: 3000, moneda: "VES", denominacion: 10 },
      ],
      deposito: { capacidad: 5000, aceptaSobres: true },
    } as ATMMultifuncionalConfig,
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  {
    id: "mod-3", marcaId: "marc-1", tipoDispositivoId: "tpd-1b", nombre: "NCR SelfServ 32",
    configuracion: {
      cajetines: [
        { nombre: "Cajetín 1 USD", capacidad: 3000, moneda: "USD", denominacion: 100 },
        { nombre: "Cajetín 2 USD", capacidad: 2000, moneda: "USD", denominacion: 50 },
        { nombre: "Cajetín 3 VES", capacidad: 5000, moneda: "VES", denominacion: 20 },
        { nombre: "Cajetín 4 Rechazos", capacidad: 500, moneda: "Mixto", denominacion: 0 },
      ],
      deposito: { capacidad: 8000, aceptaSobres: true },
    } as ATMMultifuncionalConfig,
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  {
    id: "mod-5", marcaId: "marc-2", tipoDispositivoId: "tpd-1b", nombre: "Diebold 560",
    configuracion: {
      cajetines: [
        { nombre: "Cajetín 1 USD", capacidad: 3000, moneda: "USD", denominacion: 100 },
        { nombre: "Cajetín 2 USD", capacidad: 2000, moneda: "USD", denominacion: 50 },
        { nombre: "Cajetín 3 VES", capacidad: 4000, moneda: "VES", denominacion: 20 },
      ],
      deposito: { capacidad: 6000, aceptaSobres: false },
    } as ATMMultifuncionalConfig,
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  /* ── ATM Multimoneda ── */
  {
    id: "mod-6", marcaId: "marc-3", tipoDispositivoId: "tpd-1d", nombre: "Hyosung NH 2500",
    configuracion: [
      { nombre: "Cajetín 1 USD", capacidad: 3000, moneda: "USD", denominacion: 100 },
      { nombre: "Cajetín 2 EUR", capacidad: 2000, moneda: "EUR", denominacion: 50 },
      { nombre: "Cajetín 3 VES", capacidad: 5000, moneda: "VES", denominacion: 20 },
      { nombre: "Cajetín 4 Rechazos", capacidad: 500, moneda: "Mixto", denominacion: 0 },
    ] as CajetinConfig[],
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  {
    id: "mod-7", marcaId: "marc-3", tipoDispositivoId: "tpd-1d", nombre: "Hyosung MX 5300",
    configuracion: [
      { nombre: "Cajetín 1 USD", capacidad: 4000, moneda: "USD", denominacion: 100 },
      { nombre: "Cajetín 2 EUR", capacidad: 2000, moneda: "EUR", denominacion: 50 },
      { nombre: "Cajetín 3 VES", capacidad: 6000, moneda: "VES", denominacion: 20 },
      { nombre: "Cajetín 4 VES", capacidad: 4000, moneda: "VES", denominacion: 10 },
      { nombre: "Cajetín 5 Rechazos", capacidad: 500, moneda: "Mixto", denominacion: 0 },
    ] as CajetinConfig[],
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  /* ── ATM Remoto ── */
  {
    id: "mod-17", marcaId: "marc-1", tipoDispositivoId: "tpd-1e", nombre: "NCR RemoteTeller X3",
    configuracion: {
      cajetines: [
        { nombre: "Cajetín 1 USD", capacidad: 1500, moneda: "USD", denominacion: 100 },
        { nombre: "Cajetín 2 VES", capacidad: 2500, moneda: "VES", denominacion: 20 },
      ],
      comunicacion: "GPRS",
      fuentePoder: "Solar",
    } as ATMRemotoConfig,
    activo: true, createdAt: "2026-06-01", updatedAt: "2026-06-01",
  },
  /* ── Caja ── */
  {
    id: "mod-8", marcaId: "marc-8", tipoDispositivoId: "tpd-2", nombre: "Caja Estándar Epson",
    configuracion: { capacidad: 5000 } as CofreConfig,
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  {
    id: "mod-9", marcaId: "marc-1", tipoDispositivoId: "tpd-2", nombre: "Caja Premium NCR",
    configuracion: { capacidad: 10000 } as CofreConfig,
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  {
    id: "mod-10", marcaId: "marc-9", tipoDispositivoId: "tpd-2", nombre: "Caja Básica Oki",
    configuracion: { capacidad: 3000 } as CofreConfig,
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  /* ── POS ── */
  {
    id: "mod-11", marcaId: "marc-5", tipoDispositivoId: "tpd-3", nombre: "Ingenico iPP 320",
    configuracion: { tipoConectividad: "WiFi", tieneImpresora: true } as POSConfig,
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  {
    id: "mod-12", marcaId: "marc-5", tipoDispositivoId: "tpd-3", nombre: "Ingenico iWL 220",
    configuracion: { tipoConectividad: "GPRS", tieneImpresora: true } as POSConfig,
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  {
    id: "mod-13", marcaId: "marc-6", tipoDispositivoId: "tpd-3", nombre: "Verifone VX 520",
    configuracion: { tipoConectividad: "GPRS", tieneImpresora: true } as POSConfig,
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  {
    id: "mod-14", marcaId: "marc-6", tipoDispositivoId: "tpd-3", nombre: "Verifone P400",
    configuracion: { tipoConectividad: "Ethernet", tieneImpresora: true } as POSConfig,
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  {
    id: "mod-15", marcaId: "marc-7", tipoDispositivoId: "tpd-3", nombre: "PAX S80",
    configuracion: { tipoConectividad: "Ethernet", tieneImpresora: false } as POSConfig,
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  {
    id: "mod-16", marcaId: "marc-7", tipoDispositivoId: "tpd-3", nombre: "PAX S90",
    configuracion: { tipoConectividad: "WiFi", tieneImpresora: true } as POSConfig,
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  /* ── Máquinas Contadoras ── */
  {
    id: "mod-18", marcaId: "marc-10", tipoDispositivoId: "tpd-4", nombre: "BSPM-200",
    configuracion: { velocidad: "1200 billetes/min", capacidad: 5000, detectaFalsos: true },
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  {
    id: "mod-19", marcaId: "marc-10", tipoDispositivoId: "tpd-4", nombre: "BSPM-400",
    configuracion: { velocidad: "1800 billetes/min", capacidad: 10000, detectaFalsos: true, clasificaDenominaciones: true },
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  {
    id: "mod-20", marcaId: "marc-11", tipoDispositivoId: "tpd-4", nombre: "Laurel SC-300",
    configuracion: { velocidad: "1000 billetes/min", capacidad: 3000, detectaFalsos: true },
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  {
    id: "mod-21", marcaId: "marc-12", tipoDispositivoId: "tpd-4", nombre: "De La Rue 8800",
    configuracion: { velocidad: "1500 billetes/min", capacidad: 8000, detectaFalsos: true, clasificaDenominaciones: true, serializa: true },
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  /* ── Lectores Biométricos ── */
  {
    id: "mod-22", marcaId: "marc-13", tipoDispositivoId: "tpd-5", nombre: "Suprema BioStation 2",
    configuracion: { tipo: "Huella", capacidad: 500000, modalidad: "Contacto", conectividad: "TCP/IP" },
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  {
    id: "mod-23", marcaId: "marc-13", tipoDispositivoId: "tpd-5", nombre: "Suprema FaceStation 2",
    configuracion: { tipo: "Rostro", capacidad: 300000, modalidad: "Sin contacto", conectividad: "TCP/IP" },
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  {
    id: "mod-24", marcaId: "marc-14", tipoDispositivoId: "tpd-5", nombre: "HID Signo 20",
    configuracion: { tipo: "Huella", capacidad: 250000, modalidad: "Contacto", conectividad: "USB/TCP/IP" },
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  {
    id: "mod-25", marcaId: "marc-15", tipoDispositivoId: "tpd-5", nombre: "ZKTeco inBio 460",
    configuracion: { tipo: "Huella + Tarjeta", capacidad: 300000, modalidad: "Contacto", conectividad: "TCP/IP" },
    activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
];

/* ──────────── Store ──────────── */

interface DispositivosState {
  tiposDispositivo: TipoDispositivo[];
  marcas: MarcaDispositivo[];
  modelos: ModeloDispositivo[];

  addTipoDispositivo: (d: Omit<TipoDispositivo, "id" | "createdAt" | "updatedAt">) => void;
  updateTipoDispositivo: (id: string, d: Partial<TipoDispositivo>) => void;
  removeTipoDispositivo: (id: string) => void;

  addMarca: (m: Omit<MarcaDispositivo, "id" | "createdAt" | "updatedAt">) => void;
  updateMarca: (id: string, d: Partial<MarcaDispositivo>) => void;
  removeMarca: (id: string) => void;

  addModelo: (m: Omit<ModeloDispositivo, "id" | "createdAt" | "updatedAt">) => void;
  updateModelo: (id: string, d: Partial<ModeloDispositivo>) => void;
  removeModelo: (id: string) => void;

  getMarcasByTipoDispositivo: (tipoDispositivoId: string) => MarcaDispositivo[];
  getModelosByMarcaYTipo: (marcaId: string, tipoDispositivoId: string) => ModeloDispositivo[];
  getTiposByNombre: (nombre: string) => TipoDispositivo | undefined;
  getMarcaByNombre: (nombre: string) => MarcaDispositivo | undefined;
  getModeloById: (id: string) => ModeloDispositivo | undefined;
  getModeloByNombreYMarca: (nombre: string, marcaId: string) => ModeloDispositivo | undefined;
}

export const useDispositivosStore = create<DispositivosState>((set, get) => ({
  tiposDispositivo: TIPOS_DEMO,
  marcas: MARCAS_DEMO,
  modelos: MODELOS_DEMO,

  addTipoDispositivo: (data) => {
    const now = new Date().toISOString();
    const item: TipoDispositivo = { ...data, id: makeId(), createdAt: now, updatedAt: now };
    set((s) => ({ tiposDispositivo: [...s.tiposDispositivo, item] }));
  },
  updateTipoDispositivo: (id, data) => {
    set((s) => ({
      tiposDispositivo: s.tiposDispositivo.map((t) =>
        t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
      ),
    }));
  },
  removeTipoDispositivo: (id) => {
    set((s) => ({
      tiposDispositivo: s.tiposDispositivo.filter((t) => t.id !== id),
      modelos: s.modelos.filter((m) => m.tipoDispositivoId !== id),
    }));
  },

  addMarca: (data) => {
    const now = new Date().toISOString();
    const item: MarcaDispositivo = { ...data, id: makeId(), createdAt: now, updatedAt: now };
    set((s) => ({ marcas: [...s.marcas, item] }));
  },
  updateMarca: (id, data) => {
    set((s) => ({
      marcas: s.marcas.map((m) =>
        m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m
      ),
    }));
  },
  removeMarca: (id) => {
    set((s) => ({
      marcas: s.marcas.filter((m) => m.id !== id),
      modelos: s.modelos.filter((mo) => mo.marcaId !== id),
    }));
  },

  addModelo: (data) => {
    const now = new Date().toISOString();
    const item: ModeloDispositivo = { ...data, id: makeId(), createdAt: now, updatedAt: now };
    set((s) => ({ modelos: [...s.modelos, item] }));
  },
  updateModelo: (id, data) => {
    set((s) => ({
      modelos: s.modelos.map((m) =>
        m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m
      ),
    }));
  },
  removeModelo: (id) => {
    set((s) => ({ modelos: s.modelos.filter((m) => m.id !== id) }));
  },

  getMarcasByTipoDispositivo: (tipoDispositivoId) => {
    return get().marcas.filter((m) => m.tipoDispositivoIds.includes(tipoDispositivoId) && m.activo);
  },

  getModelosByMarcaYTipo: (marcaId, tipoDispositivoId) => {
    return get().modelos.filter(
      (m) => m.marcaId === marcaId && m.tipoDispositivoId === tipoDispositivoId && m.activo
    );
  },

  getTiposByNombre: (nombre) => get().tiposDispositivo.find((t) => t.nombre === nombre),
  getMarcaByNombre: (nombre) => get().marcas.find((m) => m.nombre === nombre),
  getModeloById: (id) => get().modelos.find((m) => m.id === id),
  getModeloByNombreYMarca: (nombre, marcaId) =>
    get().modelos.find((m) => m.nombre === nombre && m.marcaId === marcaId),
}));
