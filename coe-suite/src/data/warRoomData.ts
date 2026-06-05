export type Moneda = "USD" | "EUR" | "VES";
export type WrStatus = "normal" | "alerta" | "critico";
export type WrTab = "divisas" | "bolivares";
export type WrAlarmType = "red" | "amber" | "green";

export interface WrDenomEntry {
  pzAp: number;
  pzNo: number;
  apto: number;
  noApto: number;
}

export type WrDenomMap = Record<string, WrDenomEntry>;

export interface WrCurrencyDetail {
  apto: number;
  noApto: number;
  denoms: WrDenomMap;
}

export interface WrTransit {
  amount: number;
  ops: number;
}

export interface WrTransitData {
  usd: WrTransit;
  eur: WrTransit;
  ves: WrTransit;
}

export interface WrKpiItem {
  id: string;
  label: string;
  value: string;
  subtext: string;
  color: string;
  progress: number;
  isTransit?: boolean;
}

export interface WrProduct {
  key: string;
  name: string;
  icon: string;
  usdApto: number;
  usdNoApto: number;
  eurApto: number;
  eurNoApto: number;
  detail?: {
    USD: WrCurrencyDetail;
    EUR: WrCurrencyDetail;
  };
}

export interface WrRedUnit {
  id: string;
  name: string;
  status: WrStatus;
  usdApto: number;
  eurApto: number;
  vesApto?: number;
  vesNoApto?: number;
  vesDenoms?: WrDenomMap;
  cupoMax?: number;
  fill?: number;
}

export interface WrRedGroup {
  key: string;
  name: string;
  units: WrRedUnit[];
  usdApto: number;
  eurApto: number;
  status: WrStatus;
  vesApto?: number;
  vesNoApto?: number;
}

export interface WrCompromiso {
  ref: string;
  cliente: string;
  tipo: "Depósito" | "Retiro";
  moneda: Moneda;
  producto: string;
  monto: number;
  piezas: number;
  agencia: string;
  semana: string;
  fecha: string;
  estado: "Pendiente" | "Aprobado" | "Rechazado";
  decision?: string;
}

export interface WrAlarm {
  id: string;
  type: WrAlarmType;
  title: string;
  body: string;
  actions: string[];
}

export interface WrBank {
  key: string;
  name: string;
  monto: number;
}

export interface WrTransporter {
  key: string;
  name: string;
  costo: number;
  velocidad: number;
  score: number;
}

export const WR_USD_DENOMS = [
  { k: "B100", label: "$100", val: 100 },
  { k: "B50", label: "$50", val: 50 },
  { k: "B20", label: "$20", val: 20 },
  { k: "B10", label: "$10", val: 10 },
];

export const WR_EUR_DENOMS = [
  { k: "E100", label: "€100", val: 100 },
  { k: "E50", label: "€50", val: 50 },
  { k: "E20", label: "€20", val: 20 },
  { k: "E10", label: "€10", val: 10 },
];

export const WR_VES_DENOMS = [
  { k: "B500", label: "Bs 500", val: 500 },
  { k: "B200", label: "Bs 200", val: 200 },
  { k: "B100", label: "Bs 100", val: 100 },
  { k: "B50", label: "Bs 50", val: 50 },
  { k: "B20", label: "Bs 20", val: 20 },
];

function makeDenoms(base: number, count: number, varPct = 0.2): WrDenomMap {
  const map: WrDenomMap = {};
  const list = [...WR_USD_DENOMS, ...WR_EUR_DENOMS, ...WR_VES_DENOMS];
  const used = list.slice(0, count);
  let remaining = base;
  used.forEach((d, i) => {
    const share = i === used.length - 1 ? remaining : Math.round(base * ((1 - varPct * Math.random()) / used.length));
    const pzAp = Math.round(share / d.val * (0.7 + 0.2 * Math.random()));
    const pzNo = Math.round(pzAp * 0.05 * Math.random());
    map[d.k] = { pzAp, pzNo, apto: pzAp * d.val, noApto: pzNo * d.val };
    remaining -= share;
  });
  return map;
}

