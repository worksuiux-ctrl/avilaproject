export type InterfaceStatus = "started" | "stopped";

export type LogType = "success" | "business_error" | "syntax_error";

export type TipoProcesamiento = "Batch" | "Online" | "Near Real-time";

export type ModoEjecucion = "Automático" | "Manual";

export interface InterfaceItem {
  id: string;
  nombre: string;
  descripcion: string;
  icon: string;
  status: InterfaceStatus;
  formato: string;
  tipoProcesamiento: TipoProcesamiento;
  modoEjecucion: ModoEjecucion;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  tipo: LogType;
  archivo: string;
  detalle: string;
}
