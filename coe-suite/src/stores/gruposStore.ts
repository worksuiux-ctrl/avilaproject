import { create } from "zustand";

export interface GrupoMiembro {
  entityId: string;
  entityNombre: string;
  entityCodigo: string;
  entityNivel: string;
  entitySubtipo: string;
  source: "unidades" | "clientes" | "proveedores";
}

export interface Grupo {
  id: string;
  codigo: string;
  nombre: string;
  tipo: "Geográfico" | "Contable";
  subtipo: string;
  padreId: string | null;
  activo: boolean;
  miembros: GrupoMiembro[];
  coordenadas?: { lat: string; lng: string };
  createdAt: string;
  updatedAt: string;
}

interface GruposState {
  grupos: Grupo[];
  selectedId: string | null;
  expandedIds: Set<string>;
  addGrupo: (g: Omit<Grupo, "id" | "miembros" | "createdAt" | "updatedAt">) => void;
  updateGrupo: (id: string, d: Partial<Grupo>) => void;
  removeGrupo: (id: string) => void;
  selectGrupo: (id: string | null) => void;
  toggleExpand: (id: string) => void;
  addMiembro: (grupoId: string, m: GrupoMiembro) => void;
  removeMiembro: (grupoId: string, entityId: string) => void;
  getChildren: (padreId: string | null) => Grupo[];
  getAncestors: (id: string) => Grupo[];
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

const GRUPOS_DEMO: Grupo[] = [
  /* ── Raíces ── */
  {
    id: "grp-1",
    codigo: "GEO-AMERICA",
    nombre: "Continente América",
    tipo: "Geográfico",
    subtipo: "Continente",
    padreId: null,
    activo: true,
    miembros: [],
    coordenadas: { lat: "8.7832", lng: "-55.4915" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-2",
    codigo: "GEO-CAPITAL",
    nombre: "Región Capital",
    tipo: "Geográfico",
    subtipo: "Zona",
    padreId: null,
    activo: true,
    miembros: [],
    coordenadas: { lat: "10.4806", lng: "-66.9036" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-3",
    codigo: "GEO-OCCIDENTE",
    nombre: "Zona Centro Occidente",
    tipo: "Geográfico",
    subtipo: "Zona",
    padreId: null,
    activo: true,
    miembros: [],
    coordenadas: { lat: "10.1667", lng: "-68.0000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-4",
    codigo: "CON-CORP",
    nombre: "Grupo Corporativo",
    tipo: "Contable",
    subtipo: "Contable",
    padreId: null,
    activo: true,
    miembros: [
      { entityId: "demo-1", entityNombre: "Banco Mercantil Sede Principal", entityCodigo: "BCO-001", entityNivel: "Oficinas", entitySubtipo: "Sucursal", source: "unidades" },
      { entityId: "cli-5", entityNombre: "Banco del Pueblo", entityCodigo: "CLI-BAN-001", entityNivel: "Clientes", entitySubtipo: "Jurídico", source: "clientes" },
    ],
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-5",
    codigo: "CON-PREMIUM",
    nombre: "Clientes Preferenciales",
    tipo: "Contable",
    subtipo: "Contable",
    padreId: null,
    activo: true,
    miembros: [
      { entityId: "cli-1", entityNombre: "Farmatodo C.A.", entityCodigo: "CLI-FAR-001", entityNivel: "Clientes", entitySubtipo: "Jurídico", source: "clientes" },
      { entityId: "cli-2", entityNombre: "Supermercados Plaza's C.A.", entityCodigo: "CLI-SUP-001", entityNivel: "Clientes", entitySubtipo: "Jurídico", source: "clientes" },
    ],
    createdAt: "2026-02-01",
    updatedAt: "2026-02-01",
  },
  {
    id: "grp-6",
    codigo: "CON-PROV",
    nombre: "Proveedores Estratégicos",
    tipo: "Contable",
    subtipo: "Contable",
    padreId: null,
    activo: true,
    miembros: [
      { entityId: "prov-1", entityNombre: "Trasvalven C.A.", entityCodigo: "PROV-TV-001", entityNivel: "Proveedores", entitySubtipo: "Transportista de Valores", source: "proveedores" },
      { entityId: "prov-4", entityNombre: "Servicios de Seguridad Global C.A.", entityCodigo: "PROV-SV-001", entityNivel: "Proveedores", entitySubtipo: "Servicios", source: "proveedores" },
    ],
    createdAt: "2026-02-15",
    updatedAt: "2026-02-15",
  },
  /* ── Sub-grupos ── */
  {
    id: "grp-7",
    codigo: "GEO-CAP-CCS",
    nombre: "Distrito Capital",
    tipo: "Geográfico",
    subtipo: "Ciudad",
    padreId: "grp-2",
    activo: true,
    miembros: [
      { entityId: "demo-5", entityNombre: "Agencia Caracas Centro", entityCodigo: "BCO-AGE-CCS", entityNivel: "Oficinas", entitySubtipo: "Agencia", source: "unidades" },
      { entityId: "demo-9", entityNombre: "ATM Centro Comercial Sambil", entityCodigo: "BCO-ATM-CCS01", entityNivel: "Sub Entidades", entitySubtipo: "ATM", source: "unidades" },
      { entityId: "suc-1", entityNombre: "Farmatodo Sabana Grande", entityCodigo: "FAR-CCS-01", entityNivel: "Sucursales", entitySubtipo: "Farmacia", source: "clientes" },
    ],
    coordenadas: { lat: "10.5000", lng: "-66.9167" },
    createdAt: "2026-01-15",
    updatedAt: "2026-01-15",
  },
  {
    id: "grp-8",
    codigo: "GEO-CAP-MIR",
    nombre: "Estado Miranda",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-2",
    activo: true,
    miembros: [
      { entityId: "demo-6", entityNombre: "Agencia Miranda", entityCodigo: "BCO-AGE-MRD", entityNivel: "Oficinas", entitySubtipo: "Agencia", source: "unidades" },
    ],
    coordenadas: { lat: "10.2500", lng: "-66.4167" },
    createdAt: "2026-02-01",
    updatedAt: "2026-02-01",
  },
  {
    id: "grp-9",
    codigo: "GEO-OCC-VLC",
    nombre: "Valencia",
    tipo: "Geográfico",
    subtipo: "Ciudad",
    padreId: "grp-3",
    activo: true,
    miembros: [
      { entityId: "demo-7", entityNombre: "Agencia Valencia", entityCodigo: "BCO-AGE-VLC", entityNivel: "Oficinas", entitySubtipo: "Agencia", source: "unidades" },
      { entityId: "suc-3", entityNombre: "Farmatodo Valencia", entityCodigo: "FAR-VLC-01", entityNivel: "Sucursales", entitySubtipo: "Farmacia", source: "clientes" },
    ],
    coordenadas: { lat: "10.1667", lng: "-68.0000" },
    createdAt: "2026-02-10",
    updatedAt: "2026-02-10",
  },
  {
    id: "grp-10",
    codigo: "GEO-OCC-MRQ",
    nombre: "Maracaibo",
    tipo: "Geográfico",
    subtipo: "Ciudad",
    padreId: "grp-3",
    activo: true,
    miembros: [
      { entityId: "demo-8", entityNombre: "Agencia Maracaibo", entityCodigo: "BCO-AGE-MRQ", entityNivel: "Oficinas", entitySubtipo: "Agencia", source: "unidades" },
      { entityId: "demo-13", entityNombre: "ATM Galerias Mall", entityCodigo: "BCO-ATM-MRQ01", entityNivel: "Sub Entidades", entitySubtipo: "ATM", source: "unidades" },
    ],
    coordenadas: { lat: "10.5833", lng: "-71.6667" },
    createdAt: "2026-03-01",
    updatedAt: "2026-03-01",
  },
];

export const useGruposStore = create<GruposState>((set, get) => ({
  grupos: GRUPOS_DEMO,
  selectedId: null,
  expandedIds: new Set(GRUPOS_DEMO.map((g) => g.id)),

  addGrupo: (data) => {
    const now = new Date().toISOString();
    const grupo: Grupo = { ...data, id: makeId(), miembros: [], createdAt: now, updatedAt: now };
    set((s) => ({ grupos: [...s.grupos, grupo] }));
  },

  updateGrupo: (id, data) => {
    set((s) => ({
      grupos: s.grupos.map((g) =>
        g.id === id ? { ...g, ...data, updatedAt: new Date().toISOString() } : g
      ),
    }));
  },

  removeGrupo: (id) => {
    const idsToRemove = new Set<string>();
    const collect = (pid: string) => {
      idsToRemove.add(pid);
      get().grupos.filter((g) => g.padreId === pid).forEach((g) => collect(g.id));
    };
    collect(id);
    set((s) => ({
      grupos: s.grupos.filter((g) => !idsToRemove.has(g.id)),
      selectedId: s.selectedId && idsToRemove.has(s.selectedId) ? null : s.selectedId,
    }));
  },

  selectGrupo: (id) => set({ selectedId: id }),

  toggleExpand: (id) => {
    set((s) => {
      const next = new Set(s.expandedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { expandedIds: next };
    });
  },

  addMiembro: (grupoId, m) => {
    set((s) => ({
      grupos: s.grupos.map((g) =>
        g.id === grupoId
          ? { ...g, miembros: g.miembros.some((x) => x.entityId === m.entityId) ? g.miembros : [...g.miembros, m], updatedAt: new Date().toISOString() }
          : g
      ),
    }));
  },

  removeMiembro: (grupoId, entityId) => {
    set((s) => ({
      grupos: s.grupos.map((g) =>
        g.id === grupoId
          ? { ...g, miembros: g.miembros.filter((m) => m.entityId !== entityId), updatedAt: new Date().toISOString() }
          : g
      ),
    }));
  },

  getChildren: (padreId) => get().grupos.filter((g) => g.padreId === padreId),

  getAncestors: (id) => {
    const { grupos } = get();
    const result: Grupo[] = [];
    let current = grupos.find((g) => g.id === id);
    while (current?.padreId) {
      const parent = grupos.find((g) => g.id === current!.padreId);
      if (parent) result.unshift(parent);
      current = parent;
    }
    return result;
  },
}));
