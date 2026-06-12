import { create } from "zustand";

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
  cantidadBilletes: number;
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
  createdAt: string;
  updatedAt: string;
}

interface DivisasState {
  divisas: Divisa[];
  denominaciones: Denominacion[];
  fajos: Fajo[];
  clasificaciones: Clasificacion[];
  addDivisa: (d: Omit<Divisa, "id" | "createdAt" | "updatedAt">) => void;
  updateDivisa: (id: string, d: Partial<Divisa>) => void;
  removeDivisa: (id: string) => void;
  addDenominacion: (d: Omit<Denominacion, "id" | "createdAt" | "updatedAt">) => void;
  updateDenominacion: (id: string, d: Partial<Denominacion>) => void;
  removeDenominacion: (id: string) => void;
  addFajo: (f: Omit<Fajo, "id" | "createdAt" | "updatedAt">) => void;
  updateFajo: (id: string, f: Partial<Fajo>) => void;
  removeFajo: (id: string) => void;
  addClasificacion: (c: Omit<Clasificacion, "id" | "createdAt" | "updatedAt">) => void;
  updateClasificacion: (id: string, c: Partial<Clasificacion>) => void;
  removeClasificacion: (id: string) => void;
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

const DIVISAS_DEMO: Divisa[] = [
  { id: "div-1", nombre: "Bolívar", codigoISO: "VES", simbolo: "Bs", paisOrigen: "Venezuela", tipoMoneda: "Moneda", tasaCambio: 1, factorRedondeo: 0, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "div-2", nombre: "Dólar Americano", codigoISO: "USD", simbolo: "$", paisOrigen: "Estados Unidos", tipoMoneda: "Divisa", tasaCambio: 0, factorRedondeo: 2, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "div-3", nombre: "Euro", codigoISO: "EUR", simbolo: "€", paisOrigen: "Unión Europea", tipoMoneda: "Divisa", tasaCambio: 0, factorRedondeo: 2, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "div-4", nombre: "Peso Colombiano", codigoISO: "COP", simbolo: "$", paisOrigen: "Colombia", tipoMoneda: "Divisa", tasaCambio: 0, factorRedondeo: 0, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
];

const DENOMINACIONES_DEMO: Denominacion[] = [
  { id: "den-1", divisaId: "div-1", nombre: "100 Bolívares", tipo: "Billete", valor: 100, alto: 156, ancho: 69, peso: 1.2, color: "#FF6B6B", descripcion: "Billete color rojo", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "den-2", divisaId: "div-1", nombre: "50 Bolívares", tipo: "Billete", valor: 50, alto: 156, ancho: 69, peso: 1.2, color: "#4ECDC4", descripcion: "Billete color turquesa", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "den-3", divisaId: "div-1", nombre: "20 Bolívares", tipo: "Billete", valor: 20, alto: 156, ancho: 69, peso: 1.2, color: "#45B7D1", descripcion: "Billete color azul", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "den-4", divisaId: "div-1", nombre: "10 Bolívares", tipo: "Billete", valor: 10, alto: 156, ancho: 69, peso: 1.1, color: "#96CEB4", descripcion: "Billete color verde", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "den-5", divisaId: "div-1", nombre: "5 Bolívares", tipo: "Moneda", valor: 5, alto: 26, ancho: 26, peso: 7.5, color: "#D4A574", descripcion: "Moneda color dorado", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "den-6", divisaId: "div-1", nombre: "2 Bolívares", tipo: "Moneda", valor: 2, alto: 24, ancho: 24, peso: 6.0, color: "#C0C0C0", descripcion: "Moneda color plateado", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "den-7", divisaId: "div-1", nombre: "1 Bolívar", tipo: "Moneda", valor: 1, alto: 22, ancho: 22, peso: 5.0, color: "#B8860B", descripcion: "Moneda color bronce", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "den-8", divisaId: "div-2", nombre: "100 Dólares", tipo: "Billete", valor: 100, alto: 156, ancho: 66, peso: 1.0, color: "#98FB98", descripcion: "Billete color verde claro", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "den-9", divisaId: "div-2", nombre: "50 Dólares", tipo: "Billete", valor: 50, alto: 156, ancho: 66, peso: 1.0, color: "#87CEEB", descripcion: "Billete color azul claro", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "den-10", divisaId: "div-2", nombre: "20 Dólares", tipo: "Billete", valor: 20, alto: 156, ancho: 66, peso: 1.0, color: "#FFD700", descripcion: "Billete color dorado", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "den-11", divisaId: "div-2", nombre: "10 Dólares", tipo: "Billete", valor: 10, alto: 156, ancho: 66, peso: 1.0, color: "#FFA500", descripcion: "Billete color naranja", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "den-12", divisaId: "div-2", nombre: "1 Dólar", tipo: "Moneda", valor: 1, alto: 26, ancho: 26, peso: 8.1, color: "#C0C0C0", descripcion: "Moneda color plateado", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
];

const CLASIFICACIONES_DEMO: Clasificacion[] = [
  { id: "cla-1", nombre: "Apto", descripcion: "Billete en buen estado apto para recirculación", color: "#22c55e", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "cla-2", nombre: "No Apto", descripcion: "Billete deteriorado no apto para recirculación", color: "#ef4444", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "cla-3", nombre: "Sospechoso", descripcion: "Billete con presunta falsificación", color: "#f59e0b", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "cla-4", nombre: "Mutilado", descripcion: "Billete con daños físicos parciales", color: "#8b5cf6", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "cla-5", nombre: "Falso", descripcion: "Billete falsificado", color: "#1e293b", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "cla-6", nombre: "Señuelo", descripcion: "Billete con dispositivo de rastreo", color: "#06b6d4", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
];

const FAJOS_DEMO: Fajo[] = [
  { id: "faj-1", denominacionId: "den-1", nombre: "Fajo Completo", cantidadBilletes: 100, pesoEstimado: 120, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "faj-2", denominacionId: "den-1", nombre: "Fajo Medio", cantidadBilletes: 50, pesoEstimado: 60, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "faj-3", denominacionId: "den-2", nombre: "Fajo Completo", cantidadBilletes: 100, pesoEstimado: 120, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "faj-4", denominacionId: "den-3", nombre: "Fajo Completo", cantidadBilletes: 100, pesoEstimado: 120, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "faj-5", denominacionId: "den-4", nombre: "Fajo Completo", cantidadBilletes: 100, pesoEstimado: 110, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "faj-6", denominacionId: "den-8", nombre: "Fajo Completo", cantidadBilletes: 100, pesoEstimado: 100, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  { id: "faj-7", denominacionId: "den-9", nombre: "Fajo Completo", cantidadBilletes: 100, pesoEstimado: 100, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
];

export const useDivisasStore = create<DivisasState>((set, get) => ({
  divisas: DIVISAS_DEMO,
  denominaciones: DENOMINACIONES_DEMO,
  fajos: FAJOS_DEMO,
  clasificaciones: CLASIFICACIONES_DEMO,

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
    set((s) => ({
      divisas: s.divisas.filter((d) => d.id !== id),
      denominaciones: s.denominaciones.filter((den) => den.divisaId !== id),
      fajos: s.fajos.filter((f) => {
        const den = s.denominaciones.find((d) => d.id === f.denominacionId);
        return den ? den.divisaId !== id : true;
      }),
    }));
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
