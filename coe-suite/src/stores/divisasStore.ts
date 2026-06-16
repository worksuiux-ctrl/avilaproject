import { create } from "zustand";
import {
  getDemoDivisas,
  getDemoDenominaciones,
  getDemoFajos,
  getDemoClasificaciones,
  getDemoStableCoins,
  fetchDivisas,
} from "@services/divisasService";

export interface Divisa {
  id: string;
  nombre: string;
  codigoISO: string;
  simbolo: string;
  paisOrigen: string;
  tipoMoneda: string;
  tasaCambio: number;
  factorRedondeo: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Denominacion {
  id: string;
  divisaId: string;
  nombre: string;
  tipo: "Billete" | "Moneda";
  valor: number;
  alto: number;
  ancho: number;
  peso: number;
  color: string;
  descripcion: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Fajo {
  id: string;
  denominacionId: string;
  nombre: string;
  cantidadUnidades: number;
  pesoEstimado: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Clasificacion {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  activo: boolean;
  divisasAplicables: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StableCoin {
  id: string;
  nombre: string;
  codigoISO: string;
  simbolo: string;
  redBlockchain: string;
  contractAddress: string;
  collateralType: string;
  peggedTo: string;
  tasaCambio: number;
  factorRedondeo: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DivisasState {
  divisas: Divisa[];
  denominaciones: Denominacion[];
  fajos: Fajo[];
  clasificaciones: Clasificacion[];
  stableCoins: StableCoin[];
  divisaBaseId: string;
  setDivisaBase: (id: string) => void;
  refreshFromApi: () => Promise<void>;
  addDivisa: (d: Omit<Divisa, "id" | "createdAt" | "updatedAt">) => void;
  updateDivisa: (id: string, d: Partial<Divisa>) => void;
  removeDivisa: (id: string) => void;
  reorderDivisas: (fromIndex: number, toIndex: number) => void;
  addDenominacion: (d: Omit<Denominacion, "id" | "createdAt" | "updatedAt">) => void;
  updateDenominacion: (id: string, d: Partial<Denominacion>) => void;
  removeDenominacion: (id: string) => void;
  addFajo: (f: Omit<Fajo, "id" | "createdAt" | "updatedAt">) => void;
  updateFajo: (id: string, f: Partial<Fajo>) => void;
  removeFajo: (id: string) => void;
  addClasificacion: (c: Omit<Clasificacion, "id" | "createdAt" | "updatedAt">) => void;
  updateClasificacion: (id: string, c: Partial<Clasificacion>) => void;
  removeClasificacion: (id: string) => void;
  addStableCoin: (s: Omit<StableCoin, "id" | "createdAt" | "updatedAt">) => void;
  updateStableCoin: (id: string, s: Partial<StableCoin>) => void;
  removeStableCoin: (id: string) => void;
  getDenominacionesByDivisa: (divisaId: string) => Denominacion[];
  getFajosByDenominacion: (denominacionId: string) => Fajo[];
  getDivisaById: (id: string) => Divisa | undefined;
  getDenominacionById: (id: string) => Denominacion | undefined;
  getFajoById: (id: string) => Fajo | undefined;
  getClasificacionById: (id: string) => Clasificacion | undefined;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

const DIVISAS_DEMO: Divisa[] = getDemoDivisas();
const DENOMINACIONES_DEMO: Denominacion[] = getDemoDenominaciones();
const CLASIFICACIONES_DEMO: Clasificacion[] = getDemoClasificaciones();
const STABLECOINS_DEMO: StableCoin[] = getDemoStableCoins();
const FAJOS_DEMO: Fajo[] = getDemoFajos();

export const useDivisasStore = create<DivisasState>((set, get) => ({
  divisas: DIVISAS_DEMO,
  denominaciones: DENOMINACIONES_DEMO,
  fajos: FAJOS_DEMO,
  clasificaciones: CLASIFICACIONES_DEMO,
  stableCoins: STABLECOINS_DEMO,
  divisaBaseId: "div-1",

  setDivisaBase: (id) => {
    set({ divisaBaseId: id });
  },

  refreshFromApi: async () => {
    const data = await fetchDivisas();
    set({
      divisas: data.divisas,
      denominaciones: data.denominaciones,
      fajos: data.fajos,
      clasificaciones: data.clasificaciones,
      stableCoins: data.stableCoins,
    });
  },

  addDivisa: (data) => {
    const now = new Date().toISOString();
    const item: Divisa = { ...data, id: makeId(), createdAt: now, updatedAt: now };
    set((s) => ({ divisas: [...s.divisas, item] }));
  },
  updateDivisa: (id, data) => {
    set((s) => ({
      divisas: s.divisas.map((d) =>
        d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d
      ),
    }));
  },
  removeDivisa: (id) => {
    set((s) => {
      const remaining = s.divisas.filter((d) => d.id !== id);
      return {
        divisas: remaining,
        divisaBaseId: s.divisaBaseId === id ? (remaining[0]?.id ?? "") : s.divisaBaseId,
        denominaciones: s.denominaciones.filter((den) => den.divisaId !== id),
        fajos: s.fajos.filter((f) => {
          const den = s.denominaciones.find((d) => d.id === f.denominacionId);
          return den ? den.divisaId !== id : true;
        }),
      };
    });
  },
  reorderDivisas: (fromIndex, toIndex) => {
    set((s) => {
      const list = [...s.divisas];
      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);
      return { divisas: list };
    });
  },

  addDenominacion: (data) => {
    const now = new Date().toISOString();
    const item: Denominacion = { ...data, id: makeId(), createdAt: now, updatedAt: now };
    set((s) => ({ denominaciones: [...s.denominaciones, item] }));
  },
  updateDenominacion: (id, data) => {
    set((s) => ({
      denominaciones: s.denominaciones.map((d) =>
        d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d
      ),
    }));
  },
  removeDenominacion: (id) => {
    set((s) => ({
      denominaciones: s.denominaciones.filter((d) => d.id !== id),
      fajos: s.fajos.filter((f) => f.denominacionId !== id),
    }));
  },

  addFajo: (data) => {
    const now = new Date().toISOString();
    const item: Fajo = { ...data, id: makeId(), createdAt: now, updatedAt: now };
    set((s) => ({ fajos: [...s.fajos, item] }));
  },
  updateFajo: (id, data) => {
    set((s) => ({
      fajos: s.fajos.map((f) =>
        f.id === id ? { ...f, ...data, updatedAt: new Date().toISOString() } : f
      ),
    }));
  },
  removeFajo: (id) => {
    set((s) => ({ fajos: s.fajos.filter((f) => f.id !== id) }));
  },

  addClasificacion: (data) => {
    const now = new Date().toISOString();
    const item: Clasificacion = { ...data, id: makeId(), createdAt: now, updatedAt: now };
    set((s) => ({ clasificaciones: [...s.clasificaciones, item] }));
  },
  updateClasificacion: (id, data) => {
    set((s) => ({
      clasificaciones: s.clasificaciones.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
      ),
    }));
  },
  removeClasificacion: (id) => {
    set((s) => ({ clasificaciones: s.clasificaciones.filter((c) => c.id !== id) }));
  },

  addStableCoin: (data) => {
    const now = new Date().toISOString();
    const item: StableCoin = { ...data, id: makeId(), createdAt: now, updatedAt: now };
    set((s) => ({ stableCoins: [...s.stableCoins, item] }));
  },
  updateStableCoin: (id, data) => {
    set((s) => ({
      stableCoins: s.stableCoins.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
      ),
    }));
  },
  removeStableCoin: (id) => {
    set((s) => ({ stableCoins: s.stableCoins.filter((c) => c.id !== id) }));
  },

  getDenominacionesByDivisa: (divisaId) =>
    get().denominaciones.filter((d) => d.divisaId === divisaId),

  getFajosByDenominacion: (denominacionId) =>
    get().fajos.filter((f) => f.denominacionId === denominacionId),

  getDivisaById: (id) => get().divisas.find((d) => d.id === id),
  getDenominacionById: (id) => get().denominaciones.find((d) => d.id === id),
  getFajoById: (id) => get().fajos.find((f) => f.id === id),
  getClasificacionById: (id) => get().clasificaciones.find((c) => c.id === id),
}));

export const TIPOS_MONEDA = ["Divisa", "Moneda", "Oro", "Stable Coin"];
export const TIPOS_DENOMINACION = ["Billete", "Moneda"] as const;
