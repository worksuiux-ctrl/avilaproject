import { create } from "zustand";

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
    nombre: "Central Administrativa Occidente",
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
    nombre: "Central Administrativa Capital",
    nivel: "Central Administrativa",
    subtipo: "Regional",
    padreId: null,
    activo: true,
    metadata: {
      codigoCentral: "CEN-CCS",
      region: "Capital",
      direccionCentral: "Av. Libertador, Edif. COE, Piso 3",
      monedaBase: "VES",
      estadoCentral: "Activo",
      coordenadas: { lat: 10.4806, lng: -66.9036 },
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
    nivel: "Sub Entidades",
    subtipo: "ATM",
    padreId: "demo-1",
    activo: true,
    metadata: { coordenadas: { lat: 10.4850, lng: -66.9000 } },
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
    padreId: "demo-1",
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
    padreId: "demo-1",
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
    padreId: "demo-1",
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
    padreId: "demo-1",
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
    nivel: "Sub Entidades",
    subtipo: "ATM",
    padreId: "demo-5",
    activo: true,
    metadata: { coordenadas: { lat: 10.4950, lng: -66.8980 } },
    createdAt: "2026-01-20",
    updatedAt: "2026-01-20",
  },
  {
    id: "demo-10",
    codigo: "BCO-ATM-CCS02",
    nombre: "ATM Plaza Venezuela",
    nivel: "Sub Entidades",
    subtipo: "ATM",
    padreId: "demo-5",
    activo: true,
    metadata: { coordenadas: { lat: 10.4960, lng: -66.9020 } },
    createdAt: "2026-01-20",
    updatedAt: "2026-01-20",
  },
  {
    id: "demo-11",
    codigo: "BCO-ATM-MRD01",
    nombre: "ATM Centro Lider",
    nivel: "Sub Entidades",
    subtipo: "ATM",
    padreId: "demo-6",
    activo: true,
    metadata: { coordenadas: { lat: 10.2550, lng: -66.4480 } },
    createdAt: "2026-02-05",
    updatedAt: "2026-02-05",
  },
  {
    id: "demo-12",
    codigo: "BCO-ATM-VLC01",
    nombre: "ATM Sambil Valencia",
    nivel: "Sub Entidades",
    subtipo: "ATM",
    padreId: "demo-7",
    activo: true,
    metadata: { coordenadas: { lat: 10.1680, lng: -67.9990 } },
    createdAt: "2026-02-15",
    updatedAt: "2026-02-15",
  },
  {
    id: "demo-13",
    codigo: "BCO-ATM-MRQ01",
    nombre: "ATM Galerias Mall",
    nivel: "Sub Entidades",
    subtipo: "ATM",
    padreId: "demo-8",
    activo: true,
    metadata: { coordenadas: { lat: 10.6330, lng: -71.6380 } },
    createdAt: "2026-03-05",
    updatedAt: "2026-03-05",
  },
  {
    id: "demo-14",
    codigo: "BCO-ATM-CCS03",
    nombre: "ATM Torre Britanica",
    nivel: "Sub Entidades",
    subtipo: "ATM",
    padreId: "demo-5",
    activo: true,
    metadata: { coordenadas: { lat: 10.4980, lng: -66.9080 } },
    createdAt: "2026-04-01",
    updatedAt: "2026-04-01",
  },
  /* Cajas y Taquillas por agencia */
  {
    id: "demo-23",
    codigo: "BCO-CAJ-SEDE-01",
    nombre: "Caja Principal Sede",
    nivel: "Sub Entidades",
    subtipo: "Caja",
    padreId: "demo-1",
    activo: true,
    metadata: {},
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "demo-24",
    codigo: "BCO-CAJ-SEDE-02",
    nombre: "Caja VIP Sede",
    nivel: "Sub Entidades",
    subtipo: "Caja",
    padreId: "demo-1",
    activo: true,
    metadata: {},
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "demo-25",
    codigo: "BCO-CAJ-CCS-01",
    nombre: "Caja Principal CCS Centro",
    nivel: "Sub Entidades",
    subtipo: "Caja",
    padreId: "demo-5",
    activo: true,
    metadata: {},
    createdAt: "2026-01-20",
    updatedAt: "2026-01-20",
  },
  {
    id: "demo-26",
    codigo: "BCO-CAJ-CCS-02",
    nombre: "Caja Express CCS Centro",
    nivel: "Sub Entidades",
    subtipo: "Caja",
    padreId: "demo-5",
    activo: true,
    metadata: {},
    createdAt: "2026-01-20",
    updatedAt: "2026-01-20",
  },
  {
    id: "demo-27",
    codigo: "BCO-TAQ-CCS-01",
    nombre: "Taquilla Nocturna CCS",
    nivel: "Sub Entidades",
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
    nivel: "Sub Entidades",
    subtipo: "Caja",
    padreId: "demo-6",
    activo: true,
    metadata: {},
    createdAt: "2026-02-05",
    updatedAt: "2026-02-05",
  },
  {
    id: "demo-29",
    codigo: "BCO-TAQ-MRD-01",
    nombre: "Taquilla 24h Miranda",
    nivel: "Sub Entidades",
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
    nivel: "Sub Entidades",
    subtipo: "Caja",
    padreId: "demo-7",
    activo: true,
    metadata: {},
    createdAt: "2026-02-15",
    updatedAt: "2026-02-15",
  },
  {
    id: "demo-31",
    codigo: "BCO-CAJ-VLC-02",
    nombre: "Caja Preferencial Valencia",
    nivel: "Sub Entidades",
    subtipo: "Caja",
    padreId: "demo-7",
    activo: true,
    metadata: {},
    createdAt: "2026-02-15",
    updatedAt: "2026-02-15",
  },
  {
    id: "demo-32",
    codigo: "BCO-TAQ-VLC-01",
    nombre: "Taquilla Centro Valencia",
    nivel: "Sub Entidades",
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
    nivel: "Sub Entidades",
    subtipo: "Caja",
    padreId: "demo-8",
    activo: true,
    metadata: {},
    createdAt: "2026-03-05",
    updatedAt: "2026-03-05",
  },
  {
    id: "demo-34",
    codigo: "BCO-TAQ-MRQ-01",
    nombre: "Taquilla Automática Maracaibo",
    nivel: "Sub Entidades",
    subtipo: "Taquilla",
    padreId: "demo-8",
    activo: true,
    metadata: {},
    createdAt: "2026-03-05",
    updatedAt: "2026-03-05",
  },
];

export const useEntitiesStore = create<EntitiesState>((set, get) => ({
  entities: DEFAULT_ENTITIES,
  selectedId: null,
  expandedIds: new Set<string>(),

  addEntity: (data) => {
    const now = new Date().toISOString();
    const entity: Entity = { ...data, id: makeId(), metadata: data.metadata ?? {}, createdAt: now, updatedAt: now };
    set((s) => ({ entities: [...s.entities, entity] }));
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
