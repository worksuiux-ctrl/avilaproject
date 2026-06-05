export interface KpiScorecard {
  id: string;
  label: string;
  value: string;
  subtext: string;
  color: string;
}

export interface KpiIedCurrency {
  moneda: string;
  color: string;
  posicion: string;
  captaciones: string;
  ied: string;
  meta: string;
  status: "ok" | "bajo" | "deficit";
}

export interface KpiMasaAnual {
  moneda: string;
  value: string;
  growth: string;
  color: string;
}

export interface KpiMasaMensualStat {
  label: string;
  value: string;
  subtext?: string;
  color: string;
}

export interface KpiDenomRow {
  denom: string;
  aptas: number;
  noAptas: number;
  total: number;
}

export interface KpiRegionRow {
  region: string;
  aptas: number;
  noAptas: number;
  total: number;
}

export interface KpiCostoOportunidad {
  ocioso: string;
  costoDiario: string;
  costoSemanal: string;
  badgeText: string;
  badgeVariant: "warning" | "error" | "success";
}

export interface KpiMargenFinanciero {
  ingresos: string;
  costos: string;
  margenNeto: string;
  ratio: string;
  badgeText: string;
  badgeVariant: "success" | "warning" | "error";
}

export interface KpiLcrCurrency {
  moneda: string;
  value: string;
  pct: number;
  color: string;
  status: "ok" | "bajo" | "excedente";
}

export interface KpiFxExposure {
  totalUsd: string;
  sensibilidad: string;
  var: string;
}

export interface KpiCostoTotal {
  total: string;
  desglose: { label: string; value: number; color: string }[];
}

export interface KpiSlaTransportista {
  total: number;
  enSla: number;
  fueraSla: number;
  promedio: string;
  cumplimiento: string;
  incidencias: { cit: string; ruta: string; exceso: string; motivo: string }[];
}

export const KPI_SCORECARDS: KpiScorecard[] = [
  { id: "efectivo-total", label: "Efectivo Total Gestionado", value: "$68.2M", subtext: "Consolidado todas divisas", color: "#0d9488" },
  { id: "masa-monetaria", label: "Masa Monetaria Total", value: "$51.5M", subtext: "USD equivalente", color: "#2563eb" },
  { id: "ied-global", label: "IED Global", value: "1.82×", subtext: "Meta: 3.0×", color: "#f59e0b" },
  { id: "costo-oportunidad", label: "Costo Oportunidad", value: "$1,643/día", subtext: "Efectivo ocioso $4.8M", color: "#ef4444" },
  { id: "margen-financiero", label: "Margen Fin. Neto", value: "+$28,360", subtext: "Ratio 1.43×", color: "#14b8a6" },
  { id: "lcr-consolidado", label: "LCR Consolidado", value: "115%", subtext: "Mín. regulatorio 100%", color: "#8b5cf6" },
];

export const KPI_IED_CURRENCIES: KpiIedCurrency[] = [
  { moneda: "USD", color: "#0d9488", posicion: "$14.20M", captaciones: "$4.80M", ied: "2.96", meta: "≥ 3.0×", status: "bajo" },
  { moneda: "VED", color: "#f59e0b", posicion: "Bs.D 1,280M", captaciones: "Bs.D 820M", ied: "1.56", meta: "≥ 3.0×", status: "deficit" },
  { moneda: "EUR", color: "#8b5cf6", posicion: "€387K", captaciones: "€98K", ied: "3.95", meta: "≥ 3.0×", status: "ok" },
];

export const KPI_MASA_ANUAL: KpiMasaAnual[] = [
  { moneda: "USD", value: "$14.2M", growth: "+10.9% YoY", color: "#22c55e" },
  { moneda: "VED", value: "Bs.D 890M", growth: "+30.9% YoY", color: "#f59e0b" },
  { moneda: "EUR", value: "€390K", growth: "+39.3% YoY", color: "#8b5cf6" },
];

export const KPI_MASA_MENSUAL_STATS: KpiMasaMensualStat[] = [
  { label: "Hoy", value: "$51.5M", color: "#3b82f6" },
  { label: "Máx", value: "$53.4M", subtext: "15 May", color: "#22c55e" },
  { label: "Mín", value: "$47.8M", subtext: "2 May", color: "#ef4444" },
  { label: "Prom", value: "$50.7M", color: "#6b7280" },
];

