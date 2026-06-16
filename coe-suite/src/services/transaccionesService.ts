import type { ProcesoTransaccional } from "@stores/transaccionesStore";
import { fetchFromApi } from "./api";

/* ── Demo data ── */
export function getDemoProcesos(): ProcesoTransaccional[] {
  return [
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
      usaCodigoRemesa: true,
      usaCodigoEnvio: true,
      codigoRemesaFormato: "REM-{YYYYMMDD}-{NNNNNN}",
      codigoEnvioFormato: "ENV-{YYYYMMDD}-{NNNNNN}",
      activo: true,
      steps: [],
    },
  ];
}

export async function fetchProcesos(): Promise<ProcesoTransaccional[]> {
  try {
    return await fetchFromApi<ProcesoTransaccional[]>("procesos_transaccionales");
  } catch {
    return getDemoProcesos();
  }
}
