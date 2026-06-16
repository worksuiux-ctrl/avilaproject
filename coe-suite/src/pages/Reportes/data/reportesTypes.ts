export type CategoriaReporte = "plantilla" | "regulatorio";

export interface ReporteColumn {
  key: string;
  label: string;
  dataType: "text" | "number" | "date";
  visible: boolean;
  order: number;
}

export interface ReporteRow {
  id: string;
  [key: string]: unknown;
}

export interface Reporte {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: CategoriaReporte;
  columns: ReporteColumn[];
  data: ReporteRow[];
}

export interface SavedReporte {
  id: string;
  nombre: string;
  reporteBaseId: string;
  folderId: string;
  columnConfig: {
    key: string;
    label: string;
    visible: boolean;
    order: number;
  }[];
  createdAt: string;
  tipo: "reporte" | "dashboard";
}

export interface Carpeta {
  id: string;
  nombre: string;
  parentId: string | null;
}

export type AggregationType = "sum" | "avg" | "count" | "max" | "min" | "countUnique";

export interface ColumnAggregation {
  columnKey: string;
  type: AggregationType;
}

export interface GroupByConfig {
  columnKey: string;
  enabled: boolean;
}

export type ChartType =
  | "bar" | "line" | "pie" | "row" | "area" | "combo"
  | "detail" | "map" | "scatter" | "waterfall" | "sankey"
  | "number" | "pivot" | "trend" | "counter" | "progress"
  | "funnel";

export interface ChartConfig {
  chartType: ChartType;
  title: string;
  xAxis: string[];
  yAxis: string[];
  category?: string[];
  valueColumn?: string;
  locationColumn?: string;
  sourceColumn?: string;
  targetColumn?: string;
  stageColumn?: string;
  dateColumn?: string;
  targetValue?: string;
  pivotRows?: string[];
  pivotColumns?: string[];
  pivotValues?: string[];
  detailColumns?: string[];
}

export interface DashboardWidget {
  id: string;
  title: string;
  config: ChartConfig;
}

export interface Dashboard {
  id: string;
  nombre: string;
  folderId: string;
  reportId: string;
  widgets: DashboardWidget[];
  createdAt: string;
}
