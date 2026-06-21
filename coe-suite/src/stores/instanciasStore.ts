import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useTransaccionesStore } from "./transaccionesStore";

export interface ServicioEjecutado {
  stepId: string;
  categoria: string;
  fecha: string;
  estado: "pendiente" | "ejecutado" | "fallo";
}

export interface InstanciaHistorial {
  stepId: string;
  stepName: string;
  fecha: string;
  perfil: string;
  accion: "creada" | "avanzada" | "excepcion" | "completada" | "desbloqueo";
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
  serviciosEjecutados: ServicioEjecutado[];
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
  avanzarEstado: (instanciaId: string, currentStepId: string, nextStepId: string, nextStepName: string, perfil: string, data: Record<string, string>, esTerminal: boolean) => void;
  activarExcepcion: (instanciaId: string, stepId: string, stepName: string, exceptionName: string, data: Record<string, string>, esTerminal: boolean) => void;
  selectInstancia: (id: string | null) => void;
  setCreatingTemplate: (templateId: string | null) => void;
  reversarEstado: (instanciaId: string, stepId: string, stepName: string) => void;
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
      serviciosEjecutados: [],
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ instancias: [...s.instancias, instancia], selectedId: id }));
    return instancia;
  },

  avanzarEstado: (instanciaId, currentStepId, nextStepId, nextStepName, perfil, data, esTerminal) =>
    set((s) => {
      const idx = s.instancias.findIndex((i) => i.id === instanciaId);
      if (idx === -1) return s;
      const inst = s.instancias[idx];
      const now = new Date().toLocaleString("es-VE");
      const template = useTransaccionesStore.getState().procesosFinalizados.find((p) => p.id === inst.templateId);
      const step = template?.steps.find((st) => st.id === nextStepId);
      const categorias = step?.serviciosCategorias ?? [];
      const serviciosEjecutados: ServicioEjecutado[] = categorias.map((cat) => ({
        stepId: nextStepId,
        categoria: cat,
        fecha: now,
        estado: "ejecutado" as const,
      }));
      const newList = [...s.instancias];
      newList[idx] = {
        ...inst,
        estadoActual: nextStepId,
        dataPorEstado: { ...inst.dataPorEstado, [currentStepId]: { ...inst.dataPorEstado[currentStepId], ...data } },
        historial: [
          ...inst.historial,
          { stepId: nextStepId, stepName: nextStepName, fecha: now, perfil, accion: esTerminal ? "completada" : "avanzada", datos: data },
        ],
        serviciosEjecutados: [...(inst.serviciosEjecutados ?? []), ...serviciosEjecutados],
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
      const template = useTransaccionesStore.getState().procesosFinalizados.find((p) => p.id === inst.templateId);
      const currentStep = template?.steps.find((st) => st.id === stepId);
      const requiereDesbloqueo = currentStep?.bloqueoSaldo && retrocedeA != null;
      const excKey = `${stepId}:exc`;
      const nuevoEstado = retrocedeA ? retrocedeA : (esTerminal ? `${excKey}:terminal` : excKey);
      const _accion = esTerminal ? "excepcion" : (retrocedeA ? "avanzada" : "avanzada");
      const unlockEvent = requiereDesbloqueo ? [{
        stepId: `${excKey}:desbloqueo`,
        stepName: `${stepName} → Desbloqueo de saldo`,
        fecha: now,
        perfil: "agencia" as const,
        accion: "desbloqueo" as const,
        datos: data,
      }] : [];
      const newList = [...s.instancias];
      newList[idx] = {
        ...inst,
        estadoActual: nuevoEstado,
        dataPorEstado: { ...inst.dataPorEstado, [excKey]: data },
        historial: [
          ...inst.historial,
          { stepId: excKey, stepName: `${stepName} → ${exceptionName}${retrocedeA ? " (retrocede)" : ""}`, fecha: now, perfil: "agencia", accion: esTerminal ? "excepcion" : "avanzada", datos: data, exceptionName },
          ...unlockEvent,
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

  reversarEstado: (instanciaId, stepId, stepName) =>
    set((s) => {
      const idx = s.instancias.findIndex((i) => i.id === instanciaId);
      if (idx === -1) return s;
      const inst = s.instancias[idx];
      const now = new Date().toLocaleString("es-VE");
      const newList = [...s.instancias];
      newList[idx] = {
        ...inst,
        estadoActual: stepId,
        historial: [
          ...inst.historial,
          { stepId, stepName: `${stepName} (reversado)`, fecha: now, perfil: "agencia", accion: "avanzada", datos: {} },
        ],
        updatedAt: now,
      };
      return { instancias: newList };
    }),
}),
  { name: "instancias-store" }
)
);
