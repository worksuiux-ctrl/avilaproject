import { create } from "zustand";

export type ClasificacionDia = "Hábil" | "No Hábil" | "Feriado Nacional" | "Feriado Bancario" | "Fin de Semana";
export type AlcanceConfig = "todas" | "unidades" | "grupos";

export interface CalendarioConfig {
  id: string;
  fecha: string;
  clasificacion: ClasificacionDia;
  descripcion: string;
  alcance: AlcanceConfig;
  unidadesIds: string[];
  gruposIds: string[];
  finSemanaAplica: "sábado" | "domingo" | "ambos" | null;
  createdAt: string;
  updatedAt: string;
}

interface CalendarioState {
  configs: CalendarioConfig[];
  addConfig: (data: Omit<CalendarioConfig, "id" | "createdAt" | "updatedAt">) => void;
  updateConfig: (id: string, data: Partial<CalendarioConfig>) => void;
  removeConfig: (id: string) => void;
  getConfigsForDate: (fecha: string) => CalendarioConfig[];
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

const DEMO_CONFIGS: CalendarioConfig[] = [
  {
    id: "demo-1",
    fecha: getFutureDate(10),
    clasificacion: "Feriado Bancario",
    descripcion: "Día del Banquero - Suspensión de operaciones interbancarias",
    alcance: "todas",
    unidadesIds: [],
    gruposIds: [],
    finSemanaAplica: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo-2",
    fecha: getFutureDate(15),
    clasificacion: "No Hábil",
    descripcion: "Mantenimiento Preventivo de Bóveda - Agencia La Candelaria",
    alcance: "unidades",
    unidadesIds: ["u-agencia-candelaria"],
    gruposIds: [],
    finSemanaAplica: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo-3",
    fecha: getFutureDate(15),
    clasificacion: "No Hábil",
    descripcion: "Falla eléctrica programada - Grupo Geográfico Estado Zulia",
    alcance: "grupos",
    unidadesIds: [],
    gruposIds: ["g-zulia"],
    finSemanaAplica: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo-4",
    fecha: getFutureDate(22),
    clasificacion: "Feriado Nacional",
    descripcion: "Día de la Independencia",
    alcance: "todas",
    unidadesIds: [],
    gruposIds: [],
    finSemanaAplica: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo-5",
    fecha: getFutureDate(28),
    clasificacion: "Hábil",
    descripcion: "Cierre fiscal de mes - Horario extendido",
    alcance: "todas",
    unidadesIds: [],
    gruposIds: [],
    finSemanaAplica: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function getFutureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

export const useCalendarioStore = create<CalendarioState>((set, get) => ({
  configs: DEMO_CONFIGS,

  addConfig: (data) => {
    const now = new Date().toISOString();
    const item: CalendarioConfig = { ...data, id: makeId(), createdAt: now, updatedAt: now };
    set((s) => ({ configs: [...s.configs, item] }));
  },

  updateConfig: (id, data) => {
    set((s) => ({
      configs: s.configs.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
      ),
    }));
  },

  removeConfig: (id) => {
    set((s) => ({ configs: s.configs.filter((c) => c.id !== id) }));
  },

  getConfigsForDate: (fecha) => {
    return get().configs.filter((c) => c.fecha === fecha);
  },
}));
