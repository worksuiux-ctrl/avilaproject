import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface InstanciaHistorial {
  stepId: string;
  stepName: string;
  fecha: string;
  perfil: string;
  accion: "creada" | "avanzada" | "excepcion" | "completada";
  datos: Record<string, string>;
  exceptionName?: string;
}

export interface TransaccionInstancia {
  id: string;
  templateId: string;
  nombre: string;
  origenId: string;
  destinoId: string;
  divisaId: string;
  monto: number;
  estadoActual: string;
  codigoRemesa: string;
  codigoEnvio: string;
  dataPorEstado: Record<string, Record<string, string>>;
  historial: InstanciaHistorial[];
  createdAt: string;
  updatedAt: string;
}

interface InstanciasState {
  instancias: TransaccionInstancia[];
  selectedId: string | null;
  creatingTemplateId: string | null;

  clearInstancias: () => void;
  crearInstancia: (templateId: string, nombre: string, firstStepId: string, data: Record<string, string>, perfil: string, origenId: string, destinoId: string, divisaId: string, monto: number, codigoRemesa?: string, codigoEnvio?: string) => TransaccionInstancia;
  updateInstancia: (instanciaId: string, updates: { origenId?: string; destinoId?: string; divisaId?: string; monto?: number; firstStepData?: Record<string, string> }) => void;
  avanzarEstado: (instanciaId: string, nextStepId: string, nextStepName: string, perfil: string, data: Record<string, string>, esTerminal: boolean) => void;
  activarExcepcion: (instanciaId: string, stepId: string, stepName: string, exceptionName: string, data: Record<string, string>, esTerminal: boolean) => void;
  selectInstancia: (id: string | null) => void;
  setCreatingTemplate: (templateId: string | null) => void;
}

let instIdCounter = 1000;
function makeInstId(): string {
  return `inst-${++instIdCounter}`;
}

export const useInstanciasStore = create<InstanciasState>()(
  persist(
    (set) => ({
  instancias: [],
  selectedId: null,
  creatingTemplateId: null,

  crearInstancia: (templateId, nombre, firstStepId, data, perfil, origenId, destinoId, divisaId, monto, codigoRemesa, codigoEnvio) => {
    const id = makeInstId();
    const now = new Date().toLocaleString("es-VE");
    const instancia: TransaccionInstancia = {
      id,
      templateId,
      nombre,
      origenId,
      destinoId,
      divisaId,
      monto,
      estadoActual: firstStepId,
      codigoRemesa: codigoRemesa ?? "",
      codigoEnvio: codigoEnvio ?? "",
      dataPorEstado: { [firstStepId]: data },
      historial: [{
        stepId: firstStepId,
        stepName: nombre,
        fecha: now,
        perfil,
        accion: "creada",
        datos: data,
      }],
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ instancias: [...s.instancias, instancia], selectedId: id }));
    return instancia;
  },

  avanzarEstado: (instanciaId, nextStepId, nextStepName, perfil, data, esTerminal) =>
    set((s) => {
      const idx = s.instancias.findIndex((i) => i.id === instanciaId);
      if (idx === -1) return s;
      const inst = s.instancias[idx];
      const now = new Date().toLocaleString("es-VE");
      const newList = [...s.instancias];
      newList[idx] = {
        ...inst,
        estadoActual: nextStepId,
        dataPorEstado: { ...inst.dataPorEstado, [nextStepId]: data },
        historial: [
          ...inst.historial,
          { stepId: nextStepId, stepName: nextStepName, fecha: now, perfil, accion: esTerminal ? "completada" : "avanzada", datos: data },
        ],
        updatedAt: now,
      };
      return { instancias: newList };
    }),

  activarExcepcion: (instanciaId, stepId, stepName, exceptionName, data, esTerminal, retrocedeA?) =>
    set((s) => {
      const idx = s.instancias.findIndex((i) => i.id === instanciaId);
      if (idx === -1) return s;
      const inst = s.instancias[idx];
      const now = new Date().toLocaleString("es-VE");
      const excKey = `${stepId}:exc`;
      const nuevoEstado = retrocedeA ? retrocedeA : (esTerminal ? `${excKey}:terminal` : excKey);
      const accion = esTerminal ? "excepcion" : (retrocedeA ? "avanzada" : "avanzada");
      const newList = [...s.instancias];
      newList[idx] = {
        ...inst,
        estadoActual: nuevoEstado,
        dataPorEstado: { ...inst.dataPorEstado, [excKey]: data },
        historial: [
          ...inst.historial,
          { stepId: excKey, stepName: `${stepName} → ${exceptionName}${retrocedeA ? " (retrocede)" : ""}`, fecha: now, perfil: "agencia", accion: esTerminal ? "excepcion" : "avanzada", datos: data, exceptionName },
        ],
        updatedAt: now,
      };
      return { instancias: newList };
    }),

  updateInstancia: (instanciaId, updates) =>
    set((s) => {
      const idx = s.instancias.findIndex((i) => i.id === instanciaId);
      if (idx === -1) return s;
      const inst = s.instancias[idx];
      const now = new Date().toLocaleString("es-VE");
      const firstStepId = Object.keys(inst.dataPorEstado)[0];
      const newList = [...s.instancias];
      newList[idx] = {
        ...inst,
        origenId: updates.origenId ?? inst.origenId,
        destinoId: updates.destinoId ?? inst.destinoId,
        divisaId: updates.divisaId ?? inst.divisaId,
        monto: updates.monto ?? inst.monto,
        dataPorEstado: updates.firstStepData && firstStepId
          ? { ...inst.dataPorEstado, [firstStepId]: { ...inst.dataPorEstado[firstStepId], ...updates.firstStepData } }
          : inst.dataPorEstado,
        updatedAt: now,
      };
      newList[idx].historial = [...newList[idx].historial, {
        stepId: firstStepId,
        stepName: "Editado",
        fecha: now,
        perfil: "agencia",
        accion: "avanzada",
        datos: updates.firstStepData ?? {},
      }];
      return { instancias: newList };
    }),

  clearInstancias: () => set({ instancias: [], selectedId: null }),

  selectInstancia: (id) => set({ selectedId: id }),

  setCreatingTemplate: (templateId) => set({ creatingTemplateId: templateId }),
}),
  { name: "instancias-store" }
)
);