export const WR_PROD: WrProduct[] = [
  {
    key: "mesaCambio", name: "Mesa de Cambio", icon: "MC", usdApto: 800000, usdNoApto: 20000, eurApto: 330000, eurNoApto: 10000,
    detail: {
      USD: { apto: 800000, noApto: 20000, denoms: makeDenoms(800000, 4) },
      EUR: { apto: 330000, noApto: 10000, denoms: makeDenoms(330000, 4) },
    },
  },
  {
    key: "custodia", name: "Custodia", icon: "CU", usdApto: 1240000, usdNoApto: 0, eurApto: 175000, eurNoApto: 5000,
    detail: {
      USD: { apto: 1240000, noApto: 0, denoms: makeDenoms(1240000, 4) },
      EUR: { apto: 175000, noApto: 5000, denoms: makeDenoms(175000, 4) },
    },
  },
  {
    key: "garantia", name: "Garantía", icon: "GA", usdApto: 630000, usdNoApto: 0, eurApto: 210000, eurNoApto: 0,
    detail: {
      USD: { apto: 630000, noApto: 0, denoms: makeDenoms(630000, 4) },
      EUR: { apto: 210000, noApto: 0, denoms: makeDenoms(210000, 4) },
    },
  },
  {
    key: "intervencion", name: "Intervención Cambiaria", icon: "IC", usdApto: 780000, usdNoApto: 14400, eurApto: 101800, eurNoApto: 0,
    detail: {
      USD: { apto: 780000, noApto: 14400, denoms: makeDenoms(780000, 4) },
      EUR: { apto: 101800, noApto: 0, denoms: makeDenoms(101800, 4) },
    },
  },
  {
    key: "posicionPropia", name: "Posición Propia", icon: "PP", usdApto: 1342000, usdNoApto: 0, eurApto: 412000, eurNoApto: 0,
    detail: {
      USD: { apto: 1342000, noApto: 0, denoms: makeDenoms(1342000, 4) },
      EUR: { apto: 412000, noApto: 0, denoms: makeDenoms(412000, 4) },
    },
  },
];

function makeVesDenoms(apto: number): WrDenomMap {
  const map: WrDenomMap = {};
  const denomKeys = [
    { k: "B500", val: 500 }, { k: "B200", val: 200 }, { k: "B100", val: 100 },
    { k: "B50", val: 50 }, { k: "B20", val: 20 },
  ];
  let rem = apto;
  denomKeys.forEach((d, i) => {
    if (i === denomKeys.length - 1) {
      const pz = rem > 0 ? Math.round(rem / d.val) : 0;
      map[d.k] = { pzAp: pz, pzNo: 0, apto: pz * d.val, noApto: 0 };
    } else {
      const share = Math.round(apto * (0.15 + 0.1 * Math.random()));
      const pz = Math.round(share / d.val);
      map[d.k] = { pzAp: pz, pzNo: Math.round(pz * 0.02), apto: pz * d.val, noApto: Math.round(pz * 0.02) * d.val };
      rem -= share;
    }
  });
  return map;
}

export const WR_RED: WrRedGroup[] = [
  {
    key: "agencias", name: "Agencias", status: "alerta",
    usdApto: 3120000, eurApto: 720000,
    vesApto: 22400000, vesNoApto: 3200000,
    units: [
      { id: "agPrincipal", name: "Principal", status: "normal", usdApto: 1800000, eurApto: 420000, vesApto: 12000000, vesNoApto: 1200000, cupoMax: 15000000, vesDenoms: makeVesDenoms(12000000) },
      { id: "agAltamira", name: "Altamira", status: "alerta", usdApto: 820000, eurApto: 180000, vesApto: 6400000, vesNoApto: 1400000, cupoMax: 10000000, vesDenoms: makeVesDenoms(6400000) },
      { id: "agLPG", name: "LPG", status: "alerta", usdApto: 500000, eurApto: 120000, vesApto: 4000000, vesNoApto: 600000, cupoMax: 8000000, vesDenoms: makeVesDenoms(4000000) },
    ],
  },
  {
    key: "acopios", name: "Centros de Acopio", status: "critico",
    usdApto: 940000, eurApto: 240000,
    vesApto: 14400000, vesNoApto: 4200000,
    units: [
      { id: "caNorte", name: "Acopio Norte", status: "alerta", usdApto: 540000, eurApto: 140000, vesApto: 8000000, vesNoApto: 1800000, cupoMax: 12000000, vesDenoms: makeVesDenoms(8000000) },
      { id: "caSur", name: "Acopio Sur", status: "critico", usdApto: 400000, eurApto: 100000, vesApto: 6400000, vesNoApto: 2400000, cupoMax: 10000000, vesDenoms: makeVesDenoms(6400000) },
    ],
  },
  {
    key: "atms", name: "ATMs", status: "alerta",
    usdApto: 0, eurApto: 0,
    units: [],
  },
];

