export type TipoIntegracion = "API" | "Webhook" | "ETL" | "API / Librería" | "API / Intercambio seguro";

export type EstadoIntegracion = "Activo" | "Inactivo";

export interface IntegrationItem {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: TipoIntegracion;
  estado: EstadoIntegracion;
  icon: string;
  color: string;
}