export const KPI_DENOM_DATA: Record<string, KpiDenomRow[]> = {
  USD: [
    { denom: "$100", aptas: 42500, noAptas: 850, total: 43350 },
    { denom: "$50", aptas: 32800, noAptas: 490, total: 33290 },
    { denom: "$20", aptas: 15600, noAptas: 312, total: 15912 },
    { denom: "$10", aptas: 8900, noAptas: 0, total: 8900 },
  ],
  VED: [
    { denom: "Bs 500", aptas: 184000, noAptas: 9200, total: 193200 },
    { denom: "Bs 200", aptas: 120000, noAptas: 3600, total: 123600 },
    { denom: "Bs 100", aptas: 98000, noAptas: 1960, total: 99960 },
    { denom: "Bs 50", aptas: 45000, noAptas: 0, total: 45000 },
    { denom: "Bs 20", aptas: 28000, noAptas: 0, total: 28000 },
  ],
  EUR: [
    { denom: "€100", aptas: 2450, noAptas: 36, total: 2486 },
    { denom: "€50", aptas: 1800, noAptas: 18, total: 1818 },
    { denom: "€20", aptas: 920, noAptas: 0, total: 920 },
    { denom: "€10", aptas: 450, noAptas: 0, total: 450 },
  ],
};

export const KPI_REGION_DATA: Record<string, KpiRegionRow[]> = {
  USD: [
    { region: "Capital", aptas: 38500, noAptas: 770, total: 39270 },
    { region: "Centro", aptas: 22400, noAptas: 340, total: 22740 },
    { region: "Occidente", aptas: 18200, noAptas: 270, total: 18470 },
    { region: "Oriente", aptas: 14700, noAptas: 0, total: 14700 },
    { region: "Los Andes", aptas: 6200, noAptas: 95, total: 6295 },
  ],
  VED: [
    { region: "Capital", aptas: 182000, noAptas: 9100, total: 191100 },
    { region: "Centro", aptas: 96000, noAptas: 2900, total: 98900 },
    { region: "Occidente", aptas: 78000, noAptas: 1600, total: 79600 },
    { region: "Oriente", aptas: 65000, noAptas: 980, total: 65980 },
    { region: "Los Andes", aptas: 44000, noAptas: 0, total: 44000 },
  ],
  EUR: [
    { region: "Capital", aptas: 2100, noAptas: 32, total: 2132 },
    { region: "Centro", aptas: 1200, noAptas: 14, total: 1214 },
    { region: "Occidente", aptas: 850, noAptas: 0, total: 850 },
    { region: "Oriente", aptas: 520, noAptas: 8, total: 528 },
    { region: "Los Andes", aptas: 280, noAptas: 0, total: 280 },
  ],
};

export const KPI_COSTO_OPORTUNIDAD: KpiCostoOportunidad = {
  ocioso: "$4.8M",
  costoDiario: "$1,643",
  costoSemanal: "$11,501",
  badgeText: "ALTO",
  badgeVariant: "warning",
};

export const KPI_MARGEN_FINANCIERO: KpiMargenFinanciero = {
  ingresos: "+$48,200",
  costos: "-$19,840",
  margenNeto: "+$28,360",
  ratio: "1.43×",
  badgeText: "POSITIVO",
  badgeVariant: "success",
};

export const KPI_LCR_CURRENCIES: KpiLcrCurrency[] = [
  { moneda: "USD", value: "142%", pct: 100, color: "#3b82f6", status: "ok" },
  { moneda: "VED", value: "88%", pct: 88, color: "#f59e0b", status: "bajo" },
  { moneda: "EUR", value: "215%", pct: 100, color: "#8b5cf6", status: "excedente" },
];

export const KPI_FX_EXPOSURE: KpiFxExposure = {
  totalUsd: "+$2.1M",
  sensibilidad: "±$180K",
  var: "-$42,000",
};

export const KPI_COSTO_TOTAL: KpiCostoTotal = {
  total: "$89,420/mes",
  desglose: [
    { label: "Transporte CIT", value: 38400, color: "#3b82f6" },
    { label: "Personal", value: 24500, color: "#f59e0b" },
    { label: "Seguridad", value: 12400, color: "#ef4444" },
    { label: "Tecnología", value: 8200, color: "#8b5cf6" },
    { label: "Costo Oportunidad", value: 5920, color: "#22c55e" },
  ],
};

