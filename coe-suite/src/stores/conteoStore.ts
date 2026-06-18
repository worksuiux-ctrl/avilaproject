import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useInstanciasStore } from "./instanciasStore";
import { useTransaccionesStore } from "./transaccionesStore";
import { useDivisasStore } from "./divisasStore";
import { useEntitiesStore } from "./entitiesStore";

export type ResultadoConteo =
  | "pendiente"
  | "confirmado"
  | "incompleto"
  | "faltante"
  | "sobrante"
  | "inconsistente";

export interface ConteoBolsa {
  bolsaId: string;
  codigoBolsa: string;
  precinto: string;
  cartaPorte: string;
  clasificacionId: string;
  clasificacionNombre: string | null;
  clasificacionColor: string;
  denominacionesEsperadas: Record<string, number>;
  denominacionesReales: Record<string, number>;
  resultado: ResultadoConteo;
  fechaConteo: string | null;
  contadoPor: string | null;
  observaciones: string;
}

export interface ConteoRemesa {
  instanciaId: string;
  codigoRemesa: string;
  templateName: string;
  origenNombre: string;
  destinoNombre: string;
  divisaCodigo: string;
  divisaSimbolo: string;
  bolsas: ConteoBolsa[];
  resultadoFinal: ResultadoConteo | "en_proceso";
  fechaInicio: string;
  fechaCierre: string | null;
}

interface ConteoState {
  remesas: ConteoRemesa[];
  initializeConteo: (instanciaId: string) => void;
  actualizarBolsa: (
    instanciaId: string,
    bolsaId: string,
    denominacionesReales: Record<string, number>,
    contadoPor?: string,
    observaciones?: string
  ) => void;
  confirmarBolsa: (instanciaId: string, bolsaId: string) => void;
  cerrarRemesa: (instanciaId: string) => void;
  getRemesaByInstancia: (instanciaId: string) => ConteoRemesa | undefined;
  getRemesasEnConteo: () => ConteoRemesa[];
}

function computeResultadoBolsa(
  esperadas: Record<string, number>,
  reales: Record<string, number>
): ResultadoConteo {
  const keys = new Set([...Object.keys(esperadas), ...Object.keys(reales)]);
  if (keys.size === 0) return "pendiente";

  const anyReales = Object.values(reales).some((v) => v > 0);
  if (!anyReales) return "pendiente";

  let allMatch = true;
  let anyLess = false;
  let anyMore = false;

  for (const key of keys) {
    const esp = esperadas[key] ?? 0;
    const real = reales[key] ?? 0;
    if (real !== esp) allMatch = false;
    if (real < esp) anyLess = true;
    if (real > esp) anyMore = true;
  }

  if (allMatch) return "confirmado";
  if (anyLess && anyMore) return "inconsistente";
  if (anyLess) return "incompleto";
  if (anyMore) return "sobrante";
  return "inconsistente";
}

function computeResultadoFinal(bolsas: ConteoBolsa[]): ResultadoConteo | "en_proceso" {
  const algunaPendiente = bolsas.some((b) => b.resultado === "pendiente");
  if (algunaPendiente) return "en_proceso";

  const todosConfirmados = bolsas.every((b) => b.resultado === "confirmado");
  if (todosConfirmados) return "confirmado";

  const tieneInconsistente = bolsas.some((b) => b.resultado === "inconsistente");
  if (tieneInconsistente) return "inconsistente";

  const tieneIncompleto = bolsas.some((b) => b.resultado === "incompleto" || b.resultado === "faltante");
  const tieneSobrante = bolsas.some((b) => b.resultado === "sobrante");
  if (tieneIncompleto) return "incompleto";
  if (tieneSobrante) return "sobrante";
  return "incompleto";
}

let _bolsaSeq = 0;
function makeBolsaId(): string {
  return `bolsa-${++_bolsaSeq}-${Date.now().toString(36)}`;
}

