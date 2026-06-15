import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TipoCampo = "texto" | "numero" | "fecha" | "select" | "denominacion" | "envases";

export interface CampoPredefinido {
  id: string;
  nombre: string;
  etiqueta: string;
  tipo: TipoCampo;
  requerido: boolean;
  opciones: string[];
  aplicableA: string[];
}

export interface Excepcion {
  id: string;
  nombre: string;
  esTerminal: boolean;
  retrocedeA: string | null;
  eventoContable: "descuenta" | "suma" | "ninguno";
  unidadEvento: string | null;
  unidadResponsableId: string | null;
  transferenciaCarga: "entrega" | "recepcion" | null;
  requiereAprobacion: boolean;
  tipoAprobacion: "central" | "agencia" | "ninguno";
  requiereVariables: boolean;
  variables: string;
  timeoutMinutos: number;
}

export interface TransaccionStep {
  id: string;
  nombre: string;
  orden: number;
  eventoContable: "descuenta" | "suma" | "ninguno";
  unidadEvento: string | null;
  unidadResponsableId: string | null;
  transferenciaCarga: "entrega" | "recepcion" | null;
  requiereAprobacion: boolean;
  tipoAprobacion: "central" | "agencia" | "ninguno";
  requiereVariables: boolean;
  variables: string;
  timeoutMinutos: number;
  excepciones: Excepcion[];
  camposSeleccionados: string[];
}

export interface ProcesoTransaccional {
  id: string;
  nombre: string;
  tipoCarga: string;
  modoIngreso: "fajos" | "piezas";
  origenTipo: string | null;
  destinoTipo: string | null;
  divisasPermitidas: string[];
  ambito: "interna" | "entre-agencias" | "externa";
  usaTransportista: boolean;
  transportistasPermitidos: string[];
  codigoRemesaFormato: string;
  codigoEnvioFormato: string;
  activo: boolean;
  steps: TransaccionStep[];
}

interface TransaccionesState {
  proceso: ProcesoTransaccional;
  procesosFinalizados: ProcesoTransaccional[];
  activeStepId: string | null;
  activeExceptionId: { stepId: string; exId: string } | null;

  setNombre: (v: string) => void;
  setTipoCarga: (v: string) => void;
  setModoIngreso: (v: "fajos" | "piezas") => void;
  setOrigenTipo: (v: string | null) => void;
  setDestinoTipo: (v: string | null) => void;
  setAmbito: (v: "interna" | "entre-agencias" | "externa") => void;
  setUsaTransportista: (v: boolean) => void;
  toggleTransportistaPermitido: (id: string) => void;
  setDivisasPermitidas: (ids: string[]) => void;
  setCodigoRemesaFormato: (v: string) => void;
  setCodigoEnvioFormato: (v: string) => void;
  setActivo: (v: boolean) => void;
  duplicarProceso: (id: string) => void;

  setActiveStep: (id: string | null) => void;
  setActiveException: (stepId: string | null, exId: string | null) => void;
  updateStepName: (id: string, nombre: string) => void;
  updateStepProperty: (stepId: string, key: string, value: unknown) => void;
  addStep: () => void;
  removeStep: (id: string) => void;
  moveStep: (fromIndex: number, toIndex: number) => void;

  addExcepcion: (stepId: string) => void;
  removeExcepcion: (stepId: string, exId: string) => void;
  updateExcepcionName: (stepId: string, exId: string, nombre: string) => void;
  updateExcepcionProperty: (stepId: string, exId: string, key: string, value: unknown) => void;
  setExcepcionTerminal: (stepId: string, exId: string, esTerminal: boolean) => void;

  toggleCampoSeleccionado: (stepId: string, campoId: string) => void;

  finalizeProceso: () => void;
  nuevoProceso: () => void;
  cargarProceso: (id: string) => void;
  eliminarProceso: (id: string) => void;
}

let idCounter = 100;
function makeId(): string {
  return `id-${++idCounter}`;
}

function resetProceso(): ProcesoTransaccional {
  return {
    id: makeId(),
    nombre: "",
    tipoCarga: "remesas",
    modoIngreso: "fajos",
    origenTipo: null,
    destinoTipo: null,
    divisasPermitidas: [],
    ambito: "interna",
    usaTransportista: false,
    transportistasPermitidos: [],
    codigoRemesaFormato: "REM-{YYYYMMDD}-{NNNNNN}",
    codigoEnvioFormato: "ENV-{YYYYMMDD}-{NNNNNN}",
    activo: true,
    steps: [
      { id: makeId(), nombre: "Inicial", orden: 1, eventoContable: "ninguno", unidadEvento: null, unidadResponsableId: null, transferenciaCarga: null, requiereAprobacion: false, tipoAprobacion: "ninguno", requiereVariables: false, variables: "", timeoutMinutos: 0, excepciones: [], camposSeleccionados: [] },
      { id: makeId(), nombre: "Terminal", orden: 2, eventoContable: "ninguno", unidadEvento: null, unidadResponsableId: null, transferenciaCarga: null, requiereAprobacion: false, tipoAprobacion: "ninguno", requiereVariables: false, variables: "", timeoutMinutos: 0, excepciones: [], camposSeleccionados: [] },
    ],
  };
}

