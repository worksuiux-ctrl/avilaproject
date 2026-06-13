import { create } from "zustand";

export interface Excepcion {
  id: string;
  nombre: string;
}

export interface TransaccionStep {
  id: string;
  nombre: string;
  orden: number;
  excepciones: Excepcion[];
  requiereEscaneoPrecinto: boolean;
  asignarResponsable: boolean;
  divisa: string;
  limiteMin: number;
  limiteMax: number;
  transportadora: string;
  fechaVencimiento: string;
  lote: string;
  temperaturaMin: number;
  temperaturaMax: number;
}

export interface TransaccionFlow {
  id: string;
  nombre: string;
  steps: TransaccionStep[];
  activeStepId: string | null;
}

interface TransaccionesState {
  flow: TransaccionFlow;
  giro: "banco" | "retail";
  entidadOrigen: string | null;
  entidadDestino: string | null;
  setGiro: (g: "banco" | "retail") => void;
  setActiveStep: (id: string | null) => void;
  updateStepName: (id: string, nombre: string) => void;
  addExcepcion: (stepId: string) => void;
  removeExcepcion: (stepId: string, exId: string) => void;
  updateExcepcionName: (stepId: string, exId: string, nombre: string) => void;
  updateStepProperty: (stepId: string, key: string, value: unknown) => void;
  addStep: () => void;
  removeStep: (id: string) => void;
  setEntidadOrigen: (id: string | null) => void;
  setEntidadDestino: (id: string | null) => void;
}

let idCounter = 10;
function makeId(): string {
  return `id-${++idCounter}`;
}

const DEMO_FLOW: TransaccionFlow = {
  id: "flow-1",
  nombre: "Remesa Estándar",
  activeStepId: null,
  steps: [
    {
      id: "step-1",
      nombre: "Solicitado",
      orden: 1,
      excepciones: [],
      requiereEscaneoPrecinto: false,
      asignarResponsable: true,
      divisa: "",
      limiteMin: 0,
      limiteMax: 0,
      transportadora: "",
      fechaVencimiento: "",
      lote: "",
      temperaturaMin: 0,
      temperaturaMax: 0,
    },
    {
      id: "step-2",
      nombre: "Aprobado",
      orden: 2,
      excepciones: [
        { id: "exc-1", nombre: "Documentación incompleta" },
      ],
      requiereEscaneoPrecinto: true,
      asignarResponsable: true,
      divisa: "",
      limiteMin: 0,
      limiteMax: 0,
      transportadora: "",
      fechaVencimiento: "",
      lote: "",
      temperaturaMin: 0,
      temperaturaMax: 0,
    },
    {
      id: "step-3",
      nombre: "Despachado",
      orden: 3,
      excepciones: [
        { id: "exc-2", nombre: "Atraco" },
        { id: "exc-3", nombre: "Descuadre en conteo" },
      ],
      requiereEscaneoPrecinto: true,
      asignarResponsable: false,
      divisa: "",
      limiteMin: 0,
      limiteMax: 0,
      transportadora: "",
      fechaVencimiento: "",
      lote: "",
      temperaturaMin: 0,
      temperaturaMax: 0,
    },
    {
      id: "step-4",
      nombre: "Recibido",
      orden: 4,
      excepciones: [],
      requiereEscaneoPrecinto: false,
      asignarResponsable: true,
      divisa: "",
      limiteMin: 0,
      limiteMax: 0,
      transportadora: "",
      fechaVencimiento: "",
      lote: "",
      temperaturaMin: 0,
      temperaturaMax: 0,
    },
    {
      id: "step-5",
      nombre: "Confirmado",
      orden: 5,
      excepciones: [],
      requiereEscaneoPrecinto: false,
      asignarResponsable: false,
      divisa: "",
      limiteMin: 0,
      limiteMax: 0,
      transportadora: "",
      fechaVencimiento: "",
      lote: "",
      temperaturaMin: 0,
      temperaturaMax: 0,
    },
  ],
};