export const CHART_IED_LINE = {
  labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  datasets: [
    {
      label: "USD",
      data: [2.4, 2.6, 2.8, 2.7, 2.9, 3.0, 2.96],
      borderColor: "#0d9488",
      backgroundColor: "rgba(13,148,136,0.08)",
      fill: true,
      tension: 0.3,
      pointRadius: 2,
    },
    {
      label: "VED",
      data: [1.8, 1.7, 1.6, 1.5, 1.4, 1.5, 1.56],
      borderColor: "#f59e0b",
      backgroundColor: "rgba(245,158,11,0.08)",
      fill: true,
      tension: 0.3,
      pointRadius: 2,
    },
    {
      label: "EUR",
      data: [3.2, 3.4, 3.6, 3.8, 3.9, 4.0, 3.95],
      borderColor: "#8b5cf6",
      backgroundColor: "rgba(139,92,246,0.08)",
      fill: true,
      tension: 0.3,
      pointRadius: 2,
    },
  ],
};

export const CHART_IED_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: true, bodyFont: { size: 9 }, padding: 4 } },
  scales: {
    x: { ticks: { font: { size: 8 }, color: "#9ca3af" }, grid: { display: false } },
    y: { beginAtZero: true, ticks: { font: { size: 8 }, color: "#9ca3af", maxTicksLimit: 5 }, grid: { color: "#f3f4f6" } },
  },
};

export const CHART_MASA_ANUAL_LINE = {
  labels: ["Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May"],
  datasets: [
    {
      label: "USD ($M)",
      data: [12.8, 13.1, 13.4, 13.0, 13.5, 13.8, 14.0, 13.7, 13.9, 14.1, 14.0, 14.2],
      borderColor: "#22c55e",
      tension: 0.3,
      pointRadius: 1.5,
    },
    {
      label: "EUR (€K)",
      data: [280, 300, 310, 325, 340, 355, 360, 370, 375, 380, 385, 390],
      borderColor: "#8b5cf6",
      tension: 0.3,
      pointRadius: 1.5,
    },
    {
      label: "VED (Bs.D M)",
      data: [680, 710, 740, 760, 790, 810, 830, 840, 860, 870, 880, 890],
      borderColor: "#f59e0b",
      borderDash: [4, 3],
      tension: 0.3,
      pointRadius: 1.5,
    },
  ],
};

export const CHART_MASA_ANUAL_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: true, bodyFont: { size: 9 }, padding: 4 } },
  scales: {
    x: { ticks: { font: { size: 7 }, color: "#9ca3af", maxTicksLimit: 12 }, grid: { display: false } },
    y: { ticks: { font: { size: 8 }, color: "#9ca3af", maxTicksLimit: 5 }, grid: { color: "#f3f4f6" } },
  },
};

export const CHART_MASA_MENSUAL_BAR = {
  labels: ["1", "3", "5", "7", "9", "11", "13", "15", "17", "19", "21", "23", "25", "27", "29", "31"],
  datasets: [
    {
      label: "USD eq.",
      data: [49.2, 50.1, 48.5, 51.0, 50.8, 49.5, 52.1, 53.4, 51.8, 50.5, 49.8, 51.2, 52.0, 50.2, 47.8, 51.5],
      backgroundColor: "rgba(59,130,246,0.5)",
      borderColor: "#3b82f6",
      borderWidth: 1,
      borderRadius: 2,
    },
  ],
};

export const CHART_MASA_MENSUAL_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: true, bodyFont: { size: 9 }, padding: 4 } },
  scales: {
    x: { ticks: { font: { size: 7 }, color: "#9ca3af", maxTicksLimit: 8 }, grid: { display: false } },
    y: { ticks: { font: { size: 8 }, color: "#9ca3af", maxTicksLimit: 5 }, grid: { color: "#f3f4f6" } },
  },
};

export const CHART_COO_LINE = {
  labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  datasets: [
    {
      label: "Costo $/día",
      data: [1200, 1450, 1380, 1643, 1580, 1420, 1500],
      borderColor: "#f59e0b",
      backgroundColor: "rgba(245,158,11,0.08)",
      fill: true,
      tension: 0.3,
      pointRadius: 2,
    },
  ],
};

export const CHART_COO_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: true, bodyFont: { size: 9 }, padding: 4 } },
  scales: {
    x: { ticks: { font: { size: 8 }, color: "#9ca3af" }, grid: { display: false } },
    y: { ticks: { font: { size: 8 }, color: "#9ca3af", maxTicksLimit: 4, callback: (v: any) => `$${v}` }, grid: { color: "#f3f4f6" } },
  },
};

export const CHART_MFN_BAR = {
  labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5"],
  datasets: [
    {
      label: "Ingresos",
      data: [42000, 45800, 48200, 47500, 49000],
      backgroundColor: "rgba(34,197,94,0.6)",
      borderRadius: 2,
    },
    {
      label: "Costos",
      data: [18000, 19200, 19840, 18500, 17500],
      backgroundColor: "rgba(239,68,68,0.6)",
      borderRadius: 2,
    },
  ],
};