export const useConteoStore = create<ConteoState>()(
  persist(
    (set, get) => ({
      remesas: [],

      initializeConteo: (instanciaId: string) => {
        const existing = get().remesas.find((r) => r.instanciaId === instanciaId);
        if (existing) return;

        const inst = useInstanciasStore.getState().instancias.find((i) => i.id === instanciaId);
        if (!inst) return;

        const template = useTransaccionesStore.getState().procesosFinalizados.find((p) => p.id === inst.templateId);
        if (!template) return;

        const allEntities = useEntitiesStore.getState().entities;
        const origenEnt = allEntities.find((e: any) => e.id === inst.origenId);
        const destinoEnt = allEntities.find((e: any) => e.id === inst.destinoId);

        const divisas = useDivisasStore.getState().divisas;
        const divisa = divisas.find((d) => d.id === inst.divisaId);
        const clasificaciones = useDivisasStore.getState().clasificaciones;

        let envasesRows: any[] = [];
        for (const stepData of Object.values(inst.dataPorEstado)) {
          const raw = stepData["cam-envases"];
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed) && parsed.length > 0) {
                envasesRows = parsed.map((env: any) => ({ ...env, cartaPorte: "" }));
                break;
              }
            } catch { continue; }
          }
          for (const cpField of ["cam-carta-porte-envases-detalle", "cam-carta-porte-envases"]) {
            const rawCp = stepData[cpField];
            if (!rawCp) continue;
            try {
              const parsed = JSON.parse(rawCp);
              if (Array.isArray(parsed) && parsed.length > 0) {
                envasesRows = parsed.flatMap((group: any) =>
                  (group.envases ?? []).map((env: any) => ({ ...env, cartaPorte: group.cartaPorte ?? "" })),
                );
                if (envasesRows.length > 0) break;
              }
            } catch { continue; }
          }
          if (envasesRows.length > 0) break;
        }

        const now = new Date().toLocaleString("es-VE");

        let bolsas: ConteoBolsa[];
        if (envasesRows.length === 0) {
          bolsas = [];
        } else {
          bolsas = envasesRows.map((env: any) => {
            const cla = clasificaciones.find((c) => c.id === env.clasificacionId);
            return {
              bolsaId: makeBolsaId(),
              codigoBolsa: env.envase ?? "",
              precinto: env.precinto ?? "",
              cartaPorte: env.cartaPorte ?? "",
              clasificacionId: env.clasificacionId ?? "",
              clasificacionNombre: cla?.nombre ?? null,
              clasificacionColor: cla?.color ?? "#8b5cf6",
              denominacionesEsperadas: env.denominaciones ?? {},
              denominacionesReales: {},
              resultado: "pendiente",
              fechaConteo: null,
              contadoPor: null,
              observaciones: "",
            };
          });
        }

        const remesa: ConteoRemesa = {
          instanciaId,
          codigoRemesa: inst.codigoRemesa || "",
          templateName: template.nombre,
          origenNombre: origenEnt?.nombre ?? inst.origenId,
          destinoNombre: destinoEnt?.nombre ?? inst.destinoId,
          divisaCodigo: divisa?.codigoISO ?? "",
          divisaSimbolo: divisa?.simbolo ?? "",
          bolsas,
          resultadoFinal: "en_proceso",
          fechaInicio: now,
          fechaCierre: null,
        };

        set((s) => ({ remesas: [...s.remesas, remesa] }));
      },

      actualizarBolsa: (instanciaId, bolsaId, denominacionesReales, contadoPor, observaciones) => {
        set((s) => ({
          remesas: s.remesas.map((r) => {
            if (r.instanciaId !== instanciaId) return r;
            const bolsas = r.bolsas.map((b) => {
              if (b.bolsaId !== bolsaId) return b;
              const resultado = computeResultadoBolsa(b.denominacionesEsperadas, denominacionesReales);
              return {
                ...b,
                denominacionesReales,
                resultado,
                fechaConteo: new Date().toLocaleString("es-VE"),
                contadoPor: contadoPor ?? b.contadoPor,
                observaciones: observaciones ?? b.observaciones,
              };
            });
            return { ...r, bolsas, resultadoFinal: computeResultadoFinal(bolsas) };
          }),
        }));
      },

      confirmarBolsa: (instanciaId, bolsaId) => {
        set((s) => ({
          remesas: s.remesas.map((r) => {
            if (r.instanciaId !== instanciaId) return r;
            const bolsas = r.bolsas.map((b) => {
              if (b.bolsaId !== bolsaId) return b;
              const hasDenoms = Object.keys(b.denominacionesEsperadas).length > 0;
              if (b.resultado === "pendiente" && hasDenoms) return b;
              return { ...b, resultado: "confirmado" as ResultadoConteo };
            });
            return { ...r, bolsas, resultadoFinal: computeResultadoFinal(bolsas) };
          }),
        }));
      },

      cerrarRemesa: (instanciaId) => {
        set((s) => {
          const remesa = s.remesas.find((r) => r.instanciaId === instanciaId);
          if (!remesa) return s;
          const bolsas = remesa.bolsas.map((b) =>
            b.resultado === "pendiente"
              ? { ...b, resultado: "incompleto" as ResultadoConteo }
              : b
          );
          const resultadoFinal = computeResultadoFinal(bolsas);
          return {
            remesas: s.remesas.map((r) =>
              r.instanciaId === instanciaId
                ? { ...r, bolsas, resultadoFinal, fechaCierre: new Date().toLocaleString("es-VE") }
                : r
            ),
          };
        });
      },

      getRemesaByInstancia: (instanciaId) => {
        return get().remesas.find((r) => r.instanciaId === instanciaId);
      },

      getRemesasEnConteo: () => {
        return get().remesas.filter((r) => r.resultadoFinal === "en_proceso");
      },
    }),
    { name: "conteo-store", version: 1 }
  )
);
