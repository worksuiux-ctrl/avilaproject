import { useState, useMemo } from "react";
import { Card, Badge, Button, Heading, Select } from "@worksuiux-ctrl/my-design-system";
import { CoengineLogo } from "@components/ui/CoengineLogo";
import {
  ChartLine, ArrowLeftRight, CreditCard, Building2,
  BarChart3, RotateCw, Check, Info, ArrowDownWideNarrow,
  Scale, Crown, Zap, Brain, WandSparkles, Send,
  Calculator, FileDown, Satellite, Server, Truck, CalendarDays,
  Bolt, Ban, Moon, Warehouse, Clock,
  FlaskConical,
} from "lucide-react";
import { Chart } from "@components/charts/Chart";
import type { ChartData, ChartOptions } from "chart.js";

type FcTab = "demanda" | "escenarios" | "propuestas" | "cashmanager" | "simulador" | "calibracion";
type CmTab = "oficinas" | "atms" | "acopio";

const divisas = [
  { value: "USD", label: "$ USD" },
  { value: "VED", label: "Bs VED" },
  { value: "EUR", label: "€ EUR" },
];

const modelos = [
  { value: "montecarlo", label: "Montecarlo v3.1" },
  { value: "arima", label: "ARIMA(2,1,2)" },
  { value: "prophet", label: "Prophet FB" },
];

const fcTabs: { id: FcTab; label: string; icon: string }[] = [
  { id: "demanda", label: "Demanda Histórica", icon: "\u{1F4C8}" },
  { id: "escenarios", label: "Escenarios de Decisión", icon: "\u{1F3AF}" },
  { id: "propuestas", label: "Propuestas IA Activas", icon: "\u{1F916}" },
  { id: "cashmanager", label: "Cash Manager", icon: "\u{1F4E1}" },
  { id: "simulador", label: "Simulador de Costos", icon: "\u{1F4B0}" },
  { id: "calibracion", label: "Calibración IA", icon: "\u{1F52C}" },
];

const labels14 = ["01 Jun", "02 Jun", "03 Jun", "04 Jun", "05 Jun", "06 Jun", "07 Jun", "08 Jun", "09 Jun", "10 Jun", "11 Jun", "12 Jun", "13 Jun", "14 Jun"];
const labels7 = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const defaultLineOpts: ChartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 9 }, maxTicksLimit: 8 } },
    y: { grid: { color: "rgba(0,0,0,0.05)" }, ticks: { font: { size: 9 }, callback: (v: unknown) => "$" + Number(v).toLocaleString() } },
  },
};

const defaultBarOpts: ChartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 9 } } },
    y: { grid: { color: "rgba(0,0,0,0.05)" }, ticks: { font: { size: 9 }, callback: (v: unknown) => "$" + Number(v).toLocaleString() } },
  },
};

const escenariosData = [
  {
    id: "A", label: "Reducción de Costos",
    color: "green" as const, gradient: "from-green-500/10 to-transparent" as const, border: "border-green-400" as const,
    icon: ArrowDownWideNarrow,
    desc: "Minimiza el costo logístico consolidando rutas CIT, agrupando remesas y reduciendo frecuencia de servicio. Acepta un nivel de servicio ligeramente inferior a cambio de ahorro operativo.",
    metrics: [
      { label: "Costo CIT estimado", value: "$11,200", color: "text-green-600" },
      { label: "vs. escenario base", value: "-39%", color: "text-green-600" },
      { label: "Remesas propuestas", value: "5", color: "text-amber-600" },
      { label: "Nivel de servicio", value: "91.2%", color: "text-amber-600" },
    ],
  },
  {
    id: "B", label: "Punto de Equilibrio",
    color: "blue" as const, gradient: "from-blue-500/10 to-transparent" as const, border: "border-blue-400" as const,
    icon: Scale,
    desc: "Balancea costo logístico y nivel de servicio. Mantiene los nodos dentro de los límites óptimos sin incurrir en costos de emergencia ni en excesos de inventario inmovilizado.",
    metrics: [
      { label: "Costo CIT estimado", value: "$18,400", color: "text-blue-600" },
      { label: "Esc. de referencia", value: "Base", color: "text-blue-600" },
      { label: "Remesas propuestas", value: "8", color: "text-green-600" },
      { label: "Nivel de servicio", value: "97.8%", color: "text-green-600" },
    ],
  },
  {
    id: "C", label: "Máxima Rentabilidad",
    color: "purple" as const, gradient: "from-purple-500/10 to-transparent" as const, border: "border-purple-400" as const,
    icon: Crown,
    desc: "Maximiza el retorno del capital en efectivo: reduce inventarios inmovilizados, aumenta rotación de cartera e inversiones overnight, priorizando rentabilidad sobre cobertura inmediata.",
    metrics: [
      { label: "Costo CIT estimado", value: "$24,100", color: "text-purple-600" },
      { label: "vs. escenario base", value: "+$8,200", color: "text-purple-600" },
      { label: "Remesas propuestas", value: "12", color: "text-green-600" },
      { label: "Nivel de servicio", value: "99.6%", color: "text-green-600" },
    ],
  },
];

const activeModels = [
  { name: "Gradient Boosting", scope: "ATMs · Demanda por denominación", mae: "1.8%", status: "success" as const },
  { name: "LSTM Neural Net", scope: "Sucursales · Serie de tiempo 72h", mae: "1.5%", status: "success" as const },
  { name: "Prophet + Seasonality", scope: "Estacionalidad calendario · Quincenas · Feriados", mae: "2.1%", status: "success" as const },
  { name: "Montecarlo v3.1", scope: "Red completa · IC 95% · 10K iteraciones", mae: "1.5%", status: "success" as const },
];

const jitSchedule = [
  { nodo: "ATM Sambil", monto: "$72K", hora: "Hoy 14:30", conf: "94%", confColor: "text-green-600" },
  { nodo: "ATM Petare", monto: "$45K", hora: "Hoy 15:00", conf: "91%", confColor: "text-green-600" },
  { nodo: "Suc. Chacao", monto: "$180K", hora: "Mañana 08:00", conf: "88%", confColor: "text-green-600" },
  { nodo: "ATM Ccct", monto: "$65K", hora: "Mañana 10:00", conf: "85%", confColor: "text-amber-600" },
  { nodo: "Acopio Norte", monto: "$1.2M", hora: "Jue 07:00", conf: "82%", confColor: "text-amber-600" },
];

