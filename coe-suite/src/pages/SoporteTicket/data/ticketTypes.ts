export interface TicketComment {
  id: string;
  autor: string;
  rol: string;
  mensaje: string;
  timestamp: string;
}

export interface TicketActivity {
  id: string;
  tipo: "creado" | "estado" | "prioridad" | "asignacion" | "sla" | "archivo" | "sistema";
  autor: string;
  detalle: string;
  timestamp: string;
}

export interface TicketFile {
  nombre: string;
  url: string;
  tipo: "imagen" | "video" | "documento";
}

export type TicketPriority = "baja" | "media" | "alta" | "critica";

export type TicketStatus =
  | "nuevo"
  | "abierto"
  | "en-revision-tecnica"
  | "en-certificacion"
  | "resuelto"
  | "cerrado";

export interface Ticket {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  departamento: string;
  prioridad: TicketPriority;
  estado: TicketStatus;
  creadoPor: { nombre: string; avatar?: string };
  asignadoA: { nombre: string; avatar?: string }[];
  fechaCreacion: string;
  slaVencimiento: string;
  archivosAdjuntos: TicketFile[];
  comentarios: TicketComment[];
  actividad: TicketActivity[];
}

export const PRIORIDAD_OPTIONS = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" },
];

export const STATUS_OPTIONS = [
  { value: "nuevo", label: "Nuevo" },
  { value: "abierto", label: "Abierto" },
  { value: "en-revision-tecnica", label: "En Revisión Técnica" },
  { value: "en-certificacion", label: "En Certificación" },
  { value: "resuelto", label: "Resuelto" },
  { value: "cerrado", label: "Cerrado" },
];

export const CATEGORIA_OPTIONS = [
  { value: "conectividad", label: "Conectividad" },
  { value: "software", label: "Software" },
  { value: "hardware", label: "Hardware" },
  { value: "seguridad", label: "Seguridad" },
  { value: "sla", label: "SLA / Incumplimiento" },
  { value: "conciliacion", label: "Conciliación" },
  { value: "otros", label: "Otros" },
];

export const DEPARTAMENTO_OPTIONS = [
  { value: "tesoreria", label: "Tesorería" },
  { value: "operaciones", label: "Operaciones" },
  { value: "contabilidad", label: "Contabilidad" },
  { value: "it", label: "TI / Sistemas" },
  { value: "cumas", label: "Cumplimiento" },
];

export const STATUS_VARIANTS: Record<string, "solid" | "outline" | "success" | "error" | "warning" | "info"> = {
  nuevo: "solid",
  abierto: "info",
  "en-revision-tecnica": "warning",
  "en-certificacion": "outline",
  resuelto: "success",
  cerrado: "error",
};

export const PRIORIDAD_VARIANTS: Record<string, "solid" | "outline" | "success" | "error" | "warning" | "info"> = {
  baja: "outline",
  media: "info",
  alta: "warning",
  critica: "error",
};
