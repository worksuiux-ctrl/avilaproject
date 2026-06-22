import { create } from "zustand";
import { useDispositivosStore } from "./dispositivosStore";

export interface Entity {
  id: string;
  codigo: string;
  nombre: string;
  nivel: string;
  subtipo: string;
  padreId: string | null;
  activo: boolean;
  saldo?: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface EntitiesState {
  entities: Entity[];
  selectedId: string | null;
  expandedIds: Set<string>;
  addEntity: (e: Omit<Entity, "id" | "createdAt" | "updatedAt">) => void;
  updateEntity: (id: string, data: Partial<Entity>) => void;
  removeEntity: (id: string) => void;
  selectEntity: (id: string | null) => void;
  toggleExpand: (id: string) => void;
  getChildren: (padreId: string | null) => Entity[];
  getAncestors: (id: string) => Entity[];
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

const DEFAULT_ENTITIES: Entity[] = [
  /* Centrales Administrativas */
  {
    id: "demo-central-1",
    codigo: "CEN-OCC",
    nombre: "Central Administrativa - Centro Norte",
    nivel: "Central Administrativa",
    subtipo: "Central Principal",
    padreId: null,
    activo: true,
    metadata: {
      codigoCentral: "CEN-OCC",
      region: "Occidente",
      direccionCentral: "Av. Principal, Edif. Central, Piso 1",
      monedaBase: "VES",
      estadoCentral: "Activo",
      coordenadas: { lat: 10.162, lng: -68.003 },
    },
    createdAt: "2025-06-01",
    updatedAt: "2025-06-01",
  },
  {
    id: "demo-central-2",
    codigo: "CEN-CCS",
    nombre: "Central Administrativa Occidente",
    nivel: "Central Administrativa",
    subtipo: "Regional",
    padreId: null,
    activo: true,
    metadata: {
      codigoCentral: "CEN-OCC",
      region: "Occidente",
      direccionCentral: "Av. Libertador, Edif. COE, Piso 3",
      monedaBase: "VES",
      estadoCentral: "Activo",
      coordenadas: { lat: 10.4806, lng: -66.9036 },
    },
    createdAt: "2025-06-01",
    updatedAt: "2025-06-01",
  },
  {
    id: "demo-central-3",
    codigo: "CEN-ORI",
    nombre: "Central Administrativa Oriente",
    nivel: "Central Administrativa",
    subtipo: "Regional",
    padreId: null,
    activo: true,
    metadata: {
      codigoCentral: "CEN-ORI",
      region: "Oriente",
      direccionCentral: "Av. Bolívar, Edif. Centro, Barcelona",
      monedaBase: "VES",
      estadoCentral: "Activo",
      coordenadas: { lat: 10.1333, lng: -64.6833 },
    },
    createdAt: "2025-06-01",
    updatedAt: "2025-06-01",
  },
  {
    id: "demo-1",
    codigo: "BCO-001",
    nombre: "Banco Mercantil Sede Principal",
    nivel: "Oficinas",
    subtipo: "Sucursal",
    padreId: "demo-central-1",
    activo: true,
    metadata: { coordenadas: { lat: 10.4806, lng: -66.9036 } },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "demo-2",
    codigo: "BCO-BOV-01",
    nombre: "Bóveda Central",
    nivel: "Depósitos",
    subtipo: "Bóveda",
    padreId: "demo-1",
    activo: true,
    metadata: { coordenadas: { lat: 10.4820, lng: -66.9050 } },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "demo-3",
    codigo: "BCO-ATM-01",
    nombre: "ATM Planta Baja",
    nivel: "Dispositivos",
    subtipo: "ATM",
    padreId: "demo-1",
    activo: true,
    metadata: { tipoDispositivoId: "tpd-1a", marca: "NCR", modelo: "NCR 5587", cantidad: 1, coordenadas: { lat: 10.4850, lng: -66.9000 } },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  /* Agencias */
  {
    id: "demo-5",
    codigo: "BCO-AGE-CCS",
    nombre: "Agencia Caracas Centro",
    nivel: "Oficinas",
    subtipo: "Agencia",
    padreId: "demo-central-1",
    activo: true,
    metadata: { coordenadas: { lat: 10.4900, lng: -66.8950 } },
    createdAt: "2026-01-15",
    updatedAt: "2026-01-15",
  },
  {
    id: "demo-6",
    codigo: "BCO-AGE-MRD",
    nombre: "Agencia Miranda",
    nivel: "Oficinas",
    subtipo: "Agencia",
    padreId: "demo-central-1",
    activo: true,
    metadata: { coordenadas: { lat: 10.2500, lng: -66.4500 } },
    createdAt: "2026-02-01",
    updatedAt: "2026-02-01",
  },
  {
    id: "demo-7",
    codigo: "BCO-AGE-VLC",
    nombre: "Agencia Valencia",
    nivel: "Oficinas",
    subtipo: "Agencia",
    padreId: "demo-central-1",
    activo: true,
    metadata: { coordenadas: { lat: 10.1620, lng: -68.0030 } },
    createdAt: "2026-02-10",
    updatedAt: "2026-02-10",
  },
  {
    id: "demo-8",
    codigo: "BCO-AGE-MRQ",
    nombre: "Agencia Maracaibo",
    nivel: "Oficinas",
    subtipo: "Agencia",
    padreId: "demo-central-2",
    activo: true,
    metadata: { coordenadas: { lat: 10.6316, lng: -71.6405 } },
    createdAt: "2026-03-01",
    updatedAt: "2026-03-01",
  },
  /* Bóvedas por agencia */
  {
    id: "demo-15",
    codigo: "BCO-BOV-CCS-01",
    nombre: "Bóveda Principal CCS Centro",
    nivel: "Depósitos",
    subtipo: "Bóveda",
    padreId: "demo-5",
    activo: true,
    saldo: 1595000,
    metadata: { coordenadas: { lat: 10.4910, lng: -66.8940 } },
    createdAt: "2026-01-20",
    updatedAt: "2026-01-20",
  },
  {
    id: "demo-16",
    codigo: "BCO-BOV-CCS-02",
    nombre: "Bóveda Secundaria CCS Centro",
    nivel: "Depósitos",
    subtipo: "Bóveda",
    padreId: "demo-5",
    activo: true,
    saldo: 800000,
    metadata: { coordenadas: { lat: 10.4920, lng: -66.8930 } },
    createdAt: "2026-01-20",
    updatedAt: "2026-01-20",
  },
  {
    id: "demo-17",
    codigo: "BCO-BOV-MRD-01",
    nombre: "Bóveda Principal Miranda",
    nivel: "Depósitos",
    subtipo: "Bóveda",
    padreId: "demo-6",
    activo: true,
    saldo: 925000,
    metadata: { coordenadas: { lat: 10.2510, lng: -66.4520 } },
    createdAt: "2026-02-05",
    updatedAt: "2026-02-05",
  },
  {
    id: "demo-18",
    codigo: "BCO-BOV-MRD-02",
    nombre: "Bóveda de Resguardo Miranda",
    nivel: "Depósitos",
    subtipo: "Bóveda",
    padreId: "demo-6",
    activo: true,
    saldo: 1200000,
    metadata: { coordenadas: { lat: 10.2520, lng: -66.4530 } },
    createdAt: "2026-02-05",
    updatedAt: "2026-02-05",
  },
  {
    id: "demo-19",
    codigo: "BCO-BOV-MRD-03",
    nombre: "Caja Fuerte Miranda",
    nivel: "Depósitos",
    subtipo: "Caja Fuerte",
    padreId: "demo-6",
    activo: true,
    saldo: 500000,
    metadata: { coordenadas: { lat: 10.2530, lng: -66.4540 } },
    createdAt: "2026-02-10",
    updatedAt: "2026-02-10",
  },
  {
    id: "demo-20",
    codigo: "BCO-BOV-VLC-01",
    nombre: "Bóveda Principal Valencia",
    nivel: "Depósitos",
    subtipo: "Bóveda",
    padreId: "demo-7",
    activo: true,
    saldo: 750000,
    metadata: { coordenadas: { lat: 10.1630, lng: -68.0040 } },
    createdAt: "2026-02-15",
    updatedAt: "2026-02-15",
  },
  {
    id: "demo-21",
    codigo: "BCO-BOV-VLC-02",
    nombre: "Almacén Valencia",
    nivel: "Depósitos",
    subtipo: "Almacén",
    padreId: "demo-7",
    activo: true,
    saldo: 2000000,
    metadata: { coordenadas: { lat: 10.1640, lng: -68.0050 } },
    createdAt: "2026-02-15",
    updatedAt: "2026-02-15",
  },
  {
    id: "demo-22",
    codigo: "BCO-BOV-MRQ-01",
    nombre: "Bóveda Principal Maracaibo",
    nivel: "Depósitos",
    subtipo: "Bóveda",
    padreId: "demo-8",
    activo: true,
    saldo: 615000,
    metadata: { coordenadas: { lat: 10.6320, lng: -71.6410 } },
    createdAt: "2026-03-05",
    updatedAt: "2026-03-05",
  },
  /* Anaqueles */
  {
    id: "demo-anq-1",
    codigo: "ANQ-CCS-001",
    nombre: "Anaquel Efectivo USD",
    nivel: "Anaqueles",
    subtipo: "Anaquel",
    padreId: "demo-15",
    activo: true,
    saldo: 45000,
    metadata: {},
    createdAt: "2026-01-20",
    updatedAt: "2026-01-20",
  },
  {
    id: "demo-anq-2",
    codigo: "ANQ-CCS-002",
    nombre: "Anaquel Efectivo VES",
    nivel: "Anaqueles",
    subtipo: "Anaquel",
    padreId: "demo-15",
    activo: true,
    saldo: 1200000,
    metadata: {},
    createdAt: "2026-01-20",
    updatedAt: "2026-01-20",
  },
  {
    id: "demo-anq-3",
    codigo: "ANQ-CCS-003",
    nombre: "Anaquel Valores",
    nivel: "Anaqueles",
    subtipo: "Anaquel",
    padreId: "demo-15",
    activo: true,
    saldo: 350000,
    metadata: {},
    createdAt: "2026-01-20",
    updatedAt: "2026-01-20",
  },
  {
    id: "demo-anq-4",
    codigo: "ANQ-CCS-004",
    nombre: "Anaquel Respaldo",
    nivel: "Anaqueles",
    subtipo: "Anaquel",
    padreId: "demo-16",
    activo: true,
    saldo: 800000,
    metadata: {},
    createdAt: "2026-01-20",
    updatedAt: "2026-01-20",
  },
  {
    id: "demo-anq-5",
    codigo: "ANQ-MRD-001",
    nombre: "Anaquel Efectivo USD",
    nivel: "Anaqueles",
    subtipo: "Anaquel",
    padreId: "demo-17",
    activo: true,
    saldo: 25000,
    metadata: {},
    createdAt: "2026-02-05",
    updatedAt: "2026-02-05",
  },
  {
    id: "demo-anq-6",
    codigo: "ANQ-MRD-002",
    nombre: "Anaquel Efectivo VES",
    nivel: "Anaqueles",
    subtipo: "Anaquel",
    padreId: "demo-17",
    activo: true,
    saldo: 900000,
    metadata: {},
    createdAt: "2026-02-05",
    updatedAt: "2026-02-05",
  },
  {
    id: "demo-anq-7",
    codigo: "ANQ-MRQ-001",
    nombre: "Anaquel Efectivo USD",
    nivel: "Anaqueles",
    subtipo: "Anaquel",
    padreId: "demo-22",
    activo: true,
    saldo: 15000,
    metadata: {},
    createdAt: "2026-03-05",
    updatedAt: "2026-03-05",
  },
  {
    id: "demo-anq-8",
    codigo: "ANQ-MRQ-002",
    nombre: "Anaquel Efectivo VES",
    nivel: "Anaqueles",
    subtipo: "Anaquel",
    padreId: "demo-22",
    activo: true,
    saldo: 600000,
    metadata: {},
    createdAt: "2026-03-05",
    updatedAt: "2026-03-05",
  },
  /* ATMs */
  {
    id: "demo-9",
    codigo: "BCO-ATM-CCS01",
    nombre: "ATM Centro Comercial Sambil",
    nivel: "Dispositivos",
    subtipo: "ATM",
    padreId: "demo-5",
    activo: true,
    metadata: { tipoDispositivoId: "tpd-1b", marca: "NCR", modelo: "NCR SelfServ 22", cantidad: 1, coordenadas: { lat: 10.4950, lng: -66.8980 } },
    createdAt: "2026-01-20",
    updatedAt: "2026-01-20",
  },
  {
    id: "demo-10",
    codigo: "BCO-ATM-CCS02",
    nombre: "ATM Plaza Venezuela",
    nivel: "Dispositivos",
    subtipo: "ATM",
    padreId: "demo-5",
    activo: true,
    metadata: { tipoDispositivoId: "tpd-1a", marca: "Diebold Nixdorf", modelo: "Diebold 460", cantidad: 1, coordenadas: { lat: 10.4960, lng: -66.9020 } },
    createdAt: "2026-01-20",
    updatedAt: "2026-01-20",
  },
  {
    id: "demo-11",
    codigo: "BCO-ATM-MRD01",
    nombre: "ATM Centro Lider",
    nivel: "Dispositivos",
    subtipo: "ATM",
    padreId: "demo-6",
    activo: true,
    metadata: { tipoDispositivoId: "tpd-1b", marca: "NCR", modelo: "NCR SelfServ 32", cantidad: 1, coordenadas: { lat: 10.2550, lng: -66.4480 } },
    createdAt: "2026-02-05",
    updatedAt: "2026-02-05",
  },
  {
    id: "demo-12",
    codigo: "BCO-ATM-VLC01",
    nombre: "ATM Sambil Valencia",
    nivel: "Dispositivos",
    subtipo: "ATM",
    padreId: "demo-7",
    activo: true,
    metadata: { tipoDispositivoId: "tpd-1d", marca: "Hyosung", modelo: "Hyosung NH 2500", cantidad: 1, coordenadas: { lat: 10.1680, lng: -67.9990 } },
    createdAt: "2026-02-15",
    updatedAt: "2026-02-15",
  },
  {
    id: "demo-13",
    codigo: "BCO-ATM-MRQ01",
    nombre: "ATM Galerias Mall",
    nivel: "Dispositivos",
    subtipo: "ATM",
    padreId: "demo-8",
    activo: true,
    metadata: { tipoDispositivoId: "tpd-1b", marca: "Diebold Nixdorf", modelo: "Diebold 560", cantidad: 1, coordenadas: { lat: 10.6330, lng: -71.6380 } },
    createdAt: "2026-03-05",
    updatedAt: "2026-03-05",
  },
  {
    id: "demo-14",
    codigo: "BCO-ATM-CCS03",
    nombre: "ATM Torre Britanica",
    nivel: "Dispositivos",
    subtipo: "ATM",
    padreId: "demo-5",
    activo: true,
    metadata: { tipoDispositivoId: "tpd-1d", marca: "Hyosung", modelo: "Hyosung MX 5300", cantidad: 1, coordenadas: { lat: 10.4980, lng: -66.9080 } },
    createdAt: "2026-04-01",
    updatedAt: "2026-04-01",
  },
  /* Cajas y Taquillas por agencia */
  {
    id: "demo-23",
    codigo: "BCO-CAJ-SEDE-01",
    nombre: "Caja Principal Sede",
    nivel: "Dispositivos",
    subtipo: "Caja",
    padreId: "demo-1",
    activo: true,
    metadata: { tipoDispositivoId: "tpd-2", marca: "NCR", modelo: "Caja Premium NCR", cantidad: 1 },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "demo-24",
    codigo: "BCO-CAJ-SEDE-02",
    nombre: "Caja VIP Sede",
    nivel: "Dispositivos",
    subtipo: "Caja",
    padreId: "demo-1",
    activo: true,
    metadata: { tipoDispositivoId: "tpd-2", marca: "Epson", modelo: "Caja Estándar Epson", cantidad: 1 },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "demo-25",
    codigo: "BCO-CAJ-CCS-01",
    nombre: "Caja Principal CCS Centro",
    nivel: "Dispositivos",
    subtipo: "Caja",
    padreId: "demo-5",
    activo: true,
    metadata: { tipoDispositivoId: "tpd-2", marca: "NCR", modelo: "Caja Premium NCR", cantidad: 1 },
    createdAt: "2026-01-20",
    updatedAt: "2026-01-20",
  },
  {
    id: "demo-26",
    codigo: "BCO-CAJ-CCS-02",
    nombre: "Caja Express CCS Centro",
    nivel: "Dispositivos",
    subtipo: "Caja",
    padreId: "demo-5",
    activo: true,
    metadata: { tipoDispositivoId: "tpd-2", marca: "Oki", modelo: "Caja Básica Oki", cantidad: 1 },
    createdAt: "2026-01-20",
    updatedAt: "2026-01-20",
  },
  {
    id: "demo-27",
    codigo: "BCO-TAQ-CCS-01",
    nombre: "Taquilla Nocturna CCS",
    nivel: "Oficinas",
    subtipo: "Taquilla",
    padreId: "demo-5",
    activo: true,
    metadata: {},
    createdAt: "2026-01-20",
    updatedAt: "2026-01-20",
  },
  {
    id: "demo-28",
    codigo: "BCO-CAJ-MRD-01",
    nombre: "Caja Principal Miranda",
    nivel: "Dispositivos",
    subtipo: "Caja",
    padreId: "demo-6",
    activo: true,
    metadata: { tipoDispositivoId: "tpd-2", marca: "Epson", modelo: "Caja Estándar Epson", cantidad: 1 },
    createdAt: "2026-02-05",
    updatedAt: "2026-02-05",
  },
  {
    id: "demo-29",
    codigo: "BCO-TAQ-MRD-01",
    nombre: "Taquilla 24h Miranda",
    nivel: "Oficinas",
    subtipo: "Taquilla",
    padreId: "demo-6",
    activo: true,
    metadata: {},
    createdAt: "2026-02-05",
    updatedAt: "2026-02-05",
  },
  {
    id: "demo-30",
    codigo: "BCO-CAJ-VLC-01",
    nombre: "Caja Principal Valencia",
    nivel: "Dispositivos",
    subtipo: "Caja",
    padreId: "demo-7",
    activo: true,
    metadata: { tipoDispositivoId: "tpd-2", marca: "NCR", modelo: "Caja Premium NCR", cantidad: 1 },
    createdAt: "2026-02-15",
    updatedAt: "2026-02-15",
  },
  {
    id: "demo-31",
    codigo: "BCO-CAJ-VLC-02",
    nombre: "Caja Preferencial Valencia",
    nivel: "Dispositivos",
    subtipo: "Caja",
    padreId: "demo-7",
    activo: true,
    metadata: { tipoDispositivoId: "tpd-2", marca: "Oki", modelo: "Caja Básica Oki", cantidad: 1 },
    createdAt: "2026-02-15",
    updatedAt: "2026-02-15",
  },
  {
    id: "demo-32",
    codigo: "BCO-TAQ-VLC-01",
    nombre: "Taquilla Centro Valencia",
    nivel: "Oficinas",
    subtipo: "Taquilla",
    padreId: "demo-7",
    activo: true,
    metadata: {},
    createdAt: "2026-02-15",
    updatedAt: "2026-02-15",
  },
  {
    id: "demo-33",
    codigo: "BCO-CAJ-MRQ-01",
    nombre: "Caja Principal Maracaibo",
    nivel: "Dispositivos",
    subtipo: "Caja",
    padreId: "demo-8",
    activo: true,
    metadata: { tipoDispositivoId: "tpd-2", marca: "Epson", modelo: "Caja Estándar Epson", cantidad: 1 },
    createdAt: "2026-03-05",
    updatedAt: "2026-03-05",
  },
  {
    id: "demo-34",
    codigo: "BCO-TAQ-MRQ-01",
    nombre: "Taquilla Automática Maracaibo",
    nivel: "Oficinas",
    subtipo: "Taquilla",
    padreId: "demo-8",
    activo: true,
    metadata: {},
    createdAt: "2026-03-05",
    updatedAt: "2026-03-05",
  },
  /* Agencias Occidente */
  {
    id: "demo-36", codigo: "BCO-AGE-MER", nombre: "Agencia Mérida",
    nivel: "Oficinas", subtipo: "Agencia", padreId: "demo-central-2",
    activo: true, metadata: { coordenadas: { lat: 8.5833, lng: -71.1333 } },
    createdAt: "2026-03-01", updatedAt: "2026-03-01",
  },
  {
    id: "demo-37", codigo: "BCO-AGE-APU", nombre: "Agencia Apure",
    nivel: "Oficinas", subtipo: "Agencia", padreId: "demo-central-2",
    activo: true, metadata: { coordenadas: { lat: 7.8833, lng: -67.4667 } },
    createdAt: "2026-03-01", updatedAt: "2026-03-01",
  },
  /* Agencias Oriente */
  {
    id: "demo-38", codigo: "BCO-AGE-NES", nombre: "Agencia Nueva Esparta",
    nivel: "Oficinas", subtipo: "Agencia", padreId: "demo-central-3",
    activo: true, metadata: { coordenadas: { lat: 10.9667, lng: -63.8667 } },
    createdAt: "2026-03-01", updatedAt: "2026-03-01",
  },
  {
    id: "demo-39", codigo: "BCO-AGE-MON", nombre: "Agencia Monagas",
    nivel: "Oficinas", subtipo: "Agencia", padreId: "demo-central-3",
    activo: true, metadata: { coordenadas: { lat: 9.7333, lng: -63.1833 } },
    createdAt: "2026-03-01", updatedAt: "2026-03-01",
  },
  {
    id: "demo-40", codigo: "BCO-AGE-BOL", nombre: "Agencia Bolívar",
    nivel: "Oficinas", subtipo: "Agencia", padreId: "demo-central-3",
    activo: true, metadata: { coordenadas: { lat: 8.1167, lng: -63.5500 } },
    createdAt: "2026-03-01", updatedAt: "2026-03-01",
  },
  /* Cajas nuevas */
  { id: "demo-41", codigo: "BCO-CAJ-MRQ2-01", nombre: "Caja Principal Maracaibo Occ", nivel: "Dispositivos", subtipo: "Caja", padreId: "demo-8", activo: true, metadata: { tipoDispositivoId: "tpd-2", marca: "NCR", modelo: "Caja Premium NCR", cantidad: 1 }, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-42", codigo: "BCO-CAJ-MER-01", nombre: "Caja Principal Mérida", nivel: "Dispositivos", subtipo: "Caja", padreId: "demo-36", activo: true, metadata: { tipoDispositivoId: "tpd-2", marca: "Oki", modelo: "Caja Básica Oki", cantidad: 1 }, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-43", codigo: "BCO-CAJ-APU-01", nombre: "Caja Principal Apure", nivel: "Dispositivos", subtipo: "Caja", padreId: "demo-37", activo: true, metadata: { tipoDispositivoId: "tpd-2", marca: "Epson", modelo: "Caja Estándar Epson", cantidad: 1 }, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-44", codigo: "BCO-CAJ-NES-01", nombre: "Caja Principal Nueva Esparta", nivel: "Dispositivos", subtipo: "Caja", padreId: "demo-38", activo: true, metadata: { tipoDispositivoId: "tpd-2", marca: "NCR", modelo: "Caja Premium NCR", cantidad: 1 }, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-45", codigo: "BCO-CAJ-MON-01", nombre: "Caja Principal Monagas", nivel: "Dispositivos", subtipo: "Caja", padreId: "demo-39", activo: true, metadata: { tipoDispositivoId: "tpd-2", marca: "Oki", modelo: "Caja Básica Oki", cantidad: 1 }, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-46", codigo: "BCO-CAJ-BOL-01", nombre: "Caja Principal Bolívar", nivel: "Dispositivos", subtipo: "Caja", padreId: "demo-40", activo: true, metadata: { tipoDispositivoId: "tpd-2", marca: "Epson", modelo: "Caja Estándar Epson", cantidad: 1 }, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  /* ATMs nuevos */
  { id: "demo-47", codigo: "BCO-ATM-MRQ02", nombre: "ATM Maracaibo Centro", nivel: "Dispositivos", subtipo: "ATM", padreId: "demo-8", activo: true, metadata: { tipoDispositivoId: "tpd-1a", marca: "NCR", modelo: "NCR 5587", cantidad: 1 }, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-48", codigo: "BCO-ATM-MER01", nombre: "ATM Mérida Centro", nivel: "Dispositivos", subtipo: "ATM", padreId: "demo-36", activo: true, metadata: { tipoDispositivoId: "tpd-1b", marca: "Diebold Nixdorf", modelo: "Diebold 560", cantidad: 1 }, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-49", codigo: "BCO-ATM-APU01", nombre: "ATM Apure Centro", nivel: "Dispositivos", subtipo: "ATM", padreId: "demo-37", activo: true, metadata: { tipoDispositivoId: "tpd-1b", marca: "NCR", modelo: "NCR SelfServ 22", cantidad: 1 }, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-50", codigo: "BCO-ATM-NES01", nombre: "ATM Nueva Esparta", nivel: "Dispositivos", subtipo: "ATM", padreId: "demo-38", activo: true, metadata: { tipoDispositivoId: "tpd-1a", marca: "NCR", modelo: "NCR 5587", cantidad: 1 }, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-51", codigo: "BCO-ATM-MON01", nombre: "ATM Monagas Centro", nivel: "Dispositivos", subtipo: "ATM", padreId: "demo-39", activo: true, metadata: { tipoDispositivoId: "tpd-1d", marca: "Hyosung", modelo: "Hyosung MX 5300", cantidad: 1 }, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-52", codigo: "BCO-ATM-BOL01", nombre: "ATM Bolívar Centro", nivel: "Dispositivos", subtipo: "ATM", padreId: "demo-40", activo: true, metadata: { tipoDispositivoId: "tpd-1a", marca: "Diebold Nixdorf", modelo: "Diebold 460", cantidad: 1 }, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  /* Bóvedas nuevas */
  { id: "demo-53", codigo: "BCO-BOV-MRQ2-01", nombre: "Bóveda Principal Maracaibo Occ", nivel: "Depósitos", subtipo: "Bóveda", padreId: "demo-8", activo: true, saldo: 500000, metadata: { coordenadas: { lat: 10.6316, lng: -71.6405 } }, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-54", codigo: "BCO-BOV-MER-01", nombre: "Bóveda Principal Mérida", nivel: "Depósitos", subtipo: "Bóveda", padreId: "demo-36", activo: true, saldo: 350000, metadata: { coordenadas: { lat: 8.5833, lng: -71.1333 } }, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-55", codigo: "BCO-BOV-APU-01", nombre: "Bóveda Principal Apure", nivel: "Depósitos", subtipo: "Bóveda", padreId: "demo-37", activo: true, saldo: 200000, metadata: { coordenadas: { lat: 7.8833, lng: -67.4667 } }, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-56", codigo: "BCO-BOV-NES-01", nombre: "Bóveda Principal Nueva Esparta", nivel: "Depósitos", subtipo: "Bóveda", padreId: "demo-38", activo: true, saldo: 300000, metadata: { coordenadas: { lat: 10.9667, lng: -63.8667 } }, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-57", codigo: "BCO-BOV-MON-01", nombre: "Bóveda Principal Monagas", nivel: "Depósitos", subtipo: "Bóveda", padreId: "demo-39", activo: true, saldo: 250000, metadata: { coordenadas: { lat: 9.7333, lng: -63.1833 } }, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-58", codigo: "BCO-BOV-BOL-01", nombre: "Bóveda Principal Bolívar", nivel: "Depósitos", subtipo: "Bóveda", padreId: "demo-40", activo: true, saldo: 400000, metadata: { coordenadas: { lat: 8.1167, lng: -63.5500 } }, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  /* Anaqueles */
  { id: "demo-59", codigo: "ANQ-MRQ2-001", nombre: "Anaquel Efectivo USD Maracaibo", nivel: "Anaqueles", subtipo: "Anaquel", padreId: "demo-53", activo: true, saldo: 25000, metadata: {}, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-60", codigo: "ANQ-MRQ2-002", nombre: "Anaquel Efectivo VES Maracaibo", nivel: "Anaqueles", subtipo: "Anaquel", padreId: "demo-53", activo: true, saldo: 450000, metadata: {}, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-61", codigo: "ANQ-MER-001", nombre: "Anaquel Efectivo USD Mérida", nivel: "Anaqueles", subtipo: "Anaquel", padreId: "demo-54", activo: true, saldo: 15000, metadata: {}, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-62", codigo: "ANQ-MER-002", nombre: "Anaquel Efectivo VES Mérida", nivel: "Anaqueles", subtipo: "Anaquel", padreId: "demo-54", activo: true, saldo: 300000, metadata: {}, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-63", codigo: "ANQ-APU-001", nombre: "Anaquel Efectivo USD Apure", nivel: "Anaqueles", subtipo: "Anaquel", padreId: "demo-55", activo: true, saldo: 10000, metadata: {}, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-64", codigo: "ANQ-APU-002", nombre: "Anaquel Efectivo VES Apure", nivel: "Anaqueles", subtipo: "Anaquel", padreId: "demo-55", activo: true, saldo: 180000, metadata: {}, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-65", codigo: "ANQ-NES-001", nombre: "Anaquel Efectivo USD Nueva Esparta", nivel: "Anaqueles", subtipo: "Anaquel", padreId: "demo-56", activo: true, saldo: 20000, metadata: {}, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-66", codigo: "ANQ-NES-002", nombre: "Anaquel Efectivo VES Nueva Esparta", nivel: "Anaqueles", subtipo: "Anaquel", padreId: "demo-56", activo: true, saldo: 280000, metadata: {}, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-67", codigo: "ANQ-MON-001", nombre: "Anaquel Efectivo USD Monagas", nivel: "Anaqueles", subtipo: "Anaquel", padreId: "demo-57", activo: true, saldo: 12000, metadata: {}, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-68", codigo: "ANQ-MON-002", nombre: "Anaquel Efectivo VES Monagas", nivel: "Anaqueles", subtipo: "Anaquel", padreId: "demo-57", activo: true, saldo: 220000, metadata: {}, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-69", codigo: "ANQ-BOL-001", nombre: "Anaquel Efectivo USD Bolívar", nivel: "Anaqueles", subtipo: "Anaquel", padreId: "demo-58", activo: true, saldo: 18000, metadata: {}, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
  { id: "demo-70", codigo: "ANQ-BOL-002", nombre: "Anaquel Efectivo VES Bolívar", nivel: "Anaqueles", subtipo: "Anaquel", padreId: "demo-58", activo: true, saldo: 360000, metadata: {}, createdAt: "2026-03-01", updatedAt: "2026-03-01" },
];

/* ── Generar hijos demo (cajetines, cofres) ── */
function buildDemoEntitiesWithChildren(): Entity[] {
  const children: Entity[] = [];

  for (const entity of DEFAULT_ENTITIES) {
    if (entity.nivel === "Dispositivos") {
      const marcaNombre = entity.metadata?.marca as string | undefined;
      const modeloNombre = entity.metadata?.modelo as string | undefined;
      if (!marcaNombre || !modeloNombre) continue;

      const dispStore = useDispositivosStore.getState();
      const marca = dispStore.marcas.find((m) => m.nombre === marcaNombre);
      const modelo = marca ? dispStore.modelos.find((m) => m.marcaId === marca.id && m.nombre === modeloNombre) : undefined;
      const config = modelo?.configuracion;
      if (!config) continue;

      const cajetines = Array.isArray(config)
        ? config as Array<{ nombre: string; capacidad: number; moneda: string; denominacion: number }>
        : config && typeof config === "object" && "cajetines" in config
          ? (config as { cajetines: Array<{ nombre: string; capacidad: number; moneda: string; denominacion: number }> }).cajetines
          : undefined;

      if (cajetines && cajetines.length > 0) {
        cajetines.forEach((cj, i) => {
          children.push({
            id: makeId(),
            codigo: `${entity.codigo}-CAJ${i + 1}`,
            nombre: cj.nombre || `Cajetín ${i + 1}`,
            nivel: "Depósitos",
            subtipo: "Cajetín",
            padreId: entity.id,
            activo: true,
            metadata: { capacidad: cj.capacidad, moneda: cj.moneda, denominacion: cj.denominacion },
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
          });
        });
      }

      const depositoMod = config && typeof config === "object" && "deposito" in config
        ? (config as { deposito: { capacidad: number; aceptaSobres: boolean } }).deposito
        : undefined;

      if (depositoMod && depositoMod.capacidad > 0) {
        children.push({
          id: makeId(),
          codigo: `${entity.codigo}-DEP`,
          nombre: `Módulo de Depósito`,
          nivel: "Depósitos",
          subtipo: "Módulo Depósito",
          padreId: entity.id,
          activo: true,
          metadata: { capacidad: depositoMod.capacidad, aceptaSobres: depositoMod.aceptaSobres },
          createdAt: entity.createdAt,
          updatedAt: entity.updatedAt,
        });
      }

      const cofre = config && typeof config === "object" && "capacidad" in config && !("cajetines" in config) && !("deposito" in config)
        ? config as { capacidad?: number }
        : undefined;

      if (cofre && cofre.capacidad && cofre.capacidad > 0) {
        children.push({
          id: makeId(),
          codigo: `${entity.codigo}-COFRE`,
          nombre: `Cofre de ${entity.nombre}`,
          nivel: "Depósitos",
          subtipo: "Cofre",
          padreId: entity.id,
          activo: true,
          metadata: { capacidad: cofre.capacidad },
          createdAt: entity.createdAt,
          updatedAt: entity.updatedAt,
        });
      }
    }
  }

  return [...DEFAULT_ENTITIES, ...children];
}

export const useEntitiesStore = create<EntitiesState>((set, get) => ({
  entities: buildDemoEntitiesWithChildren(),
  selectedId: null,
  expandedIds: new Set<string>(),

  addEntity: (data) => {
    const now = new Date().toISOString();
    const id = makeId();
    const entity: Entity = { ...data, id, metadata: data.metadata ?? {}, createdAt: now, updatedAt: now };
    set((s) => {
      const children: Entity[] = [];
      const entitiesToAdd: Entity[] = [entity];

      /* ── Múltiples ATMs ── */
      const cantidad = (data.metadata?.cantidad as number) ?? 1;
      if (data.nivel === "Dispositivos" && data.subtipo === "ATM" && cantidad > 1) {
        const base = entitiesToAdd[0];
        entitiesToAdd.length = 0;
        for (let i = 0; i < cantidad; i++) {
          const newId = makeId();
          entitiesToAdd.push({
            ...base,
            id: newId,
            codigo: i === 0 ? base.codigo : `${base.codigo}-${i + 1}`,
            nombre: i === 0 ? base.nombre : `${base.nombre} #${i + 1}`,
            metadata: { ...base.metadata, cantidad: 1 },
          });
        }
      }

      /* ── Auto-crear hijos del modelo ── */
      if (data.nivel === "Dispositivos") {
        const dispStore = useDispositivosStore.getState();
        const marcaNombre = data.metadata?.marca as string | undefined;
        const modeloNombre = data.metadata?.modelo as string | undefined;

        if (marcaNombre && modeloNombre) {
          const marca = dispStore.marcas.find((m) => m.nombre === marcaNombre);
          const modelo = marca ? dispStore.modelos.find((m) => m.marcaId === marca.id && m.nombre === modeloNombre) : undefined;
          const config = modelo?.configuracion;

          /* ── Cajetines (ATM de Retiro, Multimoneda, Remoto, Multifuncional) ── */
          const cajetines = Array.isArray(config)
            ? config as Array<{ nombre: string; capacidad: number; moneda: string; denominacion: number }>
            : config && typeof config === "object" && "cajetines" in config
              ? (config as { cajetines: Array<{ nombre: string; capacidad: number; moneda: string; denominacion: number }> }).cajetines
              : undefined;

          if (cajetines && cajetines.length > 0) {
            entitiesToAdd.forEach((e) => {
              cajetines!.forEach((cj, i) => {
                children.push({
                  id: makeId(),
                  codigo: `${e.codigo}-CAJ${i + 1}`,
                  nombre: cj.nombre || `Cajetín ${i + 1}`,
                  nivel: "Depósitos",
                  subtipo: "Cajetín",
                  padreId: e.id,
                  activo: true,
                  metadata: { capacidad: cj.capacidad, moneda: cj.moneda, denominacion: cj.denominacion },
                  createdAt: now,
                  updatedAt: now,
                });
              });
            });
          }

          /* ── Módulo de Depósito (ATM Multifuncional / Depósito) ── */
          const depositoMod = config && typeof config === "object" && "deposito" in config
            ? (config as { deposito: { capacidad: number; aceptaSobres: boolean } }).deposito
            : undefined;

          if (depositoMod && depositoMod.capacidad > 0) {
            entitiesToAdd.forEach((e) => {
              children.push({
                id: makeId(),
                codigo: `${e.codigo}-DEP`,
                nombre: `Módulo de Depósito`,
                nivel: "Depósitos",
                subtipo: "Módulo Depósito",
                padreId: e.id,
                activo: true,
                metadata: { capacidad: depositoMod.capacidad, aceptaSobres: depositoMod.aceptaSobres },
                createdAt: now,
                updatedAt: now,
              });
            });
          }

          /* ── Cofre (Caja) ── */
          const cofre = config && typeof config === "object" && "capacidad" in config && !("cajetines" in config) && !("deposito" in config)
            ? config as { capacidad?: number }
            : undefined;

          if (cofre && cofre.capacidad && cofre.capacidad > 0) {
            entitiesToAdd.forEach((e) => {
              children.push({
                id: makeId(),
                codigo: `${e.codigo}-COFRE`,
                nombre: `Cofre de ${e.nombre}`,
                nivel: "Depósitos",
                subtipo: "Cofre",
                padreId: e.id,
                activo: true,
                metadata: { capacidad: cofre.capacidad },
                createdAt: now,
                updatedAt: now,
              });
            });
          }
        }

        /* Fallback: auto-crear cofre si es Caja sin modelo */
        if (data.subtipo === "Caja" && (!marcaNombre || !modeloNombre)) {
          entitiesToAdd.forEach((e) => {
            children.push({
              id: makeId(), codigo: `${e.codigo}-COFRE`, nombre: `Cofre de ${e.nombre}`,
              nivel: "Depósitos", subtipo: "Cofre", padreId: e.id,
              activo: true, metadata: { capacidad: 0 }, createdAt: now, updatedAt: now,
            });
          });
        }

        /* ── Contadora para Caja ── */
        const incluyeContadora = data.metadata?.incluyeContadora as boolean | undefined;
        const modeloContadoraId = data.metadata?.modeloContadoraId as string | undefined;
        const marcaContadoraId = data.metadata?.marcaContadoraId as string | undefined;

        if (incluyeContadora && modeloContadoraId && marcaContadoraId) {
          const modeloCont = dispStore.getModeloById(modeloContadoraId);
          const marcaCont = dispStore.marcas.find(m => m.id === marcaContadoraId);
          const tipoCont = modeloCont ? dispStore.tiposDispositivo.find(t => t.id === modeloCont.tipoDispositivoId) : undefined;
          entitiesToAdd.forEach((e) => {
            children.push({
              id: makeId(),
              codigo: `${e.codigo}-CONT`,
              nombre: `Contadora de ${e.nombre}`,
              nivel: "Dispositivos",
              subtipo: "Máquina Contadora de Billetes",
              padreId: e.id,
              activo: true,
              metadata: {
                tipoDispositivoId: modeloCont?.tipoDispositivoId ?? "",
                marca: marcaCont?.nombre ?? "",
                modelo: modeloCont?.nombre ?? "",
              },
              createdAt: now,
              updatedAt: now,
            });
          });
        }

      }

      /* ── Contadoras para Bóveda (cuando el form es nivel Depósitos) ── */
      if (data.nivel === "Depósitos" && data.subtipo === "Bóveda") {
        const contadorasBoveda = data.metadata?.contadorasBoveda as Array<{ tipoId: string; marcaId: string; modeloId: string }> | undefined;
        if (contadorasBoveda && contadorasBoveda.length > 0) {
          const dispStore = useDispositivosStore.getState();
          contadorasBoveda.forEach((ct, i) => {
            const modeloCont = ct.modeloId ? dispStore.getModeloById(ct.modeloId) : undefined;
            const marcaCont = ct.marcaId ? dispStore.marcas.find(m => m.id === ct.marcaId) : undefined;
            entitiesToAdd.forEach((e) => {
              children.push({
                id: makeId(),
                codigo: `${e.codigo}-CONT${i + 1}`,
                nombre: `Contadora ${i + 1}`,
                nivel: "Dispositivos",
                subtipo: "Máquina Contadora de Billetes",
                padreId: e.id,
                activo: true,
                metadata: {
                  tipoDispositivoId: ct.tipoId,
                  marca: marcaCont?.nombre ?? "",
                  modelo: modeloCont?.nombre ?? "",
                },
                createdAt: now,
                updatedAt: now,
              });
            });
          });
        }
      }

      return { entities: [...s.entities, ...entitiesToAdd, ...children] };
    });
  },

  updateEntity: (id, data) => {
    set((s) => ({
      entities: s.entities.map((e) =>
        e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e
      ),
    }));
  },

  removeEntity: (id) => {
    const { entities } = get();
    const idsToRemove = new Set<string>();
    const collect = (parentId: string) => {
      idsToRemove.add(parentId);
      entities.filter((e) => e.padreId === parentId).forEach((e) => collect(e.id));
    };
    collect(id);
    set((s) => ({
      entities: s.entities.filter((e) => !idsToRemove.has(e.id)),
      selectedId: s.selectedId && idsToRemove.has(s.selectedId) ? null : s.selectedId,
    }));
  },

  selectEntity: (id) => set({ selectedId: id }),

  toggleExpand: (id) => {
    set((s) => {
      const next = new Set(s.expandedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { expandedIds: next };
    });
  },

  getChildren: (padreId) => get().entities.filter((e) => e.padreId === padreId),

  getAncestors: (id) => {
    const { entities } = get();
    const result: Entity[] = [];
    let current = entities.find((e) => e.id === id);
    while (current?.padreId) {
      const parent = entities.find((e) => e.id === current!.padreId);
      if (parent) result.unshift(parent);
      current = parent;
    }
    return result;
  },
}));
