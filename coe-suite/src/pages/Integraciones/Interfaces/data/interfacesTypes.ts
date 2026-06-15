export type InterfaceStatus = "started" | "stopped";

export type LogType = "success" | "business_error" | "syntax_error";

export interface InterfaceItem {
  id: string;
  nombre: string;
  descripcion: string;
  icon: string;
  status: InterfaceStatus;
  formato: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  tipo: LogType;
  archivo: string;
  detalle: string;
}