export const CHART_MFN_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: true, bodyFont: { size: 9 }, padding: 4 } },
  scales: {
    x: { ticks: { font: { size: 8 }, color: "#9ca3af" }, grid: { display: false } },
    y: { ticks: { font: { size: 8 }, color: "#9ca3af", maxTicksLimit: 4, callback: (v: any) => `$${(v / 1000).toFixed(0)}K` }, grid: { color: "#f3f4f6" } },
  },
};

export const CHART_LCR_BAR = {
  labels: ["USD", "VED", "EUR"],
  datasets: [
    {
      label: "LCR %",
      data: [142, 88, 215],
      backgroundColor: ["rgba(59,130,246,0.6)", "rgba(245,158,11,0.6)", "rgba(139,92,246,0.6)"],
      borderRadius: 2,
    },
  ],
};

export const CHART_LCR_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true, bodyFont: { size: 9 }, padding: 4 },
    annotation: {
      annotations: {
        line100: { type: "line", yMin: 100, yMax: 100, borderColor: "#ef4444", borderWidth: 1, borderDash: [4, 3] },
      },
    },
  },
  scales: {
    x: { ticks: { font: { size: 8 }, color: "#9ca3af" }, grid: { display: false } },
    y: { ticks: { font: { size: 8 }, color: "#9ca3af", maxTicksLimit: 4, callback: (v: any) => `${v}%` }, grid: { color: "#f3f4f6" }, beginAtZero: true },
  },
};

export const CHART_FX_LINE = {
  labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  datasets: [
    {
      label: "Exposición ($)",
      data: [1.8, 2.0, 1.9, 2.1, 2.0, 2.2, 2.1],
      borderColor: "#f59e0b",
      backgroundColor: "rgba(245,158,11,0.08)",
      fill: true,
      tension: 0.3,
      pointRadius: 2,
    },
  ],
};

export const CHART_FX_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: true, bodyFont: { size: 9 }, padding: 4 } },
  scales: {
    x: { ticks: { font: { size: 8 }, color: "#9ca3af" }, grid: { display: false } },
    y: { ticks: { font: { size: 8 }, color: "#9ca3af", maxTicksLimit: 4, callback: (v: any) => `$${v}M` }, grid: { color: "#f3f4f6" } },
  },
};

export const CHART_CTGE_DOUGHNUT = {
  labels: ["Transporte CIT", "Personal", "Seguridad", "Tecnología", "Costo Oportunidad"],
  datasets: [
    {
      data: [38400, 24500, 12400, 8200, 5920],
      backgroundColor: ["#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#22c55e"],
      borderWidth: 0,
    },
  ],
};

export const CHART_CTGE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "right" as const, labels: { font: { size: 8 }, boxWidth: 8, padding: 6, color: "#6b7280" } },
    tooltip: { enabled: true, bodyFont: { size: 9 }, padding: 4, callbacks: { label: (ctx: any) => `$${(ctx.parsed / 1000).toFixed(1)}K` } },
  },
  cutout: "55%",
};

export const CHART_SLA_BAR = {
  labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
  datasets: [
    {
      label: "En SLA",
      data: [38, 41, 39, 41],
      backgroundColor: "rgba(34,197,94,0.6)",
      borderRadius: 2,
    },
    {
      label: "Fuera SLA",
      data: [10, 7, 9, 7],
      backgroundColor: "rgba(239,68,68,0.6)",
      borderRadius: 2,
    },
  ],
};

export const CHART_SLA_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: true, bodyFont: { size: 9 }, padding: 4 } },
  scales: {
    x: { ticks: { font: { size: 8 }, color: "#9ca3af" }, grid: { display: false } },
    y: { stacked: true, ticks: { font: { size: 8 }, color: "#9ca3af", maxTicksLimit: 4 }, grid: { color: "#f3f4f6" } },
  },
};

export const KPI_SLA_TRANSPORTISTAS: KpiSlaTransportista = {
  total: 48,
  enSla: 41,
  fueraSla: 7,
  promedio: "3.2h",
  cumplimiento: "85.4%",
  incidencias: [
    { cit: "CIT-B", ruta: "Valencia → HQ", exceso: "+2.4h", motivo: "Tráfico / cierre vía" },
    { cit: "CIT-C", ruta: "Maracaibo → Valencia", exceso: "+3.8h", motivo: "Falla mecánica" },
    { cit: "CIT-C", ruta: "Mérida → Caracas", exceso: "+1.2h", motivo: "Protocolo seguridad" },
  ],
};