export const WR_TRANSIT: WrTransitData = {
  usd: { amount: 380000, ops: 3 },
  eur: { amount: 52000, ops: 1 },
  ves: { amount: 4200000, ops: 5 },
};

export const WR_COMMITMENTS: WrCompromiso[] = [
  { ref: "C-001", cliente: "Distribuidora Los Andes", tipo: "Retiro", moneda: "USD", producto: "Efectivo USD", monto: 45000, piezas: 450, agencia: "Principal", semana: "S-1", fecha: "2026-06-05", estado: "Pendiente" },
  { ref: "C-002", cliente: "Bodegón El Tesoro", tipo: "Depósito", moneda: "VES", producto: "Mixto", monto: 2800000, piezas: 1120, agencia: "Altamira", semana: "S-1", fecha: "2026-06-05", estado: "Aprobado", decision: "Tes. Principal" },
  { ref: "C-003", cliente: "Farmasaúde C.A.", tipo: "Retiro", moneda: "USD", producto: "Efectivo USD", monto: 22000, piezas: 220, agencia: "LPG", semana: "S-2", fecha: "2026-06-06", estado: "Pendiente" },
  { ref: "C-004", cliente: "Supermercado El Sol", tipo: "Depósito", moneda: "VES", producto: "Efectivo VES", monto: 1500000, piezas: 750, agencia: "Principal", semana: "S-2", fecha: "2026-06-06", estado: "Rechazado", decision: "Por saldo" },
  { ref: "C-005", cliente: "Textilera Nacional", tipo: "Retiro", moneda: "EUR", producto: "Efectivo EUR", monto: 18000, piezas: 180, agencia: "Altamira", semana: "S-2", fecha: "2026-06-07", estado: "Pendiente" },
];

export const WR_ALARMS: WrAlarm[] = [
  { id: "a1", type: "red", title: "CRÍTICO — Centro Acopio Sur USD bajo cupo mínimo", body: "Saldo $48,200 — déficit $101,800 respecto al cupo mínimo de $150,000", actions: ["Canje banco", "Traslado seguro", "Notificar"] },
  { id: "a2", type: "red", title: "SIN COBERTURA — Distribuidora Los Andes — 2026-06-05", body: "Compromiso C-001 por $45,000 no tiene cobertura asignada", actions: ["Ver opciones", "Notificar Tesorería"] },
  { id: "a3", type: "amber", title: "PARCIAL — Farmasaúde C.A. — 2026-06-06", body: "Compromiso C-003 cubierto al 60% ($13,200/$22,000)", actions: ["Ver opciones"] },
  { id: "a4", type: "green", title: "INFO — 2 de 5 compromisos cubiertos en S-1", body: "Progreso: 40% de cobertura para la semana en curso", actions: [] },
];

export const WR_BANKS: WrBank[] = [
  { key: "bcv", name: "BCV — Banco Central de Venezuela", monto: 5000000 },
  { key: "bvz", name: "Banco de Venezuela", monto: 1200000 },
  { key: "banesco", name: "Banesco", monto: 900000 },
  { key: "bbva", name: "BBVA Provincial", monto: 750000 },
  { key: "mercantil", name: "Mercantil", monto: 600000 },
  { key: "tesoro", name: "Banco del Tesoro", monto: 400000 },
];

export const WR_TRANSPORTERS: WrTransporter[] = [
  { key: "blindadosNa", name: "Blindados Nacionales", costo: 2400, velocidad: 85, score: 92 },
  { key: "transvalores", name: "TransValores", costo: 2100, velocidad: 78, score: 85 },
  { key: "prosegur", name: "Prosegur", costo: 1800, velocidad: 72, score: 78 },
  { key: "blindadosSa", name: "Blindados SA", costo: 1950, velocidad: 80, score: 88 },
  { key: "logiCash", name: "LogiCash Express", costo: 1600, velocidad: 65, score: 72 },
];

export const POINT_LABELS: Record<string, string> = {
  agPrincipal: "Principal", agAltamira: "Altamira", agLPG: "LPG",
  caNorte: "Acopio Norte", caSur: "Acopio Sur",
};

export function formatCurrency(val: number, moneda: Moneda = "USD"): string {
  if (moneda === "VES") return `Bs ${(val / 1_000_000).toFixed(1)}M`;
  if (moneda === "EUR") return `€${(val / 1_000).toFixed(0)}K`;
  return `$${(val / 1_000).toFixed(0)}K`;
}

export function compactCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val}`;
}
