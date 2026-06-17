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
  /* ═══════════════════════════════════════════
     GEOGRÁFICOS — Venezuela y sus regiones
     ═══════════════════════════════════════════ */
  /* ── País ── */
  {
    id: "grp-1",
    codigo: "GEO-VEN",
    nombre: "Venezuela",
    tipo: "Geográfico",
    subtipo: "País",
    padreId: null,
    activo: true,
    miembros: [],
    coordenadas: { lat: "7.5000", lng: "-67.0000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },

  /* ── Región Capital ── */
  {
    id: "grp-2",
    codigo: "GEO-CAPITAL",
    nombre: "Región Capital",
    tipo: "Geográfico",
    subtipo: "Zona",
    padreId: "grp-1",
    activo: true,
    miembros: [],
    coordenadas: { lat: "10.4500", lng: "-66.8000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-201",
    codigo: "GEO-CAP-DF",
    nombre: "Distrito Capital",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-2",
    activo: true,
    miembros: [],
    coordenadas: { lat: "10.5000", lng: "-66.9167" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-202",
    codigo: "GEO-CAP-MIR",
    nombre: "Miranda",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-2",
    activo: true,
    miembros: [],
    coordenadas: { lat: "10.2500", lng: "-66.4167" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-203",
    codigo: "GEO-CAP-LG",
    nombre: "La Guaira",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-2",
    activo: true,
    miembros: [],
    coordenadas: { lat: "10.6000", lng: "-66.8500" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-204",
    codigo: "GEO-CAP-CCS",
    nombre: "Caracas",
    tipo: "Geográfico",
    subtipo: "Ciudad",
    padreId: "grp-201",
    activo: true,
    miembros: [
      { entityId: "demo-5", entityNombre: "Agencia Caracas Centro", entityCodigo: "BCO-AGE-CCS", entityNivel: "Oficinas", entitySubtipo: "Agencia", source: "unidades" },
    ],
    coordenadas: { lat: "10.4806", lng: "-66.9036" },
    createdAt: "2026-01-15",
    updatedAt: "2026-01-15",
  },

  /* ── Región Central ── */
  {
    id: "grp-3",
    codigo: "GEO-CENTRAL",
    nombre: "Región Central",
    tipo: "Geográfico",
    subtipo: "Zona",
    padreId: "grp-1",
    activo: true,
    miembros: [],
    coordenadas: { lat: "10.1000", lng: "-67.6000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-301",
    codigo: "GEO-CTR-AR",
    nombre: "Aragua",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-3",
    activo: true,
    miembros: [],
    coordenadas: { lat: "10.2000", lng: "-67.3000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-302",
    codigo: "GEO-CTR-CB",
    nombre: "Carabobo",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-3",
    activo: true,
    miembros: [],
    coordenadas: { lat: "10.2000", lng: "-68.0000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-303",
    codigo: "GEO-CTR-CO",
    nombre: "Cojedes",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-3",
    activo: true,
    miembros: [],
    coordenadas: { lat: "9.6000", lng: "-68.9000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-304",
    codigo: "GEO-CTR-VLC",
    nombre: "Valencia",
    tipo: "Geográfico",
    subtipo: "Ciudad",
    padreId: "grp-302",
    activo: true,
    miembros: [
      { entityId: "demo-7", entityNombre: "Agencia Valencia", entityCodigo: "BCO-AGE-VLC", entityNivel: "Oficinas", entitySubtipo: "Agencia", source: "unidades" },
    ],
    coordenadas: { lat: "10.1667", lng: "-68.0000" },
    createdAt: "2026-02-10",
    updatedAt: "2026-02-10",
  },

  /* ── Región Centro Occidental ── */
  {
    id: "grp-4",
    codigo: "GEO-CENOCC",
    nombre: "Región Centro Occidental",
    tipo: "Geográfico",
    subtipo: "Zona",
    padreId: "grp-1",
    activo: true,
    miembros: [],
    coordenadas: { lat: "10.4000", lng: "-69.5000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-401",
    codigo: "GEO-CENOCC-FA",
    nombre: "Falcón",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-4",
    activo: true,
    miembros: [],
    coordenadas: { lat: "11.2000", lng: "-69.9000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-402",
    codigo: "GEO-CENOCC-LA",
    nombre: "Lara",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-4",
    activo: true,
    miembros: [],
    coordenadas: { lat: "10.1000", lng: "-69.6000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-403",
    codigo: "GEO-CENOCC-PO",
    nombre: "Portuguesa",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-4",
    activo: true,
    miembros: [],
    coordenadas: { lat: "9.1000", lng: "-69.0000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-404",
    codigo: "GEO-CENOCC-YA",
    nombre: "Yaracuy",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-4",
    activo: true,
    miembros: [],
    coordenadas: { lat: "10.1000", lng: "-68.7000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-405",
    codigo: "GEO-CENOCC-BQTO",
    nombre: "Barquisimeto",
    tipo: "Geográfico",
    subtipo: "Ciudad",
    padreId: "grp-402",
    activo: true,
    miembros: [],
    coordenadas: { lat: "10.0678", lng: "-69.3218" },
    createdAt: "2026-03-01",
    updatedAt: "2026-03-01",
  },

  /* ── Región Zuliana ── */
  {
    id: "grp-5",
    codigo: "GEO-ZULIANA",
    nombre: "Región Zuliana",
    tipo: "Geográfico",
    subtipo: "Zona",
    padreId: "grp-1",
    activo: true,
    miembros: [],
    coordenadas: { lat: "10.5000", lng: "-72.0000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-501",
    codigo: "GEO-ZUL-ZU",
    nombre: "Zulia",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-5",
    activo: true,
    miembros: [],
    coordenadas: { lat: "10.5000", lng: "-72.0000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-502",
    codigo: "GEO-ZUL-MRQ",
    nombre: "Maracaibo",
    tipo: "Geográfico",
    subtipo: "Ciudad",
    padreId: "grp-501",
    activo: true,
    miembros: [
      { entityId: "demo-8", entityNombre: "Agencia Maracaibo", entityCodigo: "BCO-AGE-MRQ", entityNivel: "Oficinas", entitySubtipo: "Agencia", source: "unidades" },
    ],
    coordenadas: { lat: "10.5833", lng: "-71.6667" },
    createdAt: "2026-03-01",
    updatedAt: "2026-03-01",
  },

  /* ── Región Los Andes ── */
  {
    id: "grp-6",
    codigo: "GEO-ANDES",
    nombre: "Región Los Andes",
    tipo: "Geográfico",
    subtipo: "Zona",
    padreId: "grp-1",
    activo: true,
    miembros: [],
    coordenadas: { lat: "8.6000", lng: "-70.5000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-601",
    codigo: "GEO-AND-BA",
    nombre: "Barinas",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-6",
    activo: true,
    miembros: [],
    coordenadas: { lat: "8.6000", lng: "-70.2000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-602",
    codigo: "GEO-AND-ME",
    nombre: "Mérida",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-6",
    activo: true,
    miembros: [],
    coordenadas: { lat: "8.5000", lng: "-71.2000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-603",
    codigo: "GEO-AND-TA",
    nombre: "Táchira",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-6",
    activo: true,
    miembros: [],
    coordenadas: { lat: "7.8000", lng: "-72.0000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-604",
    codigo: "GEO-AND-TR",
    nombre: "Trujillo",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-6",
    activo: true,
    miembros: [],
    coordenadas: { lat: "9.4000", lng: "-70.4000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-605",
    codigo: "GEO-AND-MER-C",
    nombre: "Mérida (ciudad)",
    tipo: "Geográfico",
    subtipo: "Ciudad",
    padreId: "grp-602",
    activo: true,
    miembros: [],
    coordenadas: { lat: "8.5833", lng: "-71.1333" },
    createdAt: "2026-03-01",
    updatedAt: "2026-03-01",
  },
  {
    id: "grp-606",
    codigo: "GEO-AND-SC",
    nombre: "San Cristóbal",
    tipo: "Geográfico",
    subtipo: "Ciudad",
    padreId: "grp-603",
    activo: true,
    miembros: [],
    coordenadas: { lat: "7.7667", lng: "-72.2167" },
    createdAt: "2026-03-01",
    updatedAt: "2026-03-01",
  },

  /* ── Región Llanos ── */
  {
    id: "grp-7",
    codigo: "GEO-LLANOS",
    nombre: "Región Llanos",
    tipo: "Geográfico",
    subtipo: "Zona",
    padreId: "grp-1",
    activo: true,
    miembros: [],
    coordenadas: { lat: "8.1000", lng: "-68.4000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-701",
    codigo: "GEO-LL-AP",
    nombre: "Apure",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-7",
    activo: true,
    miembros: [],
    coordenadas: { lat: "7.1000", lng: "-69.4000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-702",
    codigo: "GEO-LL-GU",
    nombre: "Guárico",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-7",
    activo: true,
    miembros: [],
    coordenadas: { lat: "9.0000", lng: "-67.4000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },

  /* ── Región Nor-Oriental ── */
  {
    id: "grp-8",
    codigo: "GEO-ORIENTE",
    nombre: "Región Nor-Oriental",
    tipo: "Geográfico",
    subtipo: "Zona",
    padreId: "grp-1",
    activo: true,
    miembros: [],
    coordenadas: { lat: "9.5000", lng: "-63.7000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-801",
    codigo: "GEO-ORI-AN",
    nombre: "Anzoátegui",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-8",
    activo: true,
    miembros: [],
    coordenadas: { lat: "8.5000", lng: "-64.5000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-802",
    codigo: "GEO-ORI-MO",
    nombre: "Monagas",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-8",
    activo: true,
    miembros: [],
    coordenadas: { lat: "9.4000", lng: "-63.1000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-803",
    codigo: "GEO-ORI-SU",
    nombre: "Sucre",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-8",
    activo: true,
    miembros: [],
    coordenadas: { lat: "10.4000", lng: "-63.1000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-804",
    codigo: "GEO-ORI-NE",
    nombre: "Nueva Esparta",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-8",
    activo: true,
    miembros: [],
    coordenadas: { lat: "11.0000", lng: "-64.0000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-805",
    codigo: "GEO-ORI-BARC",
    nombre: "Barcelona",
    tipo: "Geográfico",
    subtipo: "Ciudad",
    padreId: "grp-801",
    activo: true,
    miembros: [],
    coordenadas: { lat: "10.1333", lng: "-64.6833" },
    createdAt: "2026-03-01",
    updatedAt: "2026-03-01",
  },

  /* ── Región Guayana ── */
  {
    id: "grp-9",
    codigo: "GEO-GUAYANA",
    nombre: "Región Guayana",
    tipo: "Geográfico",
    subtipo: "Zona",
    padreId: "grp-1",
    activo: true,
    miembros: [],
    coordenadas: { lat: "6.5000", lng: "-64.0000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-901",
    codigo: "GEO-GUY-BO",
    nombre: "Bolívar",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-9",
    activo: true,
    miembros: [],
    coordenadas: { lat: "7.1000", lng: "-64.5000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-902",
    codigo: "GEO-GUY-AM",
    nombre: "Amazonas",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-9",
    activo: true,
    miembros: [],
    coordenadas: { lat: "3.5000", lng: "-66.0000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-903",
    codigo: "GEO-GUY-DA",
    nombre: "Delta Amacuro",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-9",
    activo: true,
    miembros: [],
    coordenadas: { lat: "9.0000", lng: "-61.5000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-904",
    codigo: "GEO-GUY-CG",
    nombre: "Ciudad Guayana",
    tipo: "Geográfico",
    subtipo: "Ciudad",
    padreId: "grp-901",
    activo: true,
    miembros: [],
    coordenadas: { lat: "8.3500", lng: "-62.6500" },
    createdAt: "2026-03-01",
    updatedAt: "2026-03-01",
  },

  /* ── Dependencias Federales ── */
  {
    id: "grp-10",
    codigo: "GEO-INSULAR",
    nombre: "Dependencias Federales",
    tipo: "Geográfico",
    subtipo: "Zona",
    padreId: "grp-1",
    activo: true,
    miembros: [],
    coordenadas: { lat: "11.5000", lng: "-66.0000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "grp-1001",
    codigo: "GEO-INS-DF",
    nombre: "Dependencias Federales",
    tipo: "Geográfico",
    subtipo: "Estado/Provincia",
    padreId: "grp-10",
    activo: true,
    miembros: [],
    coordenadas: { lat: "11.5000", lng: "-66.0000" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },

  /* ═══════════════════════════════════════════
     CONTABLES
     ═══════════════════════════════════════════ */
  {
    id: "grp-11",
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
    id: "grp-12",
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
    id: "grp-13",
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