export const useTransaccionesStore = create<TransaccionesState>()(
  persist(
    (set) => ({
  proceso: resetProceso(),
  procesosFinalizados: [
    {
      id: "demo-remesa-agencia",
      nombre: "Envío de Remesa (Agencia a Agencia)",
      tipoCarga: "remesas",
      modoIngreso: "fajos",
      origenTipo: "Agencia",
      destinoTipo: "Agencia",
      ambito: "entre-agencias",
      usaTransportista: true,
      transportistasPermitidos: ["trans-1", "trans-3"],
      divisasPermitidas: ["div-2", "div-1"],
      codigoRemesaFormato: "REM-{YYYYMMDD}-{NNNNNN}",
      codigoEnvioFormato: "ENV-{YYYYMMDD}-{NNNNNN}",
      activo: true,
      steps: [
        {
          id: "demo-s-1", nombre: "Solicitado", orden: 1, eventoContable: "ninguno", unidadEvento: null, unidadResponsableId: "agencia", transferenciaCarga: null, requiereAprobacion: false, tipoAprobacion: "ninguno", requiereVariables: true, variables: "monto_remesa", timeoutMinutos: 0, excepciones: [
            { id: "demo-e-1", nombre: "Rechazado por saldo insuficiente", esTerminal: true, retrocedeA: null, eventoContable: "ninguno", unidadEvento: null, unidadResponsableId: null, transferenciaCarga: null, requiereAprobacion: false, tipoAprobacion: "ninguno", requiereVariables: true, variables: "Motivo del rechazo", timeoutMinutos: 0 },
            { id: "demo-e-2", nombre: "Documentación incompleta", esTerminal: false, retrocedeA: "demo-s-1", eventoContable: "ninguno", unidadEvento: null, unidadResponsableId: null, transferenciaCarga: null, requiereAprobacion: true, tipoAprobacion: "central", requiereVariables: true, variables: "Detalle de documentos faltantes", timeoutMinutos: 1440 },
          ], camposSeleccionados: ["agencia-codigo", "agencia-nombre", "cam-placa", "cam-conductor", "cam-hora-salida", "bov-fecha", "bov-monto", "bov-denominaciones", "gral-observaciones"] },
        {
          id: "demo-s-2", nombre: "Verificado y Aprobado", orden: 2, eventoContable: "ninguno", unidadEvento: null, unidadResponsableId: "agencia", transferenciaCarga: null, requiereAprobacion: true, tipoAprobacion: "agencia", requiereVariables: false, variables: "", timeoutMinutos: 120, excepciones: [
            { id: "demo-e-3", nombre: "Requiere aprobación central", esTerminal: false, retrocedeA: null, eventoContable: "ninguno", unidadEvento: null, unidadResponsableId: "central", transferenciaCarga: null, requiereAprobacion: true, tipoAprobacion: "central", requiereVariables: false, variables: "", timeoutMinutos: 240 },
          ], camposSeleccionados: ["agencia-responsable", "agencia-autorizacion"] },
        {
          id: "demo-s-3", nombre: "Enviado", orden: 3, eventoContable: "descuenta", unidadEvento: "emisora", unidadResponsableId: "agencia", transferenciaCarga: "entrega", requiereAprobacion: false, tipoAprobacion: "ninguno", requiereVariables: true, variables: "precinto, peso", timeoutMinutos: 0, excepciones: [
            { id: "demo-e-4", nombre: "Atraco", esTerminal: true, retrocedeA: null, eventoContable: "ninguno", unidadEvento: null, unidadResponsableId: null, transferenciaCarga: null, requiereAprobacion: true, tipoAprobacion: "central", requiereVariables: true, variables: "Detalle del incidente, monto afectado", timeoutMinutos: 60 },
          ], camposSeleccionados: ["agencia-responsable", "agencia-autorizacion", "gral-observaciones"] },
        {
          id: "demo-s-4", nombre: "En Tránsito", orden: 4, eventoContable: "ninguno", unidadEvento: null, unidadResponsableId: "transportista", transferenciaCarga: null, requiereAprobacion: false, tipoAprobacion: "ninguno", requiereVariables: false, variables: "", timeoutMinutos: 90, excepciones: [
            { id: "demo-e-5", nombre: "Retenido por aduana", esTerminal: false, retrocedeA: null, eventoContable: "ninguno", unidadEvento: null, unidadResponsableId: "externo", transferenciaCarga: null, requiereAprobacion: true, tipoAprobacion: "central", requiereVariables: true, variables: "Documentación requerida", timeoutMinutos: 1440 },
          ], camposSeleccionados: ["cam-carta-porte", "cam-envases"] },
        {
          id: "demo-s-5", nombre: "Recibido", orden: 5, eventoContable: "suma", unidadEvento: "receptora", unidadResponsableId: "agencia", transferenciaCarga: "recepcion", requiereAprobacion: false, tipoAprobacion: "ninguno", requiereVariables: true, variables: "precinto_recibido, peso_recibido", timeoutMinutos: 0, excepciones: [
            { id: "demo-e-6", nombre: "Diferencia de peso", esTerminal: false, retrocedeA: null, eventoContable: "ninguno", unidadEvento: null, unidadResponsableId: null, transferenciaCarga: null, requiereAprobacion: true, tipoAprobacion: "agencia", requiereVariables: true, variables: "Diferencia encontrada", timeoutMinutos: 120 },
          ], camposSeleccionados: ["agencia-codigo", "agencia-nombre", "agencia-responsable"] },
        {
          id: "demo-s-6", nombre: "Confirmado", orden: 6, eventoContable: "ninguno", unidadEvento: null, unidadResponsableId: "agencia", transferenciaCarga: null, requiereAprobacion: false, tipoAprobacion: "ninguno", requiereVariables: false, variables: "", timeoutMinutos: 0, excepciones: [], camposSeleccionados: ["gral-observaciones"] },
      ],
    },
    {
      id: "demo-boveda-caja",
      nombre: "Pase de Bóveda a Caja",
      tipoCarga: "valores",
      modoIngreso: "fajos",
      origenTipo: "Bóveda",
      destinoTipo: "Caja",
      ambito: "interna",
      usaTransportista: false,
      transportistasPermitidos: [],
      divisasPermitidas: ["div-2", "div-1"],
      steps: [
        {
          id: "bc-s-1", nombre: "Solicitado", orden: 1, eventoContable: "ninguno", unidadEvento: null, unidadResponsableId: "agencia", transferenciaCarga: null, requiereAprobacion: false, tipoAprobacion: "ninguno", requiereVariables: true, variables: "monto, destino", timeoutMinutos: 0, excepciones: [
            { id: "bc-e-1", nombre: "Cancelar", esTerminal: true, retrocedeA: null, eventoContable: "ninguno", unidadEvento: null, unidadResponsableId: null, transferenciaCarga: null, requiereAprobacion: false, tipoAprobacion: "ninguno", requiereVariables: true, variables: "Motivo de cancelación", timeoutMinutos: 0 },
          ], camposSeleccionados: ["caja-numero", "caja-responsable", "bov-fecha", "bov-monto", "bov-denominaciones", "gral-observaciones"] },
        {
          id: "bc-s-2", nombre: "Confirmado", orden: 2, eventoContable: "descuenta", unidadEvento: "emisora", unidadResponsableId: "agencia", transferenciaCarga: "entrega", requiereAprobacion: false, tipoAprobacion: "ninguno", requiereVariables: true, variables: "precinto, peso", timeoutMinutos: 0, excepciones: [], camposSeleccionados: ["bov-precinto", "bov-peso"] },
      ],
    },
  ],
  activeStepId: null,
  activeExceptionId: null,

  setNombre: (v) =>
    set((s) => ({ proceso: { ...s.proceso, nombre: v } })),
  setTipoCarga: (v) =>
    set((s) => ({ proceso: { ...s.proceso, tipoCarga: v } })),
  setModoIngreso: (v) =>
    set((s) => ({ proceso: { ...s.proceso, modoIngreso: v } })),
  setOrigenTipo: (v) =>
    set((s) => ({ proceso: { ...s.proceso, origenTipo: v } })),
  setDestinoTipo: (v) =>
    set((s) => ({ proceso: { ...s.proceso, destinoTipo: v } })),
  setAmbito: (v) =>
    set((s) => ({
      proceso: {
        ...s.proceso,
        ambito: v,
        usaTransportista: v === "interna" ? false : s.proceso.usaTransportista,
      },
    })),
  setUsaTransportista: (v) =>
    set((s) => ({
      proceso: {
        ...s.proceso,
        usaTransportista: v,
        transportistasPermitidos: v ? s.proceso.transportistasPermitidos : [],
      },
    })),
  setDivisasPermitidas: (ids) =>
    set((s) => ({ proceso: { ...s.proceso, divisasPermitidas: ids } })),
  setCodigoRemesaFormato: (v) =>
    set((s) => ({ proceso: { ...s.proceso, codigoRemesaFormato: v } })),
  setCodigoEnvioFormato: (v) =>
    set((s) => ({ proceso: { ...s.proceso, codigoEnvioFormato: v } })),
  setActivo: (v) =>
    set((s) => ({ proceso: { ...s.proceso, activo: v } })),
  toggleTransportistaPermitido: (id) =>
    set((s) => ({
      proceso: {
        ...s.proceso,
        transportistasPermitidos: s.proceso.transportistasPermitidos.includes(id)
          ? s.proceso.transportistasPermitidos.filter((t) => t !== id)
          : [...s.proceso.transportistasPermitidos, id],
      },
    })),

  setActiveStep: (id) => set({ activeStepId: id, activeExceptionId: null }),

  setActiveException: (stepId, exId) =>
    set({ activeExceptionId: stepId && exId ? { stepId, exId } : null }),

  updateStepName: (id, nombre) =>
    set((s) => ({
      proceso: {
        ...s.proceso,
        steps: s.proceso.steps.map((st) =>
          st.id === id ? { ...st, nombre } : st
        ),
      },
    })),

  updateStepProperty: (stepId, key, value) =>
    set((s) => ({
      proceso: {
        ...s.proceso,
        steps: s.proceso.steps.map((st) =>
          st.id === stepId ? { ...st, [key]: value } : st
        ),
      },
    })),

  addStep: () =>
    set((s) => {
      const maxOrden = s.proceso.steps.reduce((m, st) => Math.max(m, st.orden), 0);
      const newStep: TransaccionStep = {
        id: makeId(),
        nombre: "Nuevo paso",
        orden: maxOrden + 1,
        eventoContable: "ninguno",
        unidadEvento: null,
        unidadResponsableId: null,
        transferenciaCarga: null,
        requiereAprobacion: false,
        tipoAprobacion: "ninguno",
        requiereVariables: false,
        variables: "",
        timeoutMinutos: 0,
        excepciones: [],
        camposSeleccionados: [],
      };
      return { proceso: { ...s.proceso, steps: [...s.proceso.steps, newStep] } };
    }),

  removeStep: (id) =>
    set((s) => {
      if (s.proceso.steps.length <= 2) return s;
      return {
        proceso: {
          ...s.proceso,
          steps: s.proceso.steps
            .filter((st) => st.id !== id)
            .map((st, i) => ({ ...st, orden: i + 1 })),
          activeStepId:
            s.activeStepId === id ? null : s.activeStepId,
        },
      };
    }),

  moveStep: (fromIndex, toIndex) =>
    set((s) => {
      const steps = [...s.proceso.steps];
      const [moved] = steps.splice(fromIndex, 1);
      steps.splice(toIndex, 0, moved);
      return {
        proceso: {
          ...s.proceso,
          steps: steps.map((st, i) => ({ ...st, orden: i + 1 })),
        },
      };
    }),

  addExcepcion: (stepId) =>
    set((s) => ({
      proceso: {
        ...s.proceso,
        steps: s.proceso.steps.map((st) =>
          st.id === stepId
            ? {
                ...st,
                excepciones: [
                  ...st.excepciones,
                  { id: makeId(), nombre: "Nueva excepción", esTerminal: false, retrocedeA: null, eventoContable: "ninguno", unidadEvento: null, unidadResponsableId: null, transferenciaCarga: null, requiereAprobacion: false, tipoAprobacion: "ninguno", requiereVariables: false, variables: "", timeoutMinutos: 0 },
                ],
              }
            : st
        ),
      },
    })),

  removeExcepcion: (stepId, exId) =>
    set((s) => ({
      proceso: {
        ...s.proceso,
        steps: s.proceso.steps.map((st) =>
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
      proceso: {
        ...s.proceso,
        steps: s.proceso.steps.map((st) =>
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

  updateExcepcionProperty: (stepId, exId, key, value) =>
    set((s) => ({
      proceso: {
        ...s.proceso,
        steps: s.proceso.steps.map((st) =>
          st.id === stepId
            ? {
                ...st,
                excepciones: st.excepciones.map((e) =>
                  e.id === exId ? { ...e, [key]: value } : e
                ),
              }
            : st
        ),
      },
    })),
  setExcepcionTerminal: (stepId, exId, esTerminal) =>
    set((s) => ({
      proceso: {
        ...s.proceso,
        steps: s.proceso.steps.map((st) =>
          st.id === stepId
            ? {
                ...st,
                excepciones: st.excepciones.map((e) =>
                  e.id === exId ? { ...e, esTerminal } : e
                ),
              }
            : st
        ),
      },
    })),

  toggleCampoSeleccionado: (stepId, campoId) =>
    set((s) => ({
      proceso: {
        ...s.proceso,
        steps: s.proceso.steps.map((st) =>
          st.id === stepId
            ? {
                ...st,
                camposSeleccionados: st.camposSeleccionados.includes(campoId)
                  ? st.camposSeleccionados.filter((id) => id !== campoId)
                  : [...st.camposSeleccionados, campoId],
              }
            : st
        ),
      },
    })),

  finalizeProceso: () =>
    set((s) => {
      const finalized = { ...s.proceso, id: s.proceso.id || makeId() };
      return {
        procesosFinalizados: [
          ...s.procesosFinalizados.filter((p) => p.id !== finalized.id),
          finalized,
        ],
        proceso: resetProceso(),
        activeStepId: null,
        activeExceptionId: null,
      };
    }),

  nuevoProceso: () =>
    set({
      proceso: resetProceso(),
      activeStepId: null,
      activeExceptionId: null,
    }),

  cargarProceso: (id) =>
    set((s) => {
      const found = s.procesosFinalizados.find((p) => p.id === id);
      if (!found) return s;
      return {
        proceso: { ...found },
        activeStepId: null,
        activeExceptionId: null,
      };
    }),

  eliminarProceso: (id) =>
    set((s) => ({
      procesosFinalizados: s.procesosFinalizados.filter((p) => p.id !== id),
    })),
  duplicarProceso: (id) =>
    set((s) => {
      const original = s.procesosFinalizados.find((p) => p.id === id);
      if (!original) return s;
      const copia: ProcesoTransaccional = {
        ...JSON.parse(JSON.stringify(original)),
        id: makeId(),
        nombre: `${original.nombre} (copia)`,
      };
      return { procesosFinalizados: [...s.procesosFinalizados, copia] };
    }),
}),
  { name: "transacciones-store", version: 4, migrate: (persisted: unknown, version: number) => {
    const state = persisted as Record<string, unknown>;
    if (version < 1) {
      const templates = (state as any)?.procesosFinalizados as any[];
      if (templates) {
        state.procesosFinalizados = templates.map((t: any) => {
          if (t.id === "demo-remesa-agencia") {
            return {
              ...t,
              steps: t.steps.map((s: any) => {
                if (s.id === "demo-s-4") return { ...s, camposSeleccionados: ["cam-carta-porte", "cam-envases"] };
                return s;
              }),
            };
          }
          return t;
        }) as any;
      }
    }
    if (version < 2) {
      const proceso = state.proceso as Record<string, unknown> | undefined;
      if (proceso && proceso.modoIngreso === undefined) {
        (state.proceso as any).modoIngreso = "fajos";
      }
      const templates = (state as any)?.procesosFinalizados as any[];
      if (templates) {
        state.procesosFinalizados = templates.map((t: any) => ({
          ...t,
          modoIngreso: t.modoIngreso ?? "fajos",
        })) as any;
      }
    }
    if (version < 3) {
      const addFormatDefaults = (obj: Record<string, unknown>) => ({
        ...obj,
        codigoRemesaFormato: (obj as any).codigoRemesaFormato ?? "REM-{YYYYMMDD}-{NNNNNN}",
        codigoEnvioFormato: (obj as any).codigoEnvioFormato ?? "ENV-{YYYYMMDD}-{NNNNNN}",
      });
      const proceso = state.proceso as Record<string, unknown> | undefined;
      if (proceso) {
        (state.proceso as any) = addFormatDefaults(proceso);
      }
      const templates = (state as any)?.procesosFinalizados as any[];
      if (templates) {
        state.procesosFinalizados = templates.map((t: any) => addFormatDefaults(t)) as any;
      }
    }
    if (version < 4) {
      const addActivoDefault = (obj: Record<string, unknown>) => ({
        ...obj,
        activo: (obj as any).activo ?? true,
      });
      const proceso = state.proceso as Record<string, unknown> | undefined;
      if (proceso) {
        (state.proceso as any) = addActivoDefault(proceso);
      }
      const templates = (state as any)?.procesosFinalizados as any[];
      if (templates) {
        state.procesosFinalizados = templates.map((t: any) => addActivoDefault(t)) as any;
      }
    }
    return state as TransaccionesState;
  } }
)
);
export const ENTIDADES = [
  { id: "boveda-central", nombre: "Bóveda Central", tipo: "Bóveda" },
  { id: "caja-principal", nombre: "Caja Principal", tipo: "Caja" },
  { id: "atm-001", nombre: "ATM 001", tipo: "ATM" },
  { id: "camion-001", nombre: "Camión Valores 001", tipo: "Camión" },
  { id: "almacen-001", nombre: "Almacén Central", tipo: "Almacén" },
  { id: "boveda-sec", nombre: "Bóveda Secundaria", tipo: "Bóveda" },
  { id: "caja-sec", nombre: "Caja Secundaria", tipo: "Caja" },
  { id: "atm-002", nombre: "ATM 002", tipo: "ATM" },
  { id: "banco-central", nombre: "Banco Central", tipo: "Banco" },
];

export const TRANSPORTISTAS = [
  { id: "trans-1", nombre: "Transportadora del Sur", costo: 150, acuerdoComercial: 10 },
  { id: "trans-2", nombre: "Valores Seguros C.A.", costo: 200, acuerdoComercial: null },
  { id: "trans-3", nombre: "Prosegur", costo: 180, acuerdoComercial: 8 },
  { id: "trans-4", nombre: "Brinks", costo: 220, acuerdoComercial: 15 },
];

export const TIPOS_CARGA = [
  { value: "remesas", label: "Remesas" },
  { value: "valores", label: "Valores" },
  { value: "documentacion", label: "Documentación" },
  { value: "combustible", label: "Combustible" },
  { value: "mercancias", label: "Mercancías" },
  { value: "otro", label: "Otro" },
];

export const EVENTOS_CONTABLES = [
  { value: "ninguno", label: "Ninguno" },
  { value: "descuenta", label: "Descuenta (Egreso)" },
  { value: "suma", label: "Suma (Ingreso)" },
];

export const UNIDADES_EVENTO = [
  { value: "emisora", label: "Unidad Emisora (Origen)" },
  { value: "receptora", label: "Unidad Receptora (Destino)" },
];

export const TIPOS_APROBACION = [
  { value: "ninguno", label: "Sin aprobación" },
  { value: "central", label: "Aprobación Central" },
  { value: "agencia", label: "Aprobación por Agencia" },
];

export const PERFILES_RESPONSABLE = [
  { value: "central", label: "Central" },
  { value: "agencia", label: "Agencia" },
  { value: "transportista", label: "Transportista" },
  { value: "externo", label: "Externo" },
];

export const TIPOS_UNIDAD = [
  { value: "Agencia", label: "Agencia" },
  { value: "Bóveda", label: "Bóveda" },
  { value: "Caja", label: "Caja" },
  { value: "Taquilla", label: "Taquilla" },
  { value: "Taquilla Externa", label: "Taquilla Externa" },
  { value: "Cajero", label: "Cajero / ATM" },
  { value: "Punto de Venta", label: "Punto de Venta" },
  { value: "Camión", label: "Camión" },
  { value: "Almacén", label: "Almacén" },
  { value: "Banco", label: "Banco" },
];

export const AMBITOS = [
  { value: "interna", label: "Interna (dentro de la misma agencia)" },
  { value: "entre-agencias", label: "Entre agencias" },
  { value: "externa", label: "Externa (con clientes, proveedores, otras entidades)" },
];

export const CAMPOS_PREDEFINIDOS: CampoPredefinido[] = [
  // ── Cajero / ATM ──
  { id: "atm-numero", nombre: "numero_atm", etiqueta: "Número de ATM", tipo: "texto", requerido: true, opciones: [], aplicableA: ["Cajero"] },
  { id: "atm-ubicacion", nombre: "ubicacion_atm", etiqueta: "Ubicación del ATM", tipo: "select", requerido: true, opciones: ["Lobby", "Exterior", "Remoto"], aplicableA: ["Cajero"] },
  { id: "atm-saldo-anterior", nombre: "saldo_anterior", etiqueta: "Saldo anterior", tipo: "numero", requerido: false, opciones: [], aplicableA: ["Cajero"] },
  { id: "atm-saldo-cargado", nombre: "saldo_cargado", etiqueta: "Monto cargado", tipo: "numero", requerido: true, opciones: [], aplicableA: ["Cajero"] },
  { id: "atm-tipo-carga", nombre: "tipo_carga_atm", etiqueta: "Tipo de carga", tipo: "select", requerido: true, opciones: ["Completa", "Parcial"], aplicableA: ["Cajero"] },
  { id: "atm-denominaciones", nombre: "denominaciones_cajetines", etiqueta: "Denominaciones por cajetín", tipo: "denominacion", requerido: true, opciones: [], aplicableA: ["Cajero"] },
  { id: "atm-fecha-carga", nombre: "fecha_carga_atm", etiqueta: "Fecha de carga", tipo: "fecha", requerido: true, opciones: [], aplicableA: ["Cajero"] },
  { id: "atm-contador-inicial", nombre: "contador_inicial", etiqueta: "Contador inicial", tipo: "numero", requerido: false, opciones: [], aplicableA: ["Cajero"] },
  { id: "atm-estado", nombre: "estado_atm", etiqueta: "Estado del ATM", tipo: "select", requerido: true, opciones: ["Operativo", "Fuera de servicio", "Mantenimiento"], aplicableA: ["Cajero"] },

  // ── Bóveda ──
  { id: "bov-fecha", nombre: "fecha_movimiento", etiqueta: "Fecha de movimiento", tipo: "fecha", requerido: true, opciones: [], aplicableA: ["Bóveda"] },
  { id: "bov-tipo-mov", nombre: "tipo_movimiento", etiqueta: "Tipo de movimiento", tipo: "select", requerido: true, opciones: ["Ingreso", "Egreso", "Traslado"], aplicableA: ["Bóveda"] },
  { id: "bov-monto", nombre: "monto_total", etiqueta: "Monto total", tipo: "numero", requerido: true, opciones: [], aplicableA: ["Bóveda"] },
  { id: "bov-denominaciones", nombre: "denominaciones_boveda", etiqueta: "Denominaciones", tipo: "denominacion", requerido: true, opciones: [], aplicableA: ["Bóveda"] },
  { id: "bov-precinto", nombre: "numero_precinto", etiqueta: "Número de precinto", tipo: "texto", requerido: true, opciones: [], aplicableA: ["Bóveda"] },
  { id: "bov-peso", nombre: "peso_confirmado", etiqueta: "Peso confirmado", tipo: "numero", requerido: false, opciones: [], aplicableA: ["Bóveda"] },

  // ── Caja ──
  { id: "caja-fecha", nombre: "fecha_operacion", etiqueta: "Fecha de operación", tipo: "fecha", requerido: true, opciones: [], aplicableA: ["Caja"] },
  { id: "caja-tipo-op", nombre: "tipo_operacion", etiqueta: "Tipo de operación", tipo: "select", requerido: true, opciones: ["Apertura", "Cierre", "Reposición", "Retiro"], aplicableA: ["Caja"] },
  { id: "caja-monto-apertura", nombre: "monto_apertura", etiqueta: "Monto de apertura", tipo: "numero", requerido: false, opciones: [], aplicableA: ["Caja"] },
  { id: "caja-monto-cierre", nombre: "monto_cierre", etiqueta: "Monto de cierre", tipo: "numero", requerido: false, opciones: [], aplicableA: ["Caja"] },
  { id: "caja-saldo", nombre: "saldo_caja", etiqueta: "Saldo en caja", tipo: "numero", requerido: true, opciones: [], aplicableA: ["Caja"] },
  { id: "caja-numero", nombre: "numero_caja", etiqueta: "Número de caja", tipo: "texto", requerido: true, opciones: [], aplicableA: ["Caja"] },
  { id: "caja-responsable", nombre: "empleado_responsable", etiqueta: "Empleado responsable", tipo: "texto", requerido: true, opciones: [], aplicableA: ["Caja"] },

  // ── Agencia ──
  { id: "agencia-codigo", nombre: "codigo_agencia", etiqueta: "Código de agencia", tipo: "texto", requerido: true, opciones: [], aplicableA: ["Agencia"] },
  { id: "agencia-nombre", nombre: "nombre_agencia", etiqueta: "Nombre de agencia", tipo: "texto", requerido: true, opciones: [], aplicableA: ["Agencia"] },
  { id: "agencia-responsable", nombre: "responsable_agencia", etiqueta: "Responsable de agencia", tipo: "texto", requerido: true, opciones: [], aplicableA: ["Agencia"] },
  { id: "agencia-autorizacion", nombre: "numero_autorizacion", etiqueta: "Número de autorización", tipo: "texto", requerido: false, opciones: [], aplicableA: ["Agencia"] },

  // ── Taquilla ──
  { id: "taq-numero", nombre: "numero_taquilla", etiqueta: "Número de taquilla", tipo: "texto", requerido: true, opciones: [], aplicableA: ["Taquilla", "Taquilla Externa"] },
  { id: "taq-tipo-servicio", nombre: "tipo_servicio", etiqueta: "Tipo de servicio", tipo: "select", requerido: true, opciones: ["Depósito", "Retiro", "Pago", "Cambio"], aplicableA: ["Taquilla", "Taquilla Externa"] },
  { id: "taq-monto", nombre: "monto_transaccion", etiqueta: "Monto de transacción", tipo: "numero", requerido: true, opciones: [], aplicableA: ["Taquilla", "Taquilla Externa"] },
  { id: "taq-cliente", nombre: "identificacion_cliente", etiqueta: "Identificación del cliente", tipo: "texto", requerido: true, opciones: [], aplicableA: ["Taquilla", "Taquilla Externa"] },
  { id: "taq-referencia", nombre: "referencia_operacion", etiqueta: "Referencia de operación", tipo: "texto", requerido: false, opciones: [], aplicableA: ["Taquilla", "Taquilla Externa"] },

  // ── Punto de Venta ──
  { id: "pdv-codigo", nombre: "codigo_pdv", etiqueta: "Código del punto de venta", tipo: "texto", requerido: true, opciones: [], aplicableA: ["Punto de Venta"] },
  { id: "pdv-comercio", nombre: "nombre_comercio", etiqueta: "Nombre del comercio", tipo: "texto", requerido: true, opciones: [], aplicableA: ["Punto de Venta"] },
  { id: "pdv-monto", nombre: "monto_servicio", etiqueta: "Monto del servicio", tipo: "numero", requerido: true, opciones: [], aplicableA: ["Punto de Venta"] },

  // ── Camión / Transportista ──
  { id: "cam-placa", nombre: "placa_vehiculo", etiqueta: "Placa del vehículo", tipo: "texto", requerido: true, opciones: [], aplicableA: ["Camión"] },
  { id: "cam-unidad", nombre: "numero_unidad", etiqueta: "Número de unidad", tipo: "texto", requerido: true, opciones: [], aplicableA: ["Camión"] },
  { id: "cam-conductor", nombre: "conductor", etiqueta: "Nombre del conductor", tipo: "texto", requerido: true, opciones: [], aplicableA: ["Camión"] },
  { id: "cam-ruta", nombre: "ruta", etiqueta: "Ruta", tipo: "select", requerido: false, opciones: ["Ruta 1", "Ruta 2", "Ruta 3", "Ruta 4"], aplicableA: ["Camión"] },
  { id: "cam-hora-salida", nombre: "hora_salida", etiqueta: "Hora de salida", tipo: "texto", requerido: true, opciones: [], aplicableA: ["Camión"] },
  { id: "cam-hora-llegada", nombre: "hora_llegada_estimada", etiqueta: "Hora estimada de llegada", tipo: "texto", requerido: false, opciones: [], aplicableA: ["Camión"] },
  { id: "cam-precinto-salida", nombre: "precinto_salida", etiqueta: "Precinto de salida", tipo: "texto", requerido: true, opciones: [], aplicableA: ["Camión"] },
  { id: "cam-precinto-llegada", nombre: "precinto_llegada", etiqueta: "Precinto de llegada", tipo: "texto", requerido: false, opciones: [], aplicableA: ["Camión"] },
  { id: "cam-peso-carga", nombre: "peso_carga", etiqueta: "Peso de carga", tipo: "numero", requerido: false, opciones: [], aplicableA: ["Camión"] },

  // ── Almacén ──
  { id: "alm-codigo", nombre: "codigo_almacen", etiqueta: "Código de almacén", tipo: "texto", requerido: true, opciones: [], aplicableA: ["Almacén"] },
  { id: "alm-ubicacion", nombre: "ubicacion_almacen", etiqueta: "Ubicación del almacén", tipo: "select", requerido: true, opciones: ["Central", "Norte", "Sur", "Este", "Oeste"], aplicableA: ["Almacén"] },
  { id: "alm-responsable", nombre: "responsable_almacen", etiqueta: "Responsable de almacén", tipo: "texto", requerido: true, opciones: [], aplicableA: ["Almacén"] },

  // ── Banco ──
  { id: "ban-codigo", nombre: "codigo_banco", etiqueta: "Código del banco", tipo: "texto", requerido: true, opciones: [], aplicableA: ["Banco"] },
  { id: "ban-nombre", nombre: "nombre_banco", etiqueta: "Nombre del banco", tipo: "texto", requerido: true, opciones: [], aplicableA: ["Banco"] },
  { id: "ban-cuenta", nombre: "numero_cuenta", etiqueta: "Número de cuenta", tipo: "texto", requerido: true, opciones: [], aplicableA: ["Banco"] },
  { id: "ban-referencia-bcra", nombre: "referencia_bcra", etiqueta: "Referencia BCRA", tipo: "texto", requerido: true, opciones: [], aplicableA: ["Banco"] },
  { id: "ban-tipo-transferencia", nombre: "tipo_transferencia", etiqueta: "Tipo de transferencia", tipo: "select", requerido: true, opciones: ["Local", "Internacional", "SWIFT"], aplicableA: ["Banco"] },

  // ── Generales (aplican a cualquier unidad) ──
  { id: "gral-observaciones", nombre: "observaciones", etiqueta: "Observaciones", tipo: "texto", requerido: false, opciones: [], aplicableA: ["Agencia", "Bóveda", "Caja", "Taquilla", "Taquilla Externa", "Cajero", "Punto de Venta", "Camión", "Almacén", "Banco"] },

  // ── Envío / Transporte ──
  { id: "cam-carta-porte", nombre: "carta_porte", etiqueta: "Número de carta porte", tipo: "texto", requerido: true, opciones: [], aplicableA: ["Camión"] },
  { id: "cam-envases", nombre: "detalle_envases", etiqueta: "Detalle de envases", tipo: "envases", requerido: true, opciones: [], aplicableA: ["Camión"] },
];