export const useTransaccionesStore = create<TransaccionesState>((set) => ({
  flow: DEMO_FLOW,
  giro: "banco",
  entidadOrigen: null,
  entidadDestino: null,

  setGiro: (g) => set({ giro: g }),

  setActiveStep: (id) =>
    set((s) => ({ flow: { ...s.flow, activeStepId: id } })),

  updateStepName: (id, nombre) =>
    set((s) => ({
      flow: {
        ...s.flow,
        steps: s.flow.steps.map((st) =>
          st.id === id ? { ...st, nombre } : st
        ),
      },
    })),

  addExcepcion: (stepId) =>
    set((s) => ({
      flow: {
        ...s.flow,
        steps: s.flow.steps.map((st) =>
          st.id === stepId
            ? {
                ...st,
                excepciones: [
                  ...st.excepciones,
                  { id: makeId(), nombre: "Nueva excepción" },
                ],
              }
            : st
        ),
      },
    })),

  removeExcepcion: (stepId, exId) =>
    set((s) => ({
      flow: {
        ...s.flow,
        steps: s.flow.steps.map((st) =>
          st.id === stepId
            ? {
                ...st,
                excepciones: st.excepciones.filter((e) => e.id !== exId),
              }
            : st
        ),
      },
    })),

  updateExcepcionName: (stepId, exId, nombre) =>
    set((s) => ({
      flow: {
        ...s.flow,
        steps: s.flow.steps.map((st) =>
          st.id === stepId
            ? {
                ...st,
                excepciones: st.excepciones.map((e) =>
                  e.id === exId ? { ...e, nombre } : e
                ),
              }
            : st
        ),
      },
    })),

  updateStepProperty: (stepId, key, value) =>
    set((s) => ({
      flow: {
        ...s.flow,
        steps: s.flow.steps.map((st) =>
          st.id === stepId ? { ...st, [key]: value } : st
        ),
      },
    })),

  addStep: () =>
    set((s) => {
      const maxOrden = s.flow.steps.reduce((m, st) => Math.max(m, st.orden), 0);
      const newStep: TransaccionStep = {
        id: makeId(),
        nombre: "Nuevo paso",
        orden: maxOrden + 1,
        excepciones: [],
        requiereEscaneoPrecinto: false,
        asignarResponsable: false,
        divisa: "",
        limiteMin: 0,
        limiteMax: 0,
        transportadora: "",
        fechaVencimiento: "",
        lote: "",
        temperaturaMin: 0,
        temperaturaMax: 0,
      };
      return { flow: { ...s.flow, steps: [...s.flow.steps, newStep] } };
    }),

  removeStep: (id) =>
    set((s) => ({
      flow: {
        ...s.flow,
        steps: s.flow.steps
          .filter((st) => st.id !== id)
          .map((st, i) => ({ ...st, orden: i + 1 })),
        activeStepId:
          s.flow.activeStepId === id ? null : s.flow.activeStepId,
      },
    })),

  setEntidadOrigen: (id) => set({ entidadOrigen: id }),
  setEntidadDestino: (id) => set({ entidadDestino: id }),
}));

export const DIVISAS_OPTS = [
  { value: "VES", label: "Bolívar (VES)" },
  { value: "USD", label: "Dólar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "COP", label: "Peso Colombiano (COP)" },
];

export const TRANSPORTADORAS = [
  { value: "trans-1", label: "Transportadora del Sur" },
  { value: "trans-2", label: "Valores Seguros C.A." },
  { value: "trans-3", label: "Prosegur" },
  { value: "trans-4", label: "Brinks" },
];

export const ENTIDADES = [
  { id: "boveda-central", nombre: "Bóveda Central", tipo: "Bóveda" },
  { id: "caja-principal", nombre: "Caja Principal", tipo: "Caja" },
  { id: "atm-001", nombre: "ATM 001", tipo: "ATM" },
  { id: "camion-001", nombre: "Camión Valores 001", tipo: "Camión" },
  { id: "almacen-001", nombre: "Almacén Central", tipo: "Almacén" },
  { id: "boveda-sec", nombre: "Bóveda Secundaria", tipo: "Bóveda" },
  { id: "caja-sec", nombre: "Caja Secundaria", tipo: "Caja" },
  { id: "atm-002", nombre: "ATM 002", tipo: "ATM" },
];
