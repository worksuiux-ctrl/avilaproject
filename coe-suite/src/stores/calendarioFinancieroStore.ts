import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  finSemanaRecurrencia: "mes" | "año" | "siempre" | null;
  grupoId: string | null;
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

function getWeekendDatesInMonth(year: number, month: number, aplica: "sábado" | "domingo" | "ambos"): string[] {
  const dates: string[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay();
    if ((aplica === "sábado" || aplica === "ambos") && dow === 6) dates.push(fechaKeyRaw(year, month, d));
    if ((aplica === "domingo" || aplica === "ambos") && dow === 0) dates.push(fechaKeyRaw(year, month, d));
  }
  return dates;
}

function getWeekendDatesInYear(year: number, aplica: "sábado" | "domingo" | "ambos"): string[] {
  const dates: string[] = [];
  for (let m = 0; m < 12; m++) dates.push(...getWeekendDatesInMonth(year, m, aplica));
  return dates;
}

function getWeekendDatesForever(aplica: "sábado" | "domingo" | "ambos"): string[] {
  const dates: string[] = [];
  const startYear = new Date().getFullYear();
  for (let y = startYear; y <= startYear + 10; y++) dates.push(...getWeekendDatesInYear(y, aplica));
  return dates;
}

function fechaKeyRaw(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseFecha(fecha: string): { year: number; month: number; day: number } {
  const parts = fecha.split("-");
  return { year: parseInt(parts[0], 10), month: parseInt(parts[1], 10) - 1, day: parseInt(parts[2], 10) };
}



export const useCalendarioStore = create<CalendarioState>()(
  persist(
    (set, get) => ({
      configs: [],

      addConfig: (data) => {
        const now = new Date().toISOString();
        const grupoId = data.clasificacion === "Fin de Semana" && data.finSemanaRecurrencia ? makeId() : null;

        if (!grupoId) {
          const item: CalendarioConfig = { ...data, id: makeId(), grupoId: null, createdAt: now, updatedAt: now };
          set((s) => ({ configs: [...s.configs, item] }));
          return;
        }

        const { year, month } = parseFecha(data.fecha);
        const aplica = data.finSemanaAplica!;
        let fechas: string[];
        if (data.finSemanaRecurrencia === "mes") fechas = getWeekendDatesInMonth(year, month, aplica);
        else if (data.finSemanaRecurrencia === "año") fechas = getWeekendDatesInYear(year, aplica);
        else fechas = getWeekendDatesForever(aplica);

        const items: CalendarioConfig[] = fechas.map((f) => ({
          ...data,
          id: makeId(),
          fecha: f,
          grupoId,
          createdAt: now,
          updatedAt: now,
        }));
        set((s) => ({ configs: [...s.configs, ...items] }));
      },

      updateConfig: (id, data) => {
        set((s) => ({
          configs: s.configs.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },

      removeConfig: (id) => {
        const cfg = get().configs.find((c) => c.id === id);
        if (cfg?.grupoId) {
          set((s) => ({ configs: s.configs.filter((c) => c.grupoId !== cfg.grupoId) }));
        } else {
          set((s) => ({ configs: s.configs.filter((c) => c.id !== id) }));
        }
      },

      getConfigsForDate: (fecha) => {
        return get().configs.filter((c) => c.fecha === fecha);
      },
    }),
    { name: "coe-cal-fin-v2" }
  )
);
