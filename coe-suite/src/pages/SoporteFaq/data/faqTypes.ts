export type FaqMediaType = "imagen" | "video" | null;

export interface FaqMedia {
  tipo: FaqMediaType;
  src: string;
  alt?: string;
  poster?: string;
}

export interface FaqItem {
  id: string;
  pregunta: string;
  respuesta: string;
  media?: FaqMedia;
  categoria: string;
}

export interface FaqCategory {
  id: string;
  label: string;
  icon?: string;
  items: FaqItem[];
}