export function CoengineActivity() {
  const [tab, setTab] = useState<FcTab>("demanda");
  const [divisa, setDivisa] = useState("USD");
  const [modelo, setModelo] = useState("montecarlo");
  const [cmTab, setCmTab] = useState<CmTab>("oficinas");

  const chartDemand = useMemo<{ data: ChartData; options: ChartOptions }>(() => ({
    data: {
      labels: labels14,
      datasets: [
        { label: "Real", data: [2.1, 2.3, 2.0, 2.5, 2.7, 2.4, 2.8, 3.0, 2.6, 2.9, 3.1, 2.8, 3.2, 3.4], borderColor: "#22c55e", backgroundColor: "transparent", tension: 0.3, pointRadius: 2 },
        { label: "Pronóstico", data: [2.0, 2.2, 2.1, 2.4, 2.6, 2.5, 2.7, 2.9, 2.7, 2.8, 3.0, 2.9, 3.1, 3.3], borderColor: "#a855f7", backgroundColor: "transparent", borderDash: [4, 3], tension: 0.3, pointRadius: 2 },
        { label: "IC 95% Sup", data: [2.4, 2.6, 2.5, 2.8, 3.0, 2.9, 3.1, 3.3, 3.1, 3.2, 3.4, 3.3, 3.5, 3.7], borderColor: "rgba(168,85,247,0.2)", backgroundColor: "rgba(168,85,247,0.08)", borderDash: [2, 3], pointRadius: 0, fill: "-2" },
        { label: "IC 95% Inf", data: [1.6, 1.8, 1.7, 2.0, 2.2, 2.1, 2.3, 2.5, 2.3, 2.4, 2.6, 2.5, 2.7, 2.9], borderColor: "rgba(168,85,247,0.2)", backgroundColor: "transparent", borderDash: [2, 3], pointRadius: 0 },
      ],
    },
    options: { ...defaultLineOpts, plugins: { ...defaultLineOpts.plugins, legend: { display: true, labels: { font: { size: 8 }, boxWidth: 10, boxHeight: 2, padding: 8 } } } },
  }), []);

  const chartInOut = useMemo<{ data: ChartData; options: ChartOptions }>(() => ({
    data: {
      labels: labels7,
      datasets: [
        { label: "Entradas", data: [1.8, 2.1, 1.6, 2.3, 1.9, 1.2, 0.8], backgroundColor: "rgba(34,197,94,0.6)", borderColor: "#22c55e", borderWidth: 1, borderRadius: 3 },
        { label: "Salidas", data: [1.5, 1.8, 1.4, 2.0, 1.7, 1.4, 1.0], backgroundColor: "rgba(239,68,68,0.6)", borderColor: "#ef4444", borderWidth: 1, borderRadius: 3 },
      ],
    },
    options: defaultBarOpts,
  }), []);

  const chartAtm = useMemo<{ data: ChartData; options: ChartOptions }>(() => ({
    data: {
      labels: labels7,
      datasets: [{ label: "Retiros ($K)", data: [320, 380, 410, 360, 520, 620, 680], borderColor: "#f59e0b", backgroundColor: "rgba(245,158,11,0.1)", fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: "#f59e0b" }],
    },
    options: { ...defaultLineOpts, plugins: { ...defaultLineOpts.plugins, legend: { display: true, labels: { font: { size: 8 }, boxWidth: 10, padding: 8 } } } },
  }), []);

  const chartAgency = useMemo<{ data: ChartData; options: ChartOptions }>(() => ({
    data: {
      labels: labels7,
      datasets: [
        { label: "Depósitos", data: [2.4, 2.8, 2.2, 3.0, 2.6, 1.5, 0.9], backgroundColor: "rgba(34,197,94,0.5)", borderColor: "#22c55e", borderWidth: 1, borderRadius: 3 },
        { label: "Retiros", data: [1.8, 2.2, 1.7, 2.5, 2.1, 1.1, 0.6], backgroundColor: "rgba(59,130,246,0.5)", borderColor: "#3b82f6", borderWidth: 1, borderRadius: 3 },
      ],
    },
    options: { ...defaultBarOpts, plugins: { ...defaultBarOpts.plugins, legend: { display: true, labels: { font: { size: 8 }, boxWidth: 10, padding: 8 } } } },
  }), []);

  const chartEscCompare = useMemo<{ data: ChartData; options: ChartOptions }>(() => ({
    data: {
      labels: ["Costo CIT", "Nivel Servicio", "Remesas", "Ahorro vs Base"],
      datasets: [
        { label: "ESC-A", data: [11.2, 91.2, 5, 39], backgroundColor: "rgba(34,197,94,0.7)", borderRadius: 3 },
        { label: "ESC-B", data: [18.4, 97.8, 8, 0], backgroundColor: "rgba(59,130,246,0.7)", borderRadius: 3 },
        { label: "ESC-C", data: [24.1, 99.6, 12, -20], backgroundColor: "rgba(168,85,247,0.7)", borderRadius: 3 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: true, position: "bottom" as const, labels: { font: { size: 9 }, boxWidth: 10, padding: 8 } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 9 } } },
        y: { grid: { color: "rgba(0,0,0,0.05)" }, ticks: { font: { size: 9 } } },
      },
    },
  }), []);

  const chartEscA = useMemo<{ data: ChartData; options: ChartOptions }>(() => ({
    data: { labels: ["Remesa 1", "Remesa 2", "Remesa 3", "Remesa 4", "Remesa 5"], datasets: [{ label: "Costo", data: [2.1, 1.8, 2.4, 1.6, 2.0], backgroundColor: "rgba(34,197,94,0.6)", borderRadius: 2 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } },
  }), []);
  const chartEscB = useMemo<{ data: ChartData; options: ChartOptions }>(() => ({
    data: { labels: ["R1","R2","R3","R4","R5","R6","R7","R8"], datasets: [{ label: "Costo", data: [1.9, 2.2, 1.7, 2.5, 2.0, 2.3, 1.8, 2.1], backgroundColor: "rgba(59,130,246,0.6)", borderRadius: 2 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } },
  }), []);
  const chartEscC = useMemo<{ data: ChartData; options: ChartOptions }>(() => ({
    data: { labels: ["R1","R2","R3","R4","R5","R6","R7","R8","R9","R10","R11","R12"], datasets: [{ label: "Costo", data: [2.5, 2.8, 2.2, 3.0, 2.6, 2.9, 2.4, 2.7, 3.1, 2.3, 2.8, 3.2], backgroundColor: "rgba(168,85,247,0.6)", borderRadius: 2 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } },
  }), []);
  const chartVolatilidad = useMemo<{ data: ChartData; options: ChartOptions }>(() => ({
    data: { labels: labels7, datasets: [{ label: "σ", data: [125, 148, 110, 165, 138, 92, 78], borderColor: "#f59e0b", backgroundColor: "rgba(245,158,11,0.08)", fill: true, tension: 0.3, pointRadius: 0 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } },
  }), []);
  const chartVelocidad = useMemo<{ data: ChartData; options: ChartOptions }>(() => ({
    data: { labels: ["$100", "$50", "$20", "$10"], datasets: [{ label: "pzas/h", data: [82, 48, 65, 28], backgroundColor: ["rgba(59,130,246,0.7)", "rgba(34,197,94,0.7)", "rgba(245,158,11,0.7)", "rgba(156,163,175,0.7)"], borderRadius: 2 }] },
    options: { indexAxis: "y" as const, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { ticks: { font: { size: 8 } } } } },
  }), []);
  const chartFinde = useMemo<{ data: ChartData; options: ChartOptions }>(() => ({
    data: { labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"], datasets: [
      { label: "Demanda", data: [201, 218, 195, 225, 260, 284, 318], backgroundColor: "rgba(59,130,246,0.6)", borderRadius: 3 },
    ] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } },
  }), []);
  const chartEstacionalidad = useMemo<{ data: ChartData; options: ChartOptions }>(() => ({
    data: { labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"], datasets: [{ label: "Factor", data: [1.12, 1.08, 1.15, 1.22, 1.38, 1.17], borderColor: "#a855f7", tension: 0.3, pointRadius: 0, fill: true, backgroundColor: "rgba(168,85,247,0.06)" }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } },
  }), []);
  const chartRechazo = useMemo<{ data: ChartData; options: ChartOptions }>(() => ({
    data: { labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"], datasets: [{ label: "Rechazo %", data: [2.5, 2.8, 2.6, 3.1, 2.9, 3.5, 3.8], borderColor: "#ef4444", tension: 0.3, pointRadius: 0, fill: true, backgroundColor: "rgba(239,68,68,0.06)" }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } },
  }), []);
  const chartPlazo = useMemo<{ data: ChartData; options: ChartOptions }>(() => ({
    data: { labels: ["BCV", "Corresp", "EUR"], datasets: [{ label: "Días", data: [5, 3, 7], backgroundColor: ["rgba(168,85,247,0.7)", "rgba(59,130,246,0.7)", "rgba(156,163,175,0.7)"], borderRadius: 3 }] },
    options: { indexAxis: "y" as const, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { ticks: { font: { size: 8 } } } } },
  }), []);
  const chartAbsorcion = useMemo<{ data: ChartData; options: ChartOptions }>(() => ({
    data: { labels: ["Norte", "Sur", "Este", "Oeste"], datasets: [{ label: "Ocupación", data: [78, 54, 62, 71], backgroundColor: "rgba(34,197,94,0.6)", borderRadius: 3 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } },
  }), []);
  const chartPrecision = useMemo<{ data: ChartData; options: ChartOptions }>(() => ({
    data: { labels: labels14, datasets: [{ label: "MAE %", data: [2.1, 2.0, 1.8, 1.9, 1.7, 1.6, 1.5, 1.5, 1.4, 1.5, 1.4, 1.3, 1.5, 1.5], borderColor: "#22c55e", tension: 0.3, pointRadius: 0, fill: true, backgroundColor: "rgba(34,197,94,0.08)" }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } },
  }), []);
  const chartTcc = useMemo<{ data: ChartData; options: ChartOptions }>(() => ({
    data: { labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"], datasets: [{ label: "Ratio M/L", data: [4.2, 4.0, 3.95, 3.89], backgroundColor: "rgba(245,158,11,0.6)", borderRadius: 3 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } },
  }), []);
  const chartDisponibilidad = useMemo<{ data: ChartData; options: ChartOptions }>(() => ({
    data: { labels: labels7, datasets: [{ label: "% Disponibilidad", data: [97.5, 98.0, 97.8, 98.2, 98.1, 97.2, 96.8], borderColor: "#14b8a6", tension: 0.3, pointRadius: 2, fill: true, backgroundColor: "rgba(20,184,166,0.08)" }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } },
  }), []);
  const kpiCharts = [chartPrecision, chartTcc, chartDisponibilidad];
  const chartSimCost = useMemo<{ data: ChartData; options: ChartOptions }>(() => ({
    data: { labels: ["Transporte", "Seguro", "Conteo", "Admin", "Combustible"], datasets: [{ label: "Costo", data: [8.2, 3.4, 2.1, 2.8, 1.9], backgroundColor: ["rgba(34,197,94,0.7)", "rgba(59,130,246,0.7)", "rgba(245,158,11,0.7)", "rgba(168,85,247,0.7)", "rgba(20,184,166,0.7)"], borderRadius: 3 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { font: { size: 8 } } }, y: { display: false } } },
  }), []);

  const borderColorMap: Record<string, string> = { green: "border-green-400", blue: "border-blue-400", purple: "border-purple-400" };
  const badgeColorMap: Record<string, string> = { green: "bg-green-100 text-green-700", blue: "bg-blue-100 text-blue-700", purple: "bg-purple-100 text-purple-700" };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CoengineLogo className="w-8 h-8" />
          <div>
            <Heading variant="title" as="h2">COENGINE IA</Heading>
            <p className="text-[11px] text-purple-600 font-semibold mt-0.5">
              Demanda Histórica → Escenarios → Cash Manager → Calibración IA → ML
            </p>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-5 gap-3">
        {([
          { label: "Demanda Total 48h", value: "$24.8M", sub: "Montecarlo v3.1", color: "text-purple-600" },
          { label: "Riesgo Stock-out", value: "14", sub: "Nodos críticos", color: "text-red-600" },
          { label: "Precisión MAE", value: "1.5%", sub: "+0.3% vs anterior", color: "text-green-600" },
          { label: "Balance Red", value: "42% Def / 58% Exc", sub: "", color: "text-amber-600" },
          { label: "Costo Logístico Est.", value: "$18,400", sub: "semana actual", color: "text-teal-600" },
        ]).map((kpi) => (
          <Card key={kpi.label} variant="outlined" padding="sm">
            <p className="text-[9px] text-gray-500 font-semibold uppercase tracking-wide">{kpi.label}</p>
            <p className={`text-lg font-bold mt-0.5 ${kpi.color}`}>{kpi.value}</p>
            {kpi.sub && <p className="text-[9px] text-gray-400 mt-0.5">{kpi.sub}</p>}
          </Card>
        ))}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-gray-200 pb-px overflow-x-auto">
        {fcTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-[11px] font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
              tab === t.id
                ? "bg-white text-purple-700 border border-b-white border-gray-200 -mb-px shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <span className="mr-1.5">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════ TAB: DEMANDA HISTÓRICA ══════════════ */}
      {tab === "demanda" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">Divisa:</span>
            {divisas.map((d) => (
              <button
                key={d.value} onClick={() => setDivisa(d.value)}
                className={`px-3 py-1.5 text-[10px] font-semibold rounded-lg border transition-colors ${divisa === d.value ? "bg-purple-50 border-purple-300 text-purple-700" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
              >{d.label}</button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[9px] text-gray-500">Modelo:</span>
              <Select options={modelos} value={modelo} onChange={setModelo} />
              <Button variant="outline" size="sm"><RotateCw className="w-3 h-3" />Recalibrar</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card variant="outlined" padding="md">
              <div className="flex items-center justify-between mb-2">
                <Heading variant="paragraph" as="h3"><ChartLine className="w-3.5 h-3.5 inline mr-1 text-purple-500" />Demanda Real vs. Pronosticada</Heading>
                <div className="flex gap-2 text-[9px] text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500 inline-block rounded" />Real</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-purple-400 inline-block rounded" />Pronóstico</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 border-t border-dashed border-purple-300 inline-block rounded" />IC 95%</span>
                </div>
              </div>
              <div className="h-[200px]"><Chart type="line" data={chartDemand.data} options={chartDemand.options} height={200} /></div>
            </Card>
            <Card variant="outlined" padding="md">
              <div className="flex items-center justify-between mb-2">
                <Heading variant="paragraph" as="h3"><ArrowLeftRight className="w-3.5 h-3.5 inline mr-1 text-blue-500" />Entradas vs. Salidas — Red Completa</Heading>
                <div className="flex gap-2 text-[9px] text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-green-400/40 border border-green-500 inline-block rounded-sm" />Entradas</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-400/40 border border-red-500 inline-block rounded-sm" />Salidas</span>
                </div>
              </div>
              <div className="h-[200px]"><Chart type="bar" data={chartInOut.data} options={chartInOut.options} height={200} /></div>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card variant="outlined" padding="md">
              <div className="flex items-center justify-between mb-2">
                <Heading variant="paragraph" as="h3"><CreditCard className="w-3.5 h-3.5 inline mr-1 text-amber-500" />Demanda ATMs — Retiros por día</Heading>
              </div>
              <div className="h-[180px]"><Chart type="line" data={chartAtm.data} options={chartAtm.options} height={180} /></div>
            </Card>
            <Card variant="outlined" padding="md">
              <div className="flex items-center justify-between mb-2">
                <Heading variant="paragraph" as="h3"><Building2 className="w-3.5 h-3.5 inline mr-1 text-blue-500" />Demanda Agencia — Depósitos y Retiros</Heading>
              </div>
              <div className="h-[180px]"><Chart type="bar" data={chartAgency.data} options={chartAgency.options} height={180} /></div>
            </Card>
          </div>

          <Card variant="outlined" padding="md">
            <div className="flex items-center justify-between mb-3">
              <Heading variant="paragraph" as="h3"><BarChart3 className="w-3.5 h-3.5 inline mr-1 text-teal-500" />Métricas del Modelo de Pronóstico</Heading>
              <Button variant="outline" size="sm"><RotateCw className="w-3 h-3" />Recalibrar</Button>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {([
                { label: "MAE", value: "1.5%", color: "text-green-600" },
                { label: "MAPE", value: "2.8%", color: "text-green-600" },
                { label: "R²", value: "0.974", color: "text-green-600" },
                { label: "IC 95%", value: "±$320K", color: "text-amber-600" },
                { label: "Iteraciones MC", value: "10K", color: "text-blue-600" },
                { label: "Horizonte", value: "72h", color: "text-purple-600" },
              ]).map((m) => (
                <div key={m.label} className="text-center bg-gray-50 border border-gray-200 rounded-lg p-2.5">
                  <div className={`text-lg font-bold font-mono ${m.color}`}>{m.value}</div>
                  <div className="text-[8px] text-gray-500 uppercase tracking-wider mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ══════════════ TAB: ESCENARIOS ══════════════ */}
      {tab === "escenarios" && (
        <div className="space-y-3">
          <div className="bg-blue-50/50 border border-blue-200/60 rounded-lg p-3 text-[11px] text-gray-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            El modelo evalúa la demanda pronosticada bajo tres estrategias operativas distintas y genera conjuntos de propuestas de remesas óptimas para cada escenario. Selecciona el que mejor se adapte a tu contexto.
          </div>

          <div className="grid grid-cols-3 gap-3">
            {escenariosData.map((esc) => {
              const EscIcon = esc.icon;
              return (
                <Card key={esc.id} variant="outlined" padding="md" className={`border-t-3 ${borderColorMap[esc.color]}`}>
                  <div className={`flex items-center justify-between mb-2 p-1.5 -mx-1.5 -mt-1.5 rounded-t-lg bg-gradient-to-b ${esc.gradient}`}>
                    <Heading variant="paragraph" as="h3"><EscIcon className={`w-3.5 h-3.5 inline mr-1 text-${esc.color}-600`} />{esc.label}</Heading>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${badgeColorMap[esc.color]}`}>ESC-{esc.id}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed mb-3">{esc.desc}</p>
                  <div className="grid grid-cols-2 gap-1.5 mb-3">
                    {esc.metrics.map((m) => (
                      <div key={m.label} className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-center">
                        <div className={`text-sm font-bold font-mono ${m.color}`}>{m.value}</div>
                        <div className="text-[7px] text-gray-400 uppercase tracking-wider mt-0.5">{m.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[8px] text-gray-500 font-semibold uppercase tracking-wider mb-1.5">Propuestas de Remesas</div>
                  <div className="h-12 bg-gray-50 rounded border border-gray-100 flex items-center justify-center text-[9px] text-gray-400 mb-2" id={`props-${esc.id.toLowerCase()}`}>
                    Lista de remesas ESC-{esc.id}
                  </div>
                  <div className="h-[60px] mb-2">
                    {esc.id === "A" && <Chart type="bar" data={chartEscA.data} options={chartEscA.options} height={60} />}
                    {esc.id === "B" && <Chart type="bar" data={chartEscB.data} options={chartEscB.options} height={60} />}
                    {esc.id === "C" && <Chart type="bar" data={chartEscC.data} options={chartEscC.options} height={60} />}
                  </div>
                  <Button variant={esc.id === "A" ? "primary" : "outline"} size="sm" className="w-full justify-center">
                    <Check className="w-3 h-3" />Aprobar Escenario {esc.id}
                  </Button>
                </Card>
              );
            })}
          </div>

          <Card variant="outlined" padding="md">
            <Heading variant="paragraph" as="h3"><BarChart3 className="w-3.5 h-3.5 inline mr-1 text-green-600" />Comparativa de Escenarios</Heading>
            <div className="h-[150px] mt-2"><Chart type="bar" data={chartEscCompare.data} options={chartEscCompare.options} height={150} /></div>
          </Card>
        </div>
      )}

      {/* ══════════════ TAB: PROPUESTAS IA ACTIVAS ══════════════ */}
      {tab === "propuestas" && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            {([
              { label: "Deficitarias", value: "6", sub: "ATMs + Sucursales", color: "text-red-600" },
              { label: "Excedentes", value: "4", sub: "Para redistribuir", color: "text-green-600" },
              { label: "Confianza Media", value: "92.1%", sub: "Montecarlo", color: "text-purple-600" },
              { label: "Remesas sugeridas", value: "8", sub: "pendientes de aprobación", color: "text-green-600" },
            ]).map((kpi) => (
              <Card key={kpi.label} variant="outlined" padding="sm">
                <p className="text-[9px] text-gray-500 font-semibold uppercase tracking-wide">{kpi.label}</p>
                <p className={`text-lg font-bold mt-0.5 ${kpi.color}`}>{kpi.value}</p>
                <p className="text-[9px] text-gray-400 mt-0.5">{kpi.sub}</p>
              </Card>
            ))}
          </div>

          <Card variant="outlined" padding="md">
            <div className="flex items-center justify-between mb-3">
              <Heading variant="paragraph" as="h3"><Zap className="w-3.5 h-3.5 inline mr-1 text-purple-500" />Propuestas Predictivas Activas</Heading>
              <div className="flex items-center gap-2">
                <Button variant="primary" size="sm"><Check className="w-3 h-3" />Aprobar Todas</Button>
                <Badge variant="success" size="sm">8 ACTIVAS</Badge>
              </div>
            </div>
            <div className="space-y-1.5">
              {[
                { nodo: "ATM Sambil", tipo: "Recarga JIT", monto: "$72K", conf: "94%", origen: "Bóveda HQ", cit: "TransValores SA", urgencia: "Alta" },
                { nodo: "ATM Petare", tipo: "Recarga JIT", monto: "$45K", conf: "91%", origen: "Bóveda HQ", cit: "TransValores SA", urgencia: "Alta" },
                { nodo: "Suc. Chacao", tipo: "Remesa preventiva", monto: "$180K", conf: "88%", origen: "Acopio Norte", cit: "Blindados SA", urgencia: "Media" },
                { nodo: "ATM Ccct", tipo: "Recarga JIT", monto: "$65K", conf: "85%", origen: "Bóveda HQ", cit: "TransValores SA", urgencia: "Media" },
                { nodo: "Acopio Norte", tipo: "Retiro excedente", monto: "$1.2M", conf: "82%", origen: "Red Sucursales", cit: "Blindados SA", urgencia: "Baja" },
                { nodo: "Suc. El Marqués", tipo: "Remesa preventiva", monto: "$95K", conf: "90%", origen: "Bóveda Este", cit: "TransValores SA", urgencia: "Media" },
                { nodo: "ATM Los Palos", tipo: "Recarga JIT", monto: "$38K", conf: "87%", origen: "Bóveda HQ", cit: "Seguridad Express", urgencia: "Alta" },
                { nodo: "Suc. Plaza Mayor", tipo: "Remesa programada", monto: "$150K", conf: "79%", origen: "Acopio Sur", cit: "Blindados SA", urgencia: "Baja" },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg hover:border-purple-200 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="text-xs">{p.tipo === "Recarga JIT" ? "\u{26A1}" : p.tipo === "Remesa preventiva" ? "\u{1F6E1}" : "\u{1F4E6}"}</div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-gray-900 truncate">{p.nodo}</p>
                      <p className="text-[9px] text-gray-500 truncate">{p.tipo} · {p.origen} → via {p.cit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-[11px] font-bold text-gray-900">{p.monto}</p>
                      <p className={`text-[9px] ${p.conf >= "90" ? "text-green-600" : p.conf >= "85" ? "text-amber-600" : "text-gray-500"}`}>{p.conf} conf.</p>
                    </div>
                    <Badge variant={p.urgencia === "Alta" ? "warning" : p.urgencia === "Media" ? "info" : "success"} size="sm">{p.urgencia}</Badge>
                    <button className="w-6 h-6 rounded bg-green-50 border border-green-200 text-green-600 flex items-center justify-center text-[10px] hover:bg-green-100"><Check className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ══════════════ TAB: CASH MANAGER ══════════════ */}
      {tab === "cashmanager" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-500/60 flex items-center justify-center text-sm text-white">
                <Satellite className="w-4 h-4" />
              </div>
              <div>
                <Heading variant="paragraph" as="h3">Panel del Cash Manager — Proyección de Demanda</Heading>
                <p className="text-[8px] text-teal-600 font-semibold uppercase tracking-wider mt-0.5">Core · ATMs · CIT · Macro · IA/ML Aprovisionamiento JIT</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="info" size="sm">4 FUENTES ACTIVAS</Badge>
              <Button variant="primary" size="sm"><Brain className="w-3 h-3" />Análisis IA</Button>
            </div>
          </div>

          {/* Sources */}
          <div className="grid grid-cols-4 gap-2.5">
            {([
              { icon: Server, label: "Core Bancario", sub: "Saldos en línea", badge: "SYNC", badgeClass: "bg-green-100 text-green-700", items: [["Inventario físico", "$12.08M", "text-blue-600"], ["En tránsito", "-$647K", "text-amber-600"], ["Última sync", "hace 3 min", ""]] },
              { icon: CreditCard, label: "Monitoreo ATMs", sub: "Red completa", badge: "2 ALERTA", badgeClass: "bg-red-100 text-red-600", items: [["Disponibles", "12 / 14", "text-green-600"], ["Nivel crítico", "2 ATMs", "text-red-600"], ["Stock-out ETA", "4h", "text-red-600"]] },
              { icon: Truck, label: "Rutas CIT Activas", sub: "Transporte valores", badge: "8 RUTAS", badgeClass: "bg-green-100 text-green-700", items: [["En tránsito", "$1.34M", "text-green-600"], ["ETA más urgente", "45 min", "text-amber-600"], ["SLA cumplimiento", "99.2%", "text-green-600"]] },
              { icon: CalendarDays, label: "Macro / Calendario", sub: "Variables externas", badge: "3 EVENTOS", badgeClass: "bg-purple-100 text-purple-700", items: [["Quincena", "En 7 días", "text-purple-600"], ["Tasa USD/VED", "36.42", "text-amber-600"], ["Feriados próx.", "2 (Jun)", ""]] },
            ]).map((src) => {
              const SrcIcon = src.icon;
              return (
                <div key={src.label} className="bg-gray-50/60 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded flex items-center justify-center bg-gray-100"><SrcIcon className="w-3 h-3 text-gray-600" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-bold text-gray-900 truncate">{src.label}</p>
                      <p className="text-[7px] text-gray-500">{src.sub}</p>
                    </div>
                    <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded ${src.badgeClass}`}>{src.badge}</span>
                  </div>
                  {src.items.map(([l, v, c]) => (
                    <div key={l} className="flex justify-between py-0.5 text-[9px] border-t border-gray-100 first:border-t-0">
                      <span className="text-gray-500">{l}</span>
                      <span className={`font-semibold ${c || "text-gray-700"}`}>{v}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* A/B/C Sub-tabs */}
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 bg-amber-400 rounded" />
            <span className="text-[10px] font-bold text-gray-800">Indicadores Clave para la Proyección de la Demanda</span>
          </div>
          <div className="flex gap-1 border-b border-gray-200 pb-px">
            {(["oficinas", "atms", "acopio"] as const).map((t) => (
              <button key={t} onClick={() => setCmTab(t)}
                className={`px-3 py-1.5 text-[10px] font-semibold rounded-t-lg transition-colors ${cmTab === t ? "bg-white text-teal-700 border border-b-white border-gray-200 -mb-px shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
              >{t === "oficinas" ? "\u{1F3E6} A. Oficinas y Sucursales" : t === "atms" ? "\u{1F7E7} B. Cajeros Automáticos" : "\u{1F3DB} C. Centros de Acopio"}</button>
            ))}
          </div>

          {/* A: Oficinas */}
          {cmTab === "oficinas" && (
            <div className="grid grid-cols-3 gap-3">
              <Card variant="outlined" padding="md">
                <div className="flex items-center justify-between mb-2">
                  <Heading variant="paragraph" as="h3"><BarChart3 className="w-3 h-3 inline mr-1 text-blue-500" />Volatilidad Flujo Neto Diario</Heading>
                  <Badge variant="warning" size="sm">MEDIA-ALTA</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-gray-50 rounded-lg p-2 text-center"><p className="text-[7px] text-gray-500 uppercase">σ Diaria USD</p><p className="text-sm font-bold font-mono text-amber-600">±$142K</p></div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center"><p className="text-[7px] text-gray-500 uppercase">CV</p><p className="text-sm font-bold font-mono text-amber-600">18.4%</p></div>
                </div>
                <div className="h-[80px]"><Chart type="line" data={chartVolatilidad.data} options={chartVolatilidad.options} height={80} /></div>
                <p className="text-[8px] text-gray-400 mt-1.5 px-1.5 py-1 bg-gray-50 rounded"><strong className="text-gray-700">Def.:</strong> Desviación estándar del flujo neto diario. Meta: CV &lt;15%.</p>
              </Card>
              <Card variant="outlined" padding="md">
                <div className="flex items-center justify-between mb-2">
                  <Heading variant="paragraph" as="h3"><CalendarDays className="w-3 h-3 inline mr-1 text-purple-500" />Estacionalidad y Eventos</Heading>
                  <Badge variant="success" size="sm">3 PRÓXIMOS</Badge>
                </div>
                <div className="space-y-1 mb-2">
                  {[
                    { name: "Quincena Empresas", impact: "+38%", days: "7d", badge: "bg-purple-100 text-purple-700" },
                    { name: "Feriado Nacional", impact: "+22%", days: "14d", badge: "bg-amber-100 text-amber-700" },
                    { name: "Fin de Mes", impact: "+17%", days: "13d", badge: "bg-green-100 text-green-700" },
                  ].map((ev) => (
                    <div key={ev.name} className="flex items-center justify-between p-1.5 bg-gray-50 border border-gray-100 rounded">
                      <span className="text-[9px] text-gray-800">{ev.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold font-mono text-purple-600">{ev.impact}</span>
                        <span className={`text-[7px] font-bold px-1 py-0.5 rounded ${ev.badge}`}>{ev.days}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="h-[70px]"><Chart type="line" data={chartEstacionalidad.data} options={chartEstacionalidad.options} height={70} /></div>
                <p className="text-[8px] text-gray-400 mt-1.5 px-1.5 py-1 bg-gray-50 rounded"><strong className="text-gray-700">Def.:</strong> Factor multiplicador de demanda asociado a eventos de calendario.</p>
              </Card>
              <Card variant="outlined" padding="md">
                <div className="flex items-center justify-between mb-2">
                  <Heading variant="paragraph" as="h3"><Building2 className="w-3 h-3 inline mr-1 text-teal-500" />Retiros ME vs. Moneda Local</Heading>
                  <Badge variant="success" size="sm">USD 68%</Badge>
                </div>
                <div className="space-y-1 mb-2">
                  {[
                    { label: "USD", pct: "68.2%", bar: "w-[68%]", color: "bg-green-500" },
                    { label: "VED", pct: "27.4%", bar: "w-[27%]", color: "bg-green-400" },
                    { label: "EUR", pct: "4.4%", bar: "w-[4%]", color: "bg-purple-400" },
                  ].map((c) => (
                    <div key={c.label}>
                      <div className="flex justify-between text-[9px]"><span className="text-gray-800">{c.label}</span><span className="font-semibold">{c.pct}</span></div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${c.color}`} style={{ width: c.pct }} /></div>
                    </div>
                  ))}
                </div>
                <p className="text-[8px] text-gray-400 mt-1.5 px-1.5 py-1 bg-gray-50 rounded"><strong className="text-gray-700">Def.:</strong> Proporción de retiros en moneda extranjera vs local.</p>
              </Card>
            </div>
          )}

          {/* B: ATMs */}
          {cmTab === "atms" && (
            <div className="grid grid-cols-3 gap-3">
              <Card variant="outlined" padding="md">
                <Heading variant="paragraph" as="h3" className="mb-2"><Bolt className="w-3 h-3 inline mr-1 text-amber-500" />Velocidad de Consumo por Denominación</Heading>
                <div className="space-y-1 mb-2">
                  {[
                    { denom: "$100", pzas: "82 pzas/h", pct: 82, color: "bg-blue-500" },
                    { denom: "$50", pzas: "48 pzas/h", pct: 48, color: "bg-green-400" },
                    { denom: "$20", pzas: "65 pzas/h", pct: 65, color: "bg-amber-400" },
                    { denom: "$10", pzas: "28 pzas/h", pct: 28, color: "bg-gray-400" },
                  ].map((d) => (
                    <div key={d.denom} className="flex items-center gap-2 text-[9px]">
                      <span className="w-6 font-bold text-gray-800">{d.denom}</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${d.color}`} style={{ width: `${d.pct}%` }} /></div>
                      <span className="w-16 text-right font-mono text-gray-600">{d.pzas}</span>
                    </div>
                  ))}
                </div>
                <div className="h-[80px]"><Chart type="bar" data={chartVelocidad.data} options={chartVelocidad.options} height={80} /></div>
                <p className="text-[8px] text-gray-400 mt-1.5 px-1.5 py-1 bg-gray-50 rounded"><strong className="text-gray-700">Def.:</strong> Piezas dispensadas por hora. Determina mix óptimo de carga por cassette.</p>
              </Card>
              <Card variant="outlined" padding="md">
                <div className="flex items-center justify-between mb-2">
                  <Heading variant="paragraph" as="h3"><Ban className="w-3 h-3 inline mr-1 text-red-500" />Tasa de Rechazo de Billetes</Heading>
                  <Badge variant="warning" size="sm">2.8% prom.</Badge>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  {[
                    { label: "Red prom.", value: "2.8%", color: "text-amber-600" },
                    { label: "ATM peor", value: "7.1%", color: "text-red-600", sub: "Petare" },
                    { label: "Falsos", value: "0.12%", color: "text-red-600" },
                    { label: "Meta", value: "<2%", color: "text-gray-500" },
                  ].map((m) => (
                    <div key={m.label} className="bg-gray-50 rounded p-2 text-center">
                      <div className={`text-sm font-bold font-mono ${m.color}`}>{m.value}</div>
                      <div className="text-[7px] text-gray-500 uppercase">{m.label}</div>
                      {m.sub && <div className="text-[7px] text-gray-400">{m.sub}</div>}
                    </div>
                  ))}
                </div>
                <div className="h-[80px]"><Chart type="line" data={chartRechazo.data} options={chartRechazo.options} height={80} /></div>
                <p className="text-[8px] text-gray-400 mt-1.5 px-1.5 py-1 bg-gray-50 rounded"><strong className="text-gray-700">Def.:</strong> % de billetes rechazados por el lector óptico del ATM.</p>
              </Card>
              <Card variant="outlined" padding="md">
                <div className="flex items-center justify-between mb-2">
                  <Heading variant="paragraph" as="h3"><Moon className="w-3 h-3 inline mr-1 text-blue-500" />Ciclo Medio Retiro — Fin de Semana</Heading>
                  <Badge variant="warning" size="sm">+41%</Badge>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  {[
                    { label: "Sáb/ATM", value: "284", color: "text-blue-600" },
                    { label: "Dom/ATM", value: "318", color: "text-blue-600" },
                    { label: "vs semana", value: "+41%", color: "text-amber-600" },
                    { label: "Sin CIT Dom", value: "8 ATMs", color: "text-red-600" },
                  ].map((m) => (
                    <div key={m.label} className="bg-gray-50 rounded p-2 text-center">
                      <div className={`text-sm font-bold font-mono ${m.color}`}>{m.value}</div>
                      <div className="text-[7px] text-gray-500 uppercase">{m.label}</div>
                    </div>
                  ))}
                </div>
                <div className="h-[80px]"><Chart type="bar" data={chartFinde.data} options={chartFinde.options} height={80} /></div>
                <p className="text-[8px] text-gray-400 mt-1.5 px-1.5 py-1 bg-gray-50 rounded"><strong className="text-gray-700">Def.:</strong> Demanda media por ATM sáb/dom. Determina carga requerida el viernes.</p>
              </Card>
            </div>
          )}

          {/* C: Acopio */}
          {cmTab === "acopio" && (
            <div className="grid grid-cols-2 gap-3">
              <Card variant="outlined" padding="md">
                <div className="flex items-center justify-between mb-2">
                  <Heading variant="paragraph" as="h3"><Warehouse className="w-3 h-3 inline mr-1 text-green-500" />Capacidad de Absorción de Retornos</Heading>
                  <Badge variant="success" size="sm">68% DISP.</Badge>
                </div>
                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  {[
                    { label: "Capacidad máx.", value: "$22M", color: "text-gray-900" },
                    { label: "Ocupado", value: "$14.2M", color: "text-amber-600" },
                    { label: "Disponible", value: "$7.8M", color: "text-green-600" },
                  ].map((m) => (
                    <div key={m.label} className="bg-gray-50 rounded p-2 text-center">
                      <div className={`text-xs font-bold font-mono ${m.color}`}>{m.value}</div>
                      <div className="text-[7px] text-gray-500 uppercase mt-0.5">{m.label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1 mb-2">
                  {[
                    { label: "Acopio Norte", pct: 78, color: "bg-amber-400" },
                    { label: "Acopio Sur", pct: 54, color: "bg-green-500" },
                  ].map((a) => (
                    <div key={a.label}>
                      <div className="flex justify-between text-[9px]"><span className="text-gray-700">{a.label}</span><span>{a.pct}%</span></div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${a.color}`} style={{ width: `${a.pct}%` }} /></div>
                    </div>
                  ))}
                </div>
                <div className="h-[80px]"><Chart type="bar" data={chartAbsorcion.data} options={chartAbsorcion.options} height={80} /></div>
                <p className="text-[8px] text-gray-400 mt-1.5 px-1.5 py-1 bg-gray-50 rounded"><strong className="text-gray-700">Def.:</strong> Capacidad física restante. Ocupación &gt;85% genera riesgo de rechazo.</p>
              </Card>
              <Card variant="outlined" padding="md">
                <div className="flex items-center justify-between mb-2">
                  <Heading variant="paragraph" as="h3"><Clock className="w-3 h-3 inline mr-1 text-purple-500" />Plazo de Aprovisionamiento Externo</Heading>
                  <Badge variant="warning" size="sm">BCV: 5 días</Badge>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  {[
                    { label: "BCV (VED)", value: "5d", color: "text-purple-600" },
                    { label: "Corresp. USD", value: "3d", color: "text-blue-600" },
                    { label: "EUR (Int.)", value: "7d", color: "text-gray-500" },
                    { label: "Próxima solicitud", value: "HOY", color: "text-red-600", sub: "VED bajo mínimo" },
                  ].map((m) => (
                    <div key={m.label} className="bg-gray-50 rounded p-2 text-center">
                      <div className={`text-sm font-bold font-mono ${m.color}`}>{m.value}</div>
                      <div className="text-[7px] text-gray-500 uppercase">{m.label}</div>
                      {m.sub && <div className="text-[7px] text-red-500">{m.sub}</div>}
                    </div>
                  ))}
                </div>
                <div className="h-[80px]"><Chart type="bar" data={chartPlazo.data} options={chartPlazo.options} height={80} /></div>
                <p className="text-[8px] text-gray-400 mt-1.5 px-1.5 py-1 bg-gray-50 rounded"><strong className="text-gray-700">Def.:</strong> Días hábiles entre solicitud de aprovisionamiento y disponibilidad.</p>
              </Card>
            </div>
          )}

          {/* IA/ML JIT */}
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 bg-green-400 rounded" />
            <span className="text-[10px] font-bold text-gray-800">IA / ML — Aprovisionamiento Justo a Tiempo (JIT)</span>
            <Badge variant="success" size="sm">ACTIVO</Badge>
            <Badge variant="info" size="sm">MODO SUGERENCIA</Badge>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Card variant="outlined" padding="md">
              <div className="flex items-center justify-between mb-2">
                <Heading variant="paragraph" as="h3"><Zap className="w-3 h-3 inline mr-1 text-green-600" />Motor JIT Automático</Heading>
                <Badge variant="success" size="sm">CORRIENDO</Badge>
              </div>
              <div className="bg-green-50/50 border border-green-200/60 rounded-lg p-2.5 mb-2 text-[9px]">
                <p className="text-[7px] font-bold text-green-700 uppercase mb-1">Siguiente Acción Sugerida</p>
                <p className="text-gray-900 font-medium">Abastecer ATM Sambil + ATM Petare vía V-041</p>
                <p className="text-gray-500 mt-0.5">Monto: $72K + $45K | Origen: Bóveda HQ</p>
                <p className="text-gray-500">CIT: TransValores SA | Salida: 14:30 hoy</p>
                <p className="text-green-700 mt-1 text-[8px]">Modelo: Gradient Boost + Series de Tiempo · Conf. 94%</p>
              </div>
              <div className="text-[9px] space-y-0.5 border-t border-gray-100 pt-2">
                <div className="flex justify-between"><span className="text-gray-500">Ciclo actualización</span><span className="font-semibold">Cada 15 min</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Ventana proyección</span><span className="font-semibold">72 horas</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Acciones sugeridas hoy</span><span className="font-semibold text-green-600">5</span></div>
              </div>
              <Button variant="primary" size="sm" className="w-full justify-center mt-2"><Check className="w-3 h-3" />Aprobar Sugerencia JIT</Button>
            </Card>
            <Card variant="outlined" padding="md">
              <Heading variant="paragraph" as="h3" className="mb-2"><Brain className="w-3 h-3 inline mr-1 text-purple-500" />Modelos ML Activos</Heading>
              <div className="space-y-1.5">
                {activeModels.map((m) => (
                  <div key={m.name} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-100 rounded-lg">
                    <div><p className="text-[10px] font-semibold text-gray-900">{m.name}</p><p className="text-[8px] text-gray-500">{m.scope}</p></div>
                    <div className="flex items-center gap-1.5"><span className="text-[9px] font-mono text-green-600 font-semibold">MAE {m.mae}</span><Badge variant={m.status} size="sm">Activo</Badge></div>
                  </div>
                ))}
              </div>
            </Card>
            <Card variant="outlined" padding="md">
              <Heading variant="paragraph" as="h3" className="mb-2"><CalendarDays className="w-3 h-3 inline mr-1 text-teal-500" />JIT Programado — 72h</Heading>
              <div className="overflow-x-auto">
                <table className="w-full text-[9px]">
                  <thead><tr className="border-b border-gray-200"><th className="text-left py-1 text-gray-500 font-semibold">Nodo</th><th className="text-right py-1 text-gray-500 font-semibold">Monto</th><th className="text-right py-1 text-gray-500 font-semibold">Hora</th><th className="text-right py-1 text-gray-500 font-semibold">Conf.</th></tr></thead>
                  <tbody>
                    {jitSchedule.map((row) => (
                      <tr key={row.nodo} className="border-b border-gray-100">
                        <td className="py-1 font-medium text-gray-900">{row.nodo}</td>
                        <td className="py-1 text-right font-mono text-green-600 font-semibold">{row.monto}</td>
                        <td className="py-1 text-right text-amber-600">{row.hora}</td>
                        <td className={`py-1 text-right font-semibold ${row.confColor}`}>{row.conf}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button variant="primary" size="sm" className="w-full justify-center mt-2"><Check className="w-3 h-3" />Aprobar Plan JIT Completo</Button>
            </Card>
          </div>

          {/* KPIs Calidad */}
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 bg-blue-500 rounded" />
            <span className="text-[10px] font-bold text-gray-800">KPIs de Calidad del Cash Manager</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {([
              {
                icon: BarChart3, color: "text-green-600", title: "Precisión del Pronóstico", badge: "EXCELENTE", badgeClass: "bg-green-100 text-green-700",
                metrics: [
                  { label: "MAPE Red", value: "1.5%", color: "text-green-600", sub: "Meta: <3%" },
                  { label: "Bias", value: "+0.4%", color: "text-amber-600" },
                  { label: "R²", value: "0.974", color: "text-green-600" },
                  { label: "Hit Rate ±5%", value: "94%", color: "text-green-600" },
                ],
                def: "MAPE entre demanda pronosticada y real. Hit Rate: % de días con error <±5%."
              },
              {
                icon: BarChart3, color: "text-amber-600", title: "Total Cost of Cash", badge: "OPTIMIZAR", badgeClass: "bg-amber-100 text-amber-700",
                metrics: [
                  { label: "Costo Mant./mes", value: "$71,620", color: "text-amber-600" },
                  { label: "Costo Logístico", value: "$18,400", color: "text-amber-600" },
                  { label: "Ratio M/L", value: "3.89×", color: "text-green-600", sub: "Meta: <4×" },
                  { label: "vs Benchmark", value: "+19%", color: "text-red-600" },
                ],
                def: "Relación costo mantenimiento vs costo logístico. Ratio <4× = gestión eficiente."
              },
              {
                icon: BarChart3, color: "text-teal-600", title: "Disponibilidad Efectiva", badge: "98.2%", badgeClass: "bg-teal-100 text-teal-700",
                metrics: [
                  { label: "ATMs", value: "97.8%", color: "text-teal-600", sub: "Meta ≥98%" },
                  { label: "Sucursales", value: "100%", color: "text-green-600" },
                  { label: "Downtime sem.", value: "2.1h", color: "text-amber-600" },
                  { label: "SLA CIT", value: "99.2%", color: "text-green-600" },
                ],
                def: "% del tiempo con efectivo disponible. Downtime incluye stock-outs y fallas técnicas."
              },
            ]).map((kpi, idx) => (
              <Card key={kpi.title} variant="outlined" padding="md">
                <div className="flex items-center justify-between mb-2">
                  <Heading variant="paragraph" as="h3"><kpi.icon className={`w-3 h-3 inline mr-1 ${kpi.color}`} />{kpi.title}</Heading>
                  <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded ${kpi.badgeClass}`}>{kpi.badge}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  {kpi.metrics.map((m) => (
                    <div key={m.label} className="bg-gray-50 rounded p-1.5 text-center">
                      <div className={`text-sm font-bold font-mono ${m.color}`}>{m.value}</div>
                      <div className="text-[7px] text-gray-500 uppercase">{m.label}</div>
                      {m.sub && <div className="text-[7px] text-gray-400">{m.sub}</div>}
                    </div>
                  ))}
                </div>
                <div className="h-[70px]"><Chart type="line" data={kpiCharts[idx].data} options={kpiCharts[idx].options} height={70} /></div>
                <p className="text-[8px] text-gray-400 mt-1.5 px-1.5 py-1 bg-gray-50 rounded"><strong className="text-gray-700">Def.:</strong> {kpi.def}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ TAB: SIMULADOR DE COSTOS ══════════════ */}
      {tab === "simulador" && (
        <div className="grid grid-cols-[1fr_1fr] gap-3">
          <div className="space-y-3">
            <Card variant="outlined" padding="md">
              <div className="flex items-center justify-between mb-3">
                <Heading variant="paragraph" as="h3"><Calculator className="w-3.5 h-3.5 inline mr-1 text-teal-500" />Simulador de Costos CIT</Heading>
              </div>
              <div className="bg-teal-50/50 border border-teal-200/60 rounded-lg p-2.5 mb-3 text-[9px] text-gray-600">
                <Info className="w-3 h-3 inline mr-1 text-teal-600" />
                Los tarifarios se cargan desde <strong className="text-gray-900">Configuraciones → Límites & Cupos</strong>. Ajusta parámetros y haz clic en <em>Calcular</em>.
              </div>
              <p className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider mb-2">Tarifario Activo (desde Config.)</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 mb-3 space-y-1.5">
                {[
                  { label: "Ruta Metropolitana", id: "tar-metro", value: "120", unit: "$/parada" },
                  { label: "Ruta Interior", id: "tar-int", value: "280", unit: "$/servicio" },
                  { label: "Servicio Emergencia", id: "tar-emg", value: "450", unit: "$/servicio" },
                  { label: "Seguro de Carga (%)", id: "tar-seg", value: "0.15", unit: "% del monto" },
                  { label: "Conteo / Verificación", id: "tar-cteo", value: "85", unit: "$/servicio" },
                ].map((t) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-600">{t.label}</span>
                    <div className="flex items-center gap-1">
                      <input className="w-16 px-1.5 py-0.5 text-[10px] text-right font-mono border border-gray-200 rounded bg-white" defaultValue={t.value} />
                      <span className="text-[8px] text-gray-400">{t.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider mb-2">Parámetros de la Simulación</p>
              <div className="space-y-2">
                <Select label="Tipo de Operación" options={[
                  { value: "metro", label: "Ruta Metropolitana" },
                  { value: "interior", label: "Ruta Interior" },
                  { value: "mixta", label: "Mixta (50/50)" },
                  { value: "emergencia", label: "Emergencia" },
                ]} value="metro" onChange={() => {}} />
                <div className="grid grid-cols-2 gap-2">
                  <Select label="N° de Remesas" options={Array.from({ length: 20 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))} value="8" onChange={() => {}} />
                  <Select label="Paradas por ruta" options={Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))} value="3" onChange={() => {}} />
                </div>
                <Select label="Monto total a transportar ($)" options={[
                  { value: "500000", label: "$500K" }, { value: "1200000", label: "$1.2M" },
                  { value: "2500000", label: "$2.5M" }, { value: "5000000", label: "$5M" },
                ]} value="1200000" onChange={() => {}} />
                <Select label="Frecuencia (días por semana)" options={[
                  { value: "5", label: "5 días (L–V)" }, { value: "6", label: "6 días" },
                  { value: "7", label: "7 días" }, { value: "3", label: "3 días" },
                ]} value="5" onChange={() => {}} />
              </div>
              <Button variant="primary" size="sm" className="w-full justify-center mt-3"><Calculator className="w-3 h-3" />Calcular</Button>
            </Card>
          </div>
          <div className="space-y-3">
            <Card variant="outlined" padding="md">
              <Heading variant="paragraph" as="h3" className="mb-3"><FileDown className="w-3.5 h-3.5 inline mr-1 text-green-600" />Resultado de la Simulación</Heading>
              <div className="grid grid-cols-2 gap-2 mb-3" id="sim-results">
                {[
                  { label: "Costo por Remesa", value: "$—", color: "text-green-600" },
                  { label: "Costo Total Semanal", value: "$—", color: "text-green-600" },
                  { label: "Seguro de Carga", value: "$—", color: "text-amber-600" },
                  { label: "Costo Mensual Est.", value: "$—", color: "text-amber-600" },
                  { label: "Costo / $M Transportado", value: "$—", color: "text-blue-600" },
                  { label: "Ahorro vs. Emergencia", value: "$—", color: "text-green-600" },
                ].map((r) => (
                  <div key={r.label} className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-center">
                    <div className={`text-sm font-bold font-mono ${r.color}`}>{r.value}</div>
                    <div className="text-[7px] text-gray-500 uppercase tracking-wider mt-0.5">{r.label}</div>
                  </div>
                ))}
              </div>
              <div className="h-[140px] mb-2"><Chart type="bar" data={chartSimCost.data} options={chartSimCost.options} height={140} /></div>
              <div className="bg-blue-50/50 border border-blue-200/60 rounded-lg p-2 text-[9px] text-gray-600 mb-2">
                <Info className="w-3 h-3 inline mr-1 text-blue-500" />
                Ajusta los parámetros y haz clic en <em>Calcular</em> para ver el desglose.
              </div>
              <Button variant="primary" size="sm" className="w-full justify-center"><FileDown className="w-3 h-3" />Exportar Simulación</Button>
            </Card>
          </div>
        </div>
      )}

      {/* ══════════════ TAB: CALIBRACIÓN IA ══════════════ */}
      {tab === "calibracion" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-300/40 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-purple-400/60 flex items-center justify-center text-lg text-white">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <Heading variant="paragraph" as="h3">Calibración Automática con IA</Heading>
                <p className="text-[8px] text-purple-600 font-semibold uppercase tracking-wider mt-0.5">Claude · Análisis de Modelo Montecarlo · Recomendaciones Adaptativas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="info" size="sm">LISTO</Badge>
              <Button variant="primary" size="sm"><WandSparkles className="w-3 h-3" />Calibrar Modelo</Button>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_1.4fr] gap-3">
            {/* Left */}
            <div className="space-y-3">
              <Card variant="outlined" padding="md">
                <div className="flex items-center justify-between mb-3">
                  <Heading variant="paragraph" as="h3"><FlaskConical className="w-3 h-3 inline mr-1 text-purple-500" />Parámetros Actuales del Modelo</Heading>
                  <Badge variant="info" size="sm">Montecarlo v3.1</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: "MAE Actual", value: "1.5%", color: "text-green-600" },
                    { label: "R²", value: "0.974", color: "text-green-600" },
                    { label: "MAPE", value: "2.8%", color: "text-amber-600" },
                    { label: "Iteraciones MC", value: "10,000", color: "text-gray-900" },
                  ].map((m) => (
                    <div key={m.label} className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                      <div className={`text-sm font-bold font-mono ${m.color}`}>{m.value}</div>
                      <div className="text-[7px] text-gray-500 uppercase mt-0.5">{m.label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-[8px] text-gray-500 font-semibold uppercase tracking-wider mb-2">Parámetros Ajustables</p>
                <div className="space-y-2">
                  <Select label="Horizonte de pronóstico (horas)" options={[
                    { value: "24", label: "24h" }, { value: "48", label: "48h" },
                    { value: "72", label: "72h" }, { value: "168", label: "7 días" },
                  ]} value="48" onChange={() => {}} />
                  <Select label="Ventana histórica (días)" options={[
                    { value: "30", label: "30 días" }, { value: "60", label: "60 días" },
                    { value: "90", label: "90 días" }, { value: "180", label: "180 días" },
                  ]} value="90" onChange={() => {}} />
                  <Select label="Nodos en análisis" options={[
                    { value: "all", label: "Toda la red (142)" }, { value: "atms", label: "Solo ATMs" },
                    { value: "suc", label: "Solo Sucursales" }, { value: "corp", label: "Solo Corporativos" },
                  ]} value="all" onChange={() => {}} />
                  <div>
                    <p className="text-[10px] font-semibold text-gray-600 mb-1">Contexto adicional para IA</p>
                    <input className="w-full px-2 py-1.5 text-[10px] border border-gray-200 rounded-lg bg-white" placeholder="Ej. semana de quincena, feriados, evento especial..." />
                  </div>
                </div>
              </Card>
              <Card variant="outlined" padding="md">
                <Heading variant="paragraph" as="h3" className="mb-2"><Clock className="w-3 h-3 inline mr-1 text-gray-500" />Historial de Calibraciones</Heading>
                <div className="space-y-0.5 max-h-[160px] overflow-y-auto">
                  {[
                    { title: "Calibración inicial", date: "15/05/2026 · Manual", mae: "MAE 1.5%", badge: "Aplicada", badgeClass: "bg-green-100 text-green-700" },
                    { title: "Ajuste ventana 90d", date: "10/05/2026 · IA", mae: "MAE 1.8%", badge: "Descartada", badgeClass: "bg-amber-100 text-amber-700" },
                    { title: "Optimización parámetros", date: "05/05/2026 · IA", mae: "MAE 1.6%", badge: "Aplicada", badgeClass: "bg-green-100 text-green-700" },
                    { title: "Revisión manual", date: "28/04/2026 · Operador", mae: "MAE 2.0%", badge: "Aplicada", badgeClass: "bg-green-100 text-green-700" },
                  ].map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border-b border-gray-100 last:border-b-0">
                      <div><p className="text-[9px] font-medium text-gray-900">{h.title}</p><p className="text-[8px] text-gray-500">{h.date}</p></div>
                      <div className="text-right"><p className="text-[9px] text-green-600 font-mono font-semibold">{h.mae}</p><span className={`text-[7px] font-bold px-1 py-0.5 rounded ${h.badgeClass}`}>{h.badge}</span></div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right: Chat */}
            <Card variant="outlined" padding="md" className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-3">
                <Heading variant="paragraph" as="h3"><Brain className="w-3.5 h-3.5 inline mr-1 text-purple-500" />Asistente de Calibración — Claude</Heading>
                <div className="flex items-center gap-1.5">
                  <button className="w-6 h-6 rounded bg-gray-100 border border-gray-200 text-gray-500 flex items-center justify-center text-[9px] hover:bg-gray-200" title="Limpiar chat"><RotateCw className="w-3 h-3" /></button>
                  <Button variant="primary" size="sm" className="hidden"><Check className="w-3 h-3" />Aplicar Recomendaciones</Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[380px] flex flex-col gap-2.5 mb-3">
                <div className="self-start max-w-[90%]">
                  <div className="bg-purple-50/70 border border-purple-200/50 rounded-xl rounded-bl-sm p-2.5 text-[10px] text-gray-700 leading-relaxed">
                    <p>👋 Hola. Soy el asistente de calibración de modelos COE.</p>
                    <p className="mt-1">Puedo analizar el rendimiento del modelo Montecarlo actual, detectar sesgos en las predicciones, sugerir ajustes de parámetros (ventana histórica, iteraciones, IC) y comparar con modelos alternativos (ARIMA, Prophet).</p>
                    <p className="mt-1">Haz clic en <strong className="text-purple-700">Calibrar Modelo</strong> para que analice los datos actuales, o escríbeme una pregunta específica.</p>
                  </div>
                  <p className="text-[7px] text-gray-400 mt-1">Claude COE · ahora</p>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-gray-200 pt-2.5">
                <input className="flex-1 px-2.5 py-1.5 text-[10px] border border-gray-200 rounded-lg bg-white" placeholder="Pregunta sobre el modelo, datos atípicos, estacionalidad..." />
                <button className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-[11px] hover:bg-purple-700"><Send className="w-3 h-3" /></button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